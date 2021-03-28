import * as d from "../data";

/**
 * プログラム名を正規化, 検証する
 */
export const stringToValidProgramName = (
  text: string
): d.Result<string, string> => {
  const normalized = normalizeOneLineString(text);
  const { length } = [...normalized];
  if (length <= 0) {
    return d.Result.Error("プログラム名が空です");
  }
  if (length > 100) {
    return d.Result.Error("プログラム名は100文字以内である必要があります");
  }
  return d.Result.Ok(normalized);
};

export const stringToValidQuestionText = (
  text: string
): d.Result<string, string> => {
  const normalized = normalizeMultiLineString(text);
  const length = [...normalized].length;
  if (length <= 0) {
    return d.Result.Error("質問文が空です");
  }
  if (length > 1000) {
    return d.Result.Error("質問文は1000文字以内である必要があります");
  }
  return d.Result.Ok(normalized);
};

/**
 * クラス名を正規化, 検証する
 */
export const stringToValidClassName = (
  text: string
): d.Result<string, string> => {
  const normalized = normalizeOneLineString(text);
  const { length } = [...normalized];
  if (length <= 0) {
    return d.Result.Error("クラス名が空です");
  }
  if (length > 100) {
    return d.Result.Error("クラス名は100文字以内である必要があります");
  }
  return d.Result.Ok(normalized);
};

/**
 * NFKCで正規化して, 制御文字をなくして, 先頭末尾の空白をなくし, 空白の連続を1つの空白にまとめ, 改行を取り除く
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

/**
 * NFKCで正規化して, 改行をLFのみにする
 */
const normalizeMultiLineString = (text: string): string => {
  const normalized = text.normalize("NFKC");
  let result = "";
  for (const char of normalized) {
    const codePoint = char.codePointAt(0);
    if (
      codePoint !== undefined &&
      (codePoint === 0x0a ||
        (codePoint > 0x1f && codePoint < 0x7f) ||
        codePoint > 0xa0)
    ) {
      result += char;
    }
  }
  return result;
};
