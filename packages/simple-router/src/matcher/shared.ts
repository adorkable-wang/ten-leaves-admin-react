// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import type { ElegantConstRoute } from '@ohh-889/react-auto-route';

import type { LocationQuery } from '../types';
import { warn } from '../warning';

import type { RouteRecordNormalized } from './types';

export function objectToQueryParams(params: { [key: string]: string | number }): string {
  const queryParams = new URLSearchParams();
  for (const key in params) {
    if (params[key] !== undefined) {
      queryParams.set(key, params[key].toString());
    }
  }

  return queryParams.toString();
}

/**
 * 将带有动态参数的路径模板转换为实际路径
 *  '/user/:id/profile' + { id: 123 } → '/user/123/profile'
 *
 * @export
 * @param {string} pathTemplate
 * @param {({ [key: string]: string | number })} params
 * @return {*}  {string}
 */
export function generatePath(pathTemplate: string, params: { [key: string]: string | number }): string {
  // 正则匹配识别并替换 :param 字段,并查找对应值，找不到则发出警告
  let path = pathTemplate.replace(/:([a-zA-Z]+)/g, (_, p1) => {
    if (p1 in params) {
      return params[p1].toString();
    }
    // eslint-disable-next-line no-console
    console.warn(`Parameter "${p1}" not found in params object`);
    return '';
  });

  // 删除路径中的多余斜杠
  path = path.replace(/\/+/g, '/');

  // 如果路径以斜杠结尾，删除结尾的斜杠
  if (path.endsWith('/')) {
    path = path.slice(0, -1);
  }

  return path;
}

/**
 * 标准化路由转换
 *
 * @export
 * @param {ElegantConstRoute} record
 * @return {*}  {RouteRecordNormalized}
 */
export function normalizeRouteRecord(record: ElegantConstRoute): RouteRecordNormalized {
  return {
    children:
      record.children?.map(child => {
        if (!child.redirect && child.children) {
          child.redirect = child.children[0].path;
        }
        return child;
      }) || [],
    meta: record.meta || {},
    name: record.name,
    path: record.path || '',
    redirect: record.redirect || (record.children && record.children[0].path)
  };
}

/**
 * 具有名称的路由和具有空路径且没有名称的子路由在添加路线时应发出警告
 *
 * @param mainNormalizedRecord - RouteRecordNormalized
 * @param parent - RouteRecordMatcher
 */
export function checkChildMissingNameWithEmptyPath(mainNormalizedRecord: RouteRecordNormalized, parent?: any) {
  if (parent && parent.record.name && !mainNormalizedRecord.name && !mainNormalizedRecord.path) {
    warn(
      `路由 "${String(
        parent.record.name
      )}" 的子路由没有名称且路径为空。使用该名称将不会渲染空路径子路由，因此您可能希望将名称移动到子路由中。如果这是故意的，请为子路由添加名称以消除警告。`
    );
  }
}

export function getQueryParams(search: string): LocationQuery {
  const params: LocationQuery = {};
  const queryParams = new URLSearchParams(search);
  for (const [key, value] of queryParams) {
    params[key] = value;
  }
  return params;
}

export function mergeMetaFields(matched: RouteRecordNormalized[]) {
  return matched.reduce((meta, record) => Object.assign(meta, record.meta), {});
}

/**
 * 清理并过滤掉空/未定义的参数,并将数组参数转换为逗号分隔的字符串
 *
 * @param params - The raw parameters.
 * @returns The cleaned parameters.
 */
export function cleanParams(params: Record<string, any>): Record<string, string | number> {
  return Object.keys(params).reduce(
    (acc, key) => {
      const value = params[key];
      if (value !== null && value !== undefined) {
        acc[key] = Array.isArray(value) ? value.join(',') : value;
      }
      return acc;
    },
    {} as Record<string, string | number>
  );
}
