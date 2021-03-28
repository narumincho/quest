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
    case "NewClass":
      return createUrl(
        [newClassPath],
        new Map([[newClassProgramId, location.qProgramId]])
      );
    case "Class":
      return createUrl([classPath]);
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

const defaultLocation: d.QLocation = d.QLocation.Top;
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
      return defaultLocation;
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
      return defaultLocation;
    }
    case questionPath:
      if (typeof pathList[2] === "string") {
        return d.QLocation.Question(pathList[2] as d.QQuestionId);
      }
      return defaultLocation;
    case classPath:
      if (typeof pathList[2] === "string") {
        return d.QLocation.Class(pathList[2] as d.QClassId);
      }
      return defaultLocation;
    case newClassPath: {
      const programId = url.searchParams.get(newClassProgramId);
      if (typeof programId === "string") {
        return d.QLocation.NewClass(programId as d.QProgramId);
      }
      return defaultLocation;
    }
  }
  return defaultLocation;
};

/** LINEログインで指定する. コールバックURL */
export const lineLoginCallbackUrl = `${origin}/lineLoginCallback`;

/** アカウントの画像などのURLを生成する */
export const imageUrl = (imageHash: d.ImageHash): URL =>
  new URL(`${origin}/file/${imageHash}`);

const newAddPrefix = (path: string): string => "new-" + path;

const settingPath = "setting";
const programPath = "program";
const newProgramPath = newAddPrefix(programPath);
const questionPath = "question";
const newQuestionPath = newAddPrefix(questionPath);
const newQuestionProgramId = "programId";
const newQuestionParent = "parent";
const newQuestionText = "text";
const classPath = "class";
const newClassPath = newAddPrefix(classPath);
const newClassProgramId = "programId";

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
