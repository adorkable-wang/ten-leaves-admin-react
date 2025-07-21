import { matchPath } from 'react-router-dom';
import type { Location } from 'react-router-dom';

import { stringifyQuery } from '../query';
import type { ElegantConstRoute, RouteLocationNamedRaw } from '../types';
import { transformLocationToFullPath } from '../utils/dataProcess';

import { createRouteRecordMatcher } from './pathMatcher';
import {
  checkChildMissingNameWithEmptyPath,
  cleanParams,
  generatePath,
  getQueryParams,
  normalizeRouteRecord
} from './shared';
import type { RouteRecordRaw } from './types';

/**
 * 支持自动化、常量化的路由匹配器
 * 支持根据 name 快速解析路径
 * 支持动态添加和删除路由
 * 可以解析完整的路径、params、query 等信息
 *
 * @class CreateRouterMatcher
 */
class CreateRouterMatcher {
  // Internal routes maintained for react-router
  matchers: RouteRecordRaw[] = [];

  basename: string = '';

  matcherMap = new Map<string, RouteRecordRaw>();

  initRoutes: ElegantConstRoute[] = [];

  constructor(routes: ElegantConstRoute[], basename: string) {
    this.initRoutes = routes;
    this.basename = basename;
    this.initializeRoutes();
    this.removeRoute = this.removeRoute.bind(this);
  }

  /** - 通过添加路由数组中的每条数组进行初始化 */
  initializeRoutes() {
    this.initRoutes.forEach(route => this.addRoute(route));
  }

  /**
   * 添加路由记录
   *
   * @param {ElegantConstRoute} record 需要添加的路由记录
   * @param {RouteRecordRaw} [parent] 父路由 matcher 用于拼接嵌套路由
   * @param {RouteRecordRaw} [originalRecord] 原始顶层路由，用于识别是否第一次添加
   * @memberof CreateRouterMatcher
   */
  addRoute(record: ElegantConstRoute, parent?: RouteRecordRaw, originalRecord?: RouteRecordRaw) {
    const isRootAdd = !originalRecord;

    const mainNormalizedRecord = normalizeRouteRecord(record);

    if (import.meta.env.NODE_ENV === 'development') {
      checkChildMissingNameWithEmptyPath(mainNormalizedRecord, parent);
    }

    // 生成一个记录数组来正确处理 aliases(别名) 路由
    const normalizedRecords: (typeof mainNormalizedRecord)[] = [mainNormalizedRecord];

    let matcher: RouteRecordRaw;

    for (const normalizedRecord of normalizedRecords) {
      const { path } = normalizedRecord;

      // 如果有父路由且子路由不是绝对路径，则构建嵌套路由的路径。仅当子路径不为空且父路径末尾没有斜杠时，才添加 / 分隔符。
      if (parent && path && path[0] !== '/') {
        const parentPath = parent.record.path;
        const connectingSlash = parentPath[parentPath.length - 1] === '/' ? '' : '/';
        normalizedRecord.path = parent.record.path + (path && connectingSlash + path);
      }

      // 构建一个 matcher 对象（路径解析器 + 路由配置）
      // 会把 normalizedRecord + parent 的信息整合成一个完整的 matcher 节点
      matcher = createRouteRecordMatcher(normalizedRecord, parent);

      // 删除之前同名路由，并且仅针对顶部记录（避免嵌套调用）这是有效的，因为原始记录是第一个
      if (isRootAdd && record.name) {
        this.removeRoute(record.name);
      }

      if (mainNormalizedRecord.children) {
        const children = mainNormalizedRecord.children;

        for (let i = 0; i < children.length; i += 1) {
          const childOriginalRecord = originalRecord && originalRecord.children[i];
          this.addRoute(children[i], matcher, childOriginalRecord);
        }
      }

      if (matcher.record.name) {
        this.insertMatcher(matcher);
      }
    }
  }

  /**
   * 将新的 matcher 插入到 matcher数组和 matcher 映射中
   *
   * @param {RouteRecordRaw} matcher
   * @memberof CreateRouterMatcher
   */
  insertMatcher(matcher: RouteRecordRaw) {
    if (matcher.record.path === '*') {
      this.matchers.unshift(matcher);
    } else {
      this.matchers.push(matcher);
    }

    // 只将原始记录添加到名称映射中
    if (matcher.record.name) this.matcherMap.set(matcher.record.name, matcher);
  }

