import type { AgnosticDataRouteMatch } from '@remix-run/router';
import type { Location } from 'react-router-dom';

import { parseQuery } from '../query';
import type { RouteLocationNormalizedLoaded } from '../types';

export function cleanParams(params: Record<string, any> | undefined): Record<string, any> {
  if (!params) return {};
  return Object.fromEntries(Object.entries(params).filter(([_, value]) => value !== null));
}

export function transformLocationToRoute(
  location: Location,
  match: AgnosticDataRouteMatch[]
): RouteLocationNormalizedLoaded {
  const { hash, pathname, search, state } = location;
  const lastMatch = match.at(-1);

  return {
    fullPath: pathname + search + hash,
    hash,
    matched: [],
    meta: lastMatch?.route.handle,
    name: lastMatch?.route.id,
    params: Object.keys(lastMatch?.params || {}).filter(key => key !== '*'),
    path: pathname,
    query: parseQuery(search),
    redirectedFrom: undefined,
    state
  };
}
