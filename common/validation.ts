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

/**
 * 質問文を正規化, 検証する
 */
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
 * 回答を正規化, 検証する
 */
export const stringToValidAnswerText = (
  text: string
): d.Result<string, string> => {
  const normalized = normalizeMultiLineString(text);
  const length = [...normalized].length;
  if (length <= 0) {
    return d.Result.Error("回答が空です");
  }
  if (length > 1000) {
    return d.Result.Error("回答は1000文字以内である必要があります");
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

export type QuestionParentIsValidResult =
  | {
      readonly isValid: true;
    }
  | {
      readonly isValid: false;
      readonly reason: string;
    };

/**
 * 質問が, 指定した質問の子供になっているか.
 * 直接的でなくても, 孫や, ひ孫などなら `true` を返す.
 * 質問が見つからなかったときは, `false` を返す
 * `maybeChildrenQuestionId` と `maybeParentQuestionId` が同じものを指定されたら, `true` を返す
 *
 * @param parentQuestionId 親に設定する予定の質問ID
 * @param questionId 編集する対象の質問ID
 * @param questionMap すべての質問が含まれたMap (プロジェクトに含まれている質問で充分)
 */
export const questionParentIsValid = (
  parentQuestionId: d.QQuestionId,
  questionId: d.QQuestionId,
  programId: d.QProgramId,
  questionMap: ReadonlyMap<d.QQuestionId, d.QQuestion>
): QuestionParentIsValidResult => {
  if (parentQuestionId === questionId) {
    return {
      isValid: false,
      reason: "自分自身を親の質問としては登録できない",
    };
  }
  /** 子孫と思われる質問から, 親へ移動して調べる */
  const childQuestion = questionMap.get(parentQuestionId);
  if (childQuestion === undefined) {
    return {
      isValid: false,
      reason: "親要素にしたい質問を取得できなかった",
    };
  }
  if (childQuestion.programId !== programId) {
    return {
      isValid: false,
      reason: "違うプロジェクトの親を指定することはできない",
    };
  }
  if (childQuestion.parent._ === "Nothing") {
    return {
      isValid: true,
    };
  }
  let targetId = childQuestion.parent.value;
  while (true) {
    const question = questionMap.get(targetId);
    if (question === undefined) {
      return {
        isValid: false,
        reason: "親の質問を取得できなかった",
      };
    }
    if (question.parent._ === "Nothing") {
      return {
        isValid: true,
      };
    }
    if (question.parent.value === questionId) {
      return {
        isValid: false,
        reason: "自身の子孫の質問を親の質問に設定できない",
      };
    }
    targetId = question.parent.value;
  }
};
