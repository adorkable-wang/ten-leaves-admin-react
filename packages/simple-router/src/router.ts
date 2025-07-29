import type { BlockerFunction, RouterState } from '@remix-run/router';
import { createBrowserRouter, createHashRouter, createMemoryRouter } from 'react-router-dom';
import type { Location, RouteObject } from 'react-router-dom';

import { ErrorTypes, type NavigationFailure, createRouterError } from './error';
import CreateRouterMatcher from './matcher';
import type {
  AfterEach,
  BeforeEach,
  ElegantConstRoute,
  Init,
  RouteLocationNamedRaw,
  RouteLocationNormalizedLoaded
} from './types';
import { callbacks } from './utils/callback';
import {
  cleanParams,
  findParentNames,
  getFullPath,
  removeElement,
  transformLocationToRoute
} from './utils/dataProcess';
import { warn } from './warning';

const historyCreatorMap = {
  hash: createHashRouter,
  history: createBrowserRouter,
  memory: createMemoryRouter
};

type HistoryCreator = typeof historyCreatorMap;

export type Mode = keyof HistoryCreator;

export type Options = Parameters<HistoryCreator[Mode]>[1];

export interface RouterOptions {
  getReactRoutes: (route: ElegantConstRoute) => RouteObject;
  init: Init;
  initRoutes: ElegantConstRoute[];
  mode: Mode;
  opt: Options;
}

