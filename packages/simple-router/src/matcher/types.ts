import type { _RouteRecordBase, ElegantConstRoute } from '../types';

export interface RouteRecordNormalized {
  /** Nested route records. */
  children: ElegantConstRoute[];
  /** {@inheritDoc _RouteRecordBase.meta} */
  meta: Exclude<_RouteRecordBase['meta'], void>;

  /** {@inheritDoc _RouteRecordBase.name} */
  name: _RouteRecordBase['name'];
  /** {@inheritDoc _RouteRecordBase.path} */
  path: _RouteRecordBase['path'];
  redirect?: string;
}

export interface RouteRecordRaw {
  children: RouteRecordRaw[];
  name?: string;
  parent: RouteRecordRaw | undefined;
  record: RouteRecordNormalized;
}
