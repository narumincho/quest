/** Map の値を設定する. 値がない場合は新たに追加する */
export const mapSet = <Key, Value>(
  map: ReadonlyMap<Key, Value>,
  key: Key,
  value: Value
): ReadonlyMap<Key, Value> => {
  const mutableMap = new Map(map);
  mutableMap.set(key, value);
  return mutableMap;
};

/**
 * Map の値を更新する. 値がない場合は何もしない
 */
export const mapUpdate = <Key, Value>(
  map: ReadonlyMap<Key, Value>,
  key: Key,
  valueFunc: (before: Value) => Value
): ReadonlyMap<Key, Value> => {
  const beforeValue = map.get(key);
  if (beforeValue === undefined) {
    return map;
  }
  const mutableMap = new Map(map);
  mutableMap.set(key, valueFunc(beforeValue));
  return mutableMap;
};

export const mapUpdateAllValue = <Key, Value>(
  map: ReadonlyMap<Key, Value>,
  valueFunc: (before: Value) => Value
): ReadonlyMap<Key, Value> => {
  return new Map(
    [...map].map(([key, value]): [Key, Value] => [key, valueFunc(value)])
  );
};
