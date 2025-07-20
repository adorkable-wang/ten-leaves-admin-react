export type LocationQueryValue = string | null;

/**
 * Normalized query object that appears in {@link RouteLocationNormalized}
 *
 * @public
 */
export type LocationQuery = Record<string, LocationQueryValue | LocationQueryValue[]>;
export type LocationQueryValueRaw = LocationQueryValue | number | undefined;

export type LocationQueryRaw = Record<string | number, LocationQueryValueRaw | LocationQueryValueRaw[]>;

/**
 * Transforms a queryString into a {@link LocationQuery} object. Accept both, a version with the leading `?` and without
 * Should work as URLSearchParams
 *
 * @param search - search string to parse
 * @returns a query object
 * @internal
 */

export const PLUS_RE = /\+/g; // %2B

export function decode(text: string | number): string {
  try {
    return decodeURIComponent(`${text}`);
  } catch {
    console.warn(`Error decoding "${text}". Using original value`);
  }
  return `${text}`;
}

export function parseQuery(search: string): LocationQuery {
  const query: LocationQuery = {};
  // 避免创建具有空键和空值的对象
  // 因为 split('&')
  if (search === '' || search === '?') return query;

  const hasLeadingIM = search[0] === '?';
  const searchParams = (hasLeadingIM ? search.slice(1) : search).split('&');

  for (let i = 0; i < searchParams.length; i += 1) {
    // 将所有的 + 替换为空格，因为 URL 查询参数中 + 代表空格。
    const searchParam = searchParams[i].replace(PLUS_RE, ' ');

    // 找出当前键值对字符串中第一个 = 号的位置，分隔键和值
    const eqPos = searchParam.indexOf('=');

    // 如果没有 =，说明只有 key，没有 value，将整个字符串作为 key，value 为 null。
    // 如果有 =，则：key 是 = 号之前的字符串，调用 decode 解码。value 是 = 号之后的字符串，也调用 decode 解码。
    const key = decode(eqPos < 0 ? searchParam : searchParam.slice(0, eqPos));
    const value = eqPos < 0 ? null : decode(searchParam.slice(eqPos + 1));

    if (key in query) {
      // an extra variable for ts types
      let currentValue = query[key];
      if (!Array.isArray(currentValue)) {
        currentValue = [currentValue];
        query[key] = currentValue;
      }
      // 强制修改
      (currentValue as LocationQueryValue[]).push(value);
    } else {
      query[key] = value;
    }
  }
  return query;
}
