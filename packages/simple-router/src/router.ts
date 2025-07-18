import type { BlockerFunction, RouterState } from "@remix-run/router";
import {
    createBrowserRouter,
    createHashRouter,
    createMemoryRouter,
} from "react-router-dom";
import CreateRouterMatcher from "./matcher";
import type { Location, RouteObject } from "react-router-dom";

import type {
    AfterEach,
    BeforeEach,
    ElegantConstRoute,
    Init,
    RouteLocationNamedRaw,
    RouteLocationNormalizedLoaded,
} from "./types";
import { callbacks } from "./utils/callback";
import { warn } from "./warning";
import { createRouterError, ErrorTypes, type NavigationFailure } from "./error";
import { cleanParams, transformLocationToRoute } from "./utils/dataProcess";

const historyCreatorMap = {
    hash: createHashRouter,
    history: createBrowserRouter,
    memory: createMemoryRouter,
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

export function createRouter({
    getReactRoutes,
    init,
    initRoutes,
    mode,
    opt,
}: RouterOptions) {
    const matcher = new CreateRouterMatcher(initRoutes, opt?.basename || "");

    const initReactRoutes = initRoutes.map((route) => getReactRoutes(route));

    const reactRouter = historyCreatorMap[mode](initReactRoutes, opt);

    const beforeGuards = callbacks<BeforeEach>();

    const afterGuards = callbacks<AfterEach>();

    const currentRoute = transformLocationToRoute(
        reactRouter.state.location,
        reactRouter.state.matches
    );

    // reactRouter.getBlocker('beforeGuard', onBeforeRouteChange);

    // reactRouter.subscribe(afterRouteChange);

    // reactRouter.dispose();

    /**
     * Adds React routes to the router.
     *
     * @param routes - An array of elegant constant routes.
     */
    function addReactRoutes(
        parentOrRoute: ElegantConstRoute[] | string,
        elegantRoutes?: ElegantConstRoute[]
    ) {
        // Flatten nested routes
        let parent: string | null = null;
        let routes: ElegantConstRoute[];
        if (typeof parentOrRoute === "string") {
            parent = parentOrRoute;
            if (!elegantRoutes) return;
            routes = elegantRoutes;
        } else {
            routes = parentOrRoute;
        }

        const flattenRoutes = routes.flat();

        const reactRoutes = flattenRoutes
            .map((route) => {
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
    }

    const router = {
        addReactRoutes,
        afterEach: afterGuards.add,
        beforeEach: beforeGuards.add,
    };

    return router;
}

export type Router = ReturnType<typeof createRouter>;
