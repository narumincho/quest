import * as d from "../data";
import { nowMode } from "./nowMode";

/** オリジン */
const origin =
  nowMode === "development"
    ? "http://localhost:5000"
    : "https://north-quest.web.app";

/** URLに含めるデータ */
export type UrlData = {
  location: d.QLocation;
  accountToken: d.AccountToken | undefined;
};

/** アカウントトークンを含んだ パスとハッシュを生成する */
export const urlDataToUrl = (urlData: UrlData): URL => {
  const url = locationToUrl(urlData.location);
  if (typeof urlData.accountToken === "string") {
    url.hash = `account-token=${urlData.accountToken}`;
  }
  return url;
};

export const locationToUrl = (location: d.QLocation): URL => {
  switch (location._) {
    case "Top":
      return createUrl([]);
    case "Setting":
      return createUrl([settingPath]);
    case "NewProgram":
      return createUrl([newProgramPath]);
    case "Program":
      return createUrl([programPath, location.qProgramId]);
    case "NewQuestion":
      return createUrl(
        [newQuestionPath],
        new Map<string, string>([
          [newQuestionProgramId, location.qNewQuestionParameter.programId],
          ...(location.qNewQuestionParameter.parent._ === "Just"
            ? ([
                [
                  newQuestionParent,
                  location.qNewQuestionParameter.parent.value,
                ],
              ] as const)
            : []),
          [newQuestionText, location.qNewQuestionParameter.text],
        ])
      );
    case "Question":
      return createUrl([questionPath, location.qQuestionId]);
  }
};

/**
 * URLから quest 内の場所と, アカウントトークンを得る
 * オリジンは無視される
 */
export const urlToUrlData = (url: URL): UrlData => {
  const location: d.QLocation = urlToLocation(url);
  const accountTokenResult = url.hash.match(
    /account-token=(?<token>[0-9a-f]{64})/u
  );
  if (
    accountTokenResult !== null &&
    accountTokenResult.groups !== undefined &&
    typeof accountTokenResult.groups.token === "string"
  ) {
    const accountTokenAsString = accountTokenResult.groups.token;
    if (typeof accountTokenAsString === "string") {
      return {
        accountToken: accountTokenAsString as d.AccountToken,
        location,
      };
    }
  }
  return {
    location,
    accountToken: undefined,
  };
};

/**
 * URL から quest 内の場所を得る.
 * アカウントトークンとオリジンは無視する
 */
export const urlToLocation = (url: URL): d.QLocation => {
  const pathList = url.pathname.split("/");
  switch (pathList[1]) {
    case settingPath:
      return d.QLocation.Setting;
    case newProgramPath:
      return d.QLocation.NewProgram;
    case programPath:
      if (typeof pathList[2] === "string") {
        return d.QLocation.Program(pathList[2] as d.QProgramId);
      }
      return d.QLocation.Top;
    case newQuestionPath: {
      const programId = url.searchParams.get(newQuestionProgramId);
      const parent = url.searchParams.get(newQuestionParent);
      const text = url.searchParams.get(newQuestionText);
      if (typeof programId === "string" && typeof text === "string") {
        return d.QLocation.NewQuestion({
          programId: programId as d.QProgramId,
          parent:
            typeof parent === "string"
              ? d.Maybe.Just(parent as d.QQuestionId)
              : d.Maybe.Nothing(),
          text,
        });
      }
      return d.QLocation.Top;
    }
    case questionPath:
      if (typeof pathList[2] === "string") {
        return d.QLocation.Question(pathList[2] as d.QQuestionId);
      }
      return d.QLocation.Top;
  }
  return d.QLocation.Top;
};

/** LINEログインで指定する. コールバックURL */
export const lineLoginCallbackUrl = `${origin}/lineLoginCallback`;

/** アカウントの画像などのURLを生成する */
export const imageUrl = (imageHash: d.ImageHash): URL =>
  new URL(`${origin}/file/${imageHash}`);

const settingPath = "setting";
const newProgramPath = "new-program";
const programPath = "program";
const newQuestionPath = "new-question";
const questionPath = "question";
const newQuestionProgramId = "programId";
const newQuestionParent = "parent";
const newQuestionText = "text";

/**
 * URLを宣言的に作成する
 * @param path パス
 * @param searchParams クエリパラメーター
 * @param hash `#` を含まれないハッシュ (フラグメント)
 */
const createUrl = (
  path: ReadonlyArray<string>,
  searchParams?: ReadonlyMap<string, string>,
  hash?: string
): URL => {
  const url = new URL(origin);
  url.pathname = "/" + path.join("/");
  if (searchParams !== undefined) {
    for (const [key, value] of searchParams) {
      url.searchParams.set(key, value);
    }
  }
  if (typeof hash === "string") {
    url.hash = hash;
  }
  return url;
};