  /**
   * 解析路由匹配器,将用户输入的路由信息（如 name, path, query 等）标准化解析成一个完整的路由对象，供实际跳转或匹配使用。
   *
   * @param {(RouteLocationNamedRaw | Location)} location 即将跳转的目标路由
   * @param {RouteLocationNamedRaw} currentLocation 当前路由
   * @memberof CreateRouterMatcher
   */
  resolve(location: RouteLocationNamedRaw | Location, currentLocation: RouteLocationNamedRaw) {
    let matcher: RouteRecordRaw | undefined;
    let query: Record<string, any> = {};
    let path: string = '';
    let name: string | undefined;
    let params: Record<string, any> = {};
    let fullPath: string = '';

    // 基于 name 跳转
    if ('name' in location) {
      matcher = this.matcherMap.get(location.name);
      if (!matcher) matcher = this.matchers[0]; // 默认使用第一个 matcher

      name = matcher.record.name;
      params = cleanParams(location.params || {});
      fullPath = generatePath(matcher.record.path, params);

      query = location.query || {};
      const queryParams = stringifyQuery(query);
      fullPath += queryParams ? `?${queryParams}` : '';
      path = matcher.record.path;

      if (location.hash) {
        fullPath += location.hash;
      }
    } else if (location.pathname) {
      // 基于 URL 跳转（即 pathname）

      path = this.basename === '/' ? location.pathname : location.pathname.replace(this.basename, '');

      matcher = this.matchers.slice(1).find(m => matchPath(m.record.path, path)) || this.matchers[0];

      query = getQueryParams(location.search);

      if (matcher) {
        const match = matchPath(matcher.record.path, path);
        if (match?.params) {
          params = match.params;
        }
        name = matcher.record.name;

        fullPath =
          this.basename === '/'
            ? transformLocationToFullPath(location)
            : transformLocationToFullPath(location).replace(this.basename, '');
      }
    } else {
      // 没有传 name，也没有 pathname，尝试复用当前路由
      matcher = currentLocation.name
        ? this.matcherMap.get(currentLocation.name)
        : this.matchers.find(m => m.record === (currentLocation.path as unknown));
      if (!matcher) {
        throw new Error('there is no such route');
      }

      name = matcher.record.name;
    }

    const matched = [];
    let parentMatcher: RouteRecordRaw | undefined = matcher;
    while (parentMatcher) {
      // 将父路由的记录添加到匹配数组中
      matched.unshift(parentMatcher.record);
      parentMatcher = parentMatcher.parent;
    }

    return {
      fullPath,
      name,
      params,
      path,
      query
    };
  }

  /**
   * 获取指定名称的路由匹配器
   *
   * @param {string} name
   * @return {*}
   * @memberof CreateRouterMatcher
   */
  getRecordMatcher(name: string) {
    return this.matcherMap.get(name);
  }

  /**
   * 获取所有路由匹配器
   *
   * @return {*}
   * @memberof CreateRouterMatcher
   */
  getRoutes() {
    return this.matchers;
  }

  /**
   * 获取所有路由名称
   *
   * @return {*}
   * @memberof CreateRouterMatcher
   */
  getAllRouteNames() {
    return Array.from(this.matcherMap.keys());
  }

  /**
   * 根据名称从 matcherMap 中删除路由。
   *
   * @param name - The name of the route to remove.
   */
  removeMatcherMapByName(name: string) {
    this.matcherMap.delete(name);
  }

  /**
   *  从路由匹配器中删除指定的路由。
   *
   * @param {(string | RouteRecordRaw)} matcherRef 路由的引用，可以是名称或者 matcher 对象
   * @memberof CreateRouterMatcher
   */
  removeRoute(matcherRef: string | RouteRecordRaw) {
    const matcher = typeof matcherRef === 'string' ? this.matcherMap.get(matcherRef) : matcherRef;

    if (!matcher) return;

    // 递归删除子项
    matcher.children.forEach(child => this.removeRoute(child));

    const index = this.matchers.indexOf(matcher);
    if (index !== -1) {
      this.matchers.splice(index, 1);
    }

    if (matcher.record.name) {
      this.removeMatcherMapByName(matcher.record.name);
    }
  }

  /**
   * 重置路由匹配器，清空所有匹配器和映射，并重新初始化路由。
   *
   * @memberof CreateRouterMatcher
   */
  resetMatchers() {
    this.matchers.length = 0;
    this.matcherMap.clear();
    this.initializeRoutes();
  }
}

export default CreateRouterMatcher;