export function createRouter({ getReactRoutes, init, initRoutes, mode, opt }: RouterOptions) {
  const matcher = new CreateRouterMatcher(initRoutes, opt?.basename || '');

  const initReactRoutes = initRoutes.map(route => getReactRoutes(route));

  const reactRouter = historyCreatorMap[mode](initReactRoutes, opt);

  const beforeGuards = callbacks<BeforeEach>();

  const afterGuards = callbacks<AfterEach>();

  let currentRoute = transformLocationToRoute(reactRouter.state.location, reactRouter.state.matches);

  /**
   *
   * 将用户传入的原始 location（路径、查询、参数等）转换成标准格式的路由对象
   *
   * @param {(Location | RouteLocationNameRaw)} rawLocation 用户传入的“跳转目标”
   * @param {RouteLocationNameRaw} [currentLocation]  当前路由
   */
  const resolve = (
    rawLocation: Location | RouteLocationNamedRaw,
    currentLocation?: RouteLocationNamedRaw
  ): RouteLocationNormalizedLoaded => {
    const current = { ...(currentLocation as RouteLocationNamedRaw) };
    let matcherLocation: Location | RouteLocationNamedRaw;
    // 如果是浏览器风格的对象（如 { pathname: '/user/123', search: '?tab=1' }），就直接赋值给 matcherLocation。
    if ('pathname' in rawLocation) {
      matcherLocation = rawLocation;
    } else {
      // 如果是基于“命名路由”的对象（{ name: 'user', params: { id: 123 } }），就：对 params 和 query 进行 cleanParams 清洗（去除 null / undefined）；
      // 构造成 matcher 可以识别的格式。
      matcherLocation = Object.assign(rawLocation, {
        params: cleanParams(rawLocation.params),
        query: cleanParams(rawLocation.query)
      });
    }

    const matchRoute = matcher.resolve(matcherLocation, current);

    return {
      ...matchRoute,
      redirectedFrom: currentRoute // 记录跳转前的路由
    };
  };

  /**
   * 路由切换后钩子执行逻辑
   *
   * @param {RouterState} state
   */
  const afterRouteChange = (state: RouterState) => {
    // 如果当前状态是空闲状态，则执行 afterGuards 列表中的第一个回调
    if (state.navigation.state === 'idle') {
      const from = currentRoute;
      currentRoute = resolve(state.location);
      // 调用注册的后置钩子函数，第一个钩子 afterEach(to,from) 的格式
      afterGuards.list()[0]?.(currentRoute, from);
    }
  };

  const blockerOrJump = (param?: undefined | null | boolean | string | Location | RouteLocationNamedRaw) => {
    if (!param) return false;
    if (typeof param === 'string') {
      reactRouter.navigate(param);
    }

    if (typeof param === 'object') {
      const finalRedirectPath = resolve(param);

      reactRouter.navigate(finalRedirectPath.fullPath || finalRedirectPath.path);
    }

    return true;
  };

  const onBeforeRouteChange = ({ nextLocation }: Parameters<BlockerFunction>[0]) => {
    const to = resolve(nextLocation);

    if (to.fullPath === currentRoute.fullPath) {
      return true;
    }

    if (to.redirect) {
      if (to.redirect.startsWith('/')) {
        if (to.redirect === currentRoute.fullPath) {
          return true;
        }
      } else {
        const finalRoute = to.matched.at(-1);

        const finalPath = getFullPath(finalRoute);

        if (finalPath === currentRoute.fullPath) return true;
      }
    }

    return beforeGuards.list()[0]?.(to, currentRoute, blockerOrJump);
  };

  reactRouter.getBlocker('beforeGuard', onBeforeRouteChange);

  reactRouter.subscribe(afterRouteChange);

  reactRouter.dispose();

  /**
   * 新增路由或者更新已有路由
   *
   * @param {(string | ElegantConstRoute)} parentOrRoute
   * @param {ElegantConstRoute} [route]
   */
  const addRoute = (parentOrRoute: string | ElegantConstRoute, route?: ElegantConstRoute) => {
    let parent: Parameters<(typeof matcher)['addRoute']>[1] | undefined;
    let record;

    if (typeof parentOrRoute === 'string') {
      parent = matcher.getRecordMatcher(parentOrRoute);
      if (import.meta.env.MODE === 'development' && !parent) {
        warn(`添加子路由时未找到父路由${String(parentOrRoute)}`);
      }
      record = route!;
    } else {
      record = parentOrRoute;
    }

    matcher.addRoute(record, parent);
  };

  /**
   * 将 React 路由添加到路由器.
   *
   * @param routes - An array of elegant constant routes.
   */
  const addReactRoutes = (parentOrRoute: ElegantConstRoute[] | string, elegantRoutes?: ElegantConstRoute[]) => {
    // Flatten nested routes
    let parent: string | null = null;
    let routes: ElegantConstRoute[];
    if (typeof parentOrRoute === 'string') {
      parent = parentOrRoute;
      if (!elegantRoutes) return;
      routes = elegantRoutes;
    } else {
      routes = parentOrRoute;
    }

    const flattenRoutes = routes.flat();

    const reactRoutes = flattenRoutes
      .map(route => {
        const match = matcher.getRecordMatcher(route.name);
        if (match) return null;
        // Add route
        addRoute(route);
        // Transform to react-router route
        const reactRoute = getReactRoutes(route);

        return reactRoute;
      })
      .filter(Boolean);
    if (reactRoutes.length < 1) return;
    // Add to react-router's routes
    reactRouter.patchRoutes(parent, reactRoutes as RouteObject[]);
  };

  const go = (delta: number) => {
    reactRouter.navigate(delta);
  };

  const back = () => {
    go(-1);
  };

  const forwardRef = () => {
    go(1);
  };

  /**
   * 在初始化阶段处理路由跳转逻辑
   *
   * @return {*}
   */
  async function initReady(): Promise<boolean> {
    return new Promise((resolved, reject) => {
      // 它的返回值有三种情况：
      // false: 不跳转，当前路径就是目标；
      // string: 需要跳转到某个路径；
      // RouteLocationRaw: 需要跳转到一个路由对象（可能包含 name、params 等）。
      init(currentRoute.fullPath, reactRouter.patchRoutes)
        .then(res => {
          if (!res) {
            reactRouter.initialize();
          } else {
            const targetPath = typeof res === 'string' ? res : resolve(res).fullPath;
            reactRouter.initialize().navigate(targetPath);
          }
          resolved(true);
        })
        .catch(err => {
          reject(err);
        });
    });
  }

  const push = (to: RouteLocationNamedRaw | string | Location) => {
    const resolved = typeof to === 'string' ? { fullPath: to } : resolve(to);
    if (!resolved && typeof to !== 'string') {
      const failure = createRouterError<NavigationFailure>(ErrorTypes.NAVIGATION_DUPLICATED, {
        from: currentRoute,
        to: resolved
      });
      return Promise.reject(failure);
    }
    const target = resolved.fullPath;
    const state = 'state' in resolved ? resolved.state : null;

    if (target !== currentRoute.fullPath) {
      reactRouter.navigate(target, { state });
    }
    return Promise.resolve(true);
  };

  const getRoutes = () => {
    return matcher.getRoutes().map(routeMatcher => routeMatcher.record);
  };

  const getRouteByName = (name: string) => {
    return matcher.getRecordMatcher(name)?.record;
  };

  const getAllRouteNames = () => {
    return matcher.getAllRouteNames();
  };

  const getRouteMetaByKey = (key: string) => {
    return getRoutes().find(route => route.name === key)?.meta || {};
  };

  const resetRoute = () => {
    matcher.resetMatcher();
    reactRouter._internalSetRoutes(initReactRoutes);
  };

  const removeRoute = (name: string) => {
    const matched = matcher.getRecordMatcher(name);
    if (!matched) return;
    let routes = reactRouter.routes;
    if (matched.parent) {
      const parentNames = findParentNames(matched.parent);

      parentNames.forEach(parentName => {
        const finalRoute = routes.find(route => route.id === parentName);
        if (finalRoute && finalRoute.children) routes = finalRoute.children;
      });

      removeElement(routes, matched.name);
    } else {
      routes = routes.filter(route => route.id !== matched.record.name);
    }

    reactRouter._internalSetRoutes(routes);
    matcher.removeRoute(name);
  };

  const router = {
    addReactRoutes,
    afterEach: afterGuards.add,
    back,
    beforeEach: beforeGuards.add,
    forwardRef,
    getAllRouteNames,
    getRouteByName,
    getRouteMetaByKey,
    getRoutes,
    go,
    initReady,
    push,
    reactRouter,
    removeRoute,
    resetRoute,
    resolve
  };

  return router;
}

export type Router = ReturnType<typeof createRouter>;
