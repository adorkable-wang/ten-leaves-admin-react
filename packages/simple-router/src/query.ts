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

export const PLUS_RE = /\+/g; // + => %2B
const EQUAL_RE = /[=]/g; // = => %3D
const ENC_BRACKET_OPEN_RE = /%5B/g; // %5B => [
const ENC_BRACKET_CLOSE_RE = /%5D/g; // %5D => ]
const ENC_CARET_RE = /%5E/g; // %5E => ^
const ENC_BACKTICK_RE = /%60/g; // %60 => `
const ENC_CURLY_OPEN_RE = /%7B/g; // %7B => {
const ENC_PIPE_RE = /%7C/g; // %7C => |
const ENC_CURLY_CLOSE_RE = /%7D/g; // %7D => }
const ENC_SPACE_RE = /%20/g; // %20 => }
const HASH_RE = /#/g; // # => %23
const AMPERSAND_RE = /&/g; // & => %26

/**
 * 序列化查询参数
 * { a: 1, b: [2, 3], c: null } => '?a=1&b=2&b=3&c'
 * @export
 * @param {LocationQueryRaw} query
 * @return {*}  {string}
 */
export function stringifyQuery(query: LocationQueryRaw): string {
  let search = '';

  for (const [originalKey, value] of Object.entries(query)) {
    const key = encodeQueryKey(originalKey);

    // null 特殊处理：只有键名，没有值
    if (value === null) {
      if (value !== undefined) {
        search += (search.length ? '&' : '?') + key;
      }
    }

    // 普通值转为数组统一处理（null 过滤掉）
    const values: LocationQueryValueRaw[] = Array.isArray(value)
      ? value.map(v => v && encodeQueryValue(v))
      : [value && encodeQueryValue(value)];

    // 过滤掉 null 值
    for (const v of values) {
      if (v !== undefined) {
        search += (search.length ? '&' : '') + key;
        if (v !== null) search += `=${v}`;
      }
    }
  }
  return search;
}

/**
 * 反序列化查询参数
 *
 * '?a=1&b=2&b=3&c' => { a: '1', b: ['2', '3'], c: null }
 * @export
 * @param {string} search
 * @return {*}  {LocationQuery}
 */
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

export function decode(text: string | number): string {
  try {
    return decodeURIComponent(`${text}`);
  } catch {
    // eslint-disable-next-line no-console
    console.warn(`Error decoding "${text}". Using original value`);
  }
  return `${text}`;
}

/**
 * 解码查询参数
 *
 * @export
 * @param {(string | number)} text
 * @return {*}  {string}
 */
export function encodeQueryKey(text: string | number): string {
  return encodeQueryValue(text).replace(EQUAL_RE, '%3D');
}

export function encodeQueryValue(text: string | number): string {
  return (
    commonEncode(text)
      // Encode the space as +, encode the + to differentiate it from the space
      .replace(PLUS_RE, '%2B')
      .replace(ENC_SPACE_RE, '+')
      .replace(HASH_RE, '%23')
      .replace(AMPERSAND_RE, '%26')
      .replace(ENC_BACKTICK_RE, '`')
      .replace(ENC_CURLY_OPEN_RE, '{')
      .replace(ENC_CURLY_CLOSE_RE, '}')
      .replace(ENC_CARET_RE, '^')
  );
}

function commonEncode(text: string | number): string {
  return encodeURI(`${text}`)
    .replace(ENC_PIPE_RE, '|')
    .replace(ENC_BRACKET_OPEN_RE, '[')
    .replace(ENC_BRACKET_CLOSE_RE, ']');
}
