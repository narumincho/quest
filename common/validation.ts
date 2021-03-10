import * as d from "../data";

/**
 * プログラム名を正規化する.
 */
export const stringToValidProjectName = (
  text: string
): d.Result<string, string> => {
  const normalized = normalizeOneLineString(text);
  const { length } = [...normalized];
  if (length <= 0) {
    return d.Result.Error("プログラム名が空です");
  }
  if (length <= 0 || length > 100) {
    return d.Result.Error("プログラム名は100文字以内です");
  }
  return d.Result.Ok(normalized);
};

/**
 * NFKCで正規化して, 先頭末尾の空白をなくし, 空白の連続を1つの空白にまとめ, 改行を取り除く
 */
const normalizeOneLineString = (text: string): string => {
  const normalized = text.normalize("NFKC").trim();
  let result = "";
  let beforeSpace = false;
  for (const char of normalized) {
    const codePoint = char.codePointAt(0);
    // 制御文字
    if (
      codePoint !== undefined &&
      ((codePoint > 0x1f && codePoint < 0x7f) || codePoint > 0xa0)
    ) {
      if (!(beforeSpace && char === " ")) {
        result += char;
        beforeSpace = char === " ";
      }
    }
  }
  return result;
};
