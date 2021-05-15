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
  const url = locationToStructuredUrl(urlData.location);
  if (typeof urlData.accountToken === "string") {
    return structuredUrlToUrl({
      ...url,
      hash: new Map([[accountTokenKey, urlData.accountToken]]),
    });
  }
  return structuredUrlToUrl(url);
};

export const locationToUrl = (location: d.QLocation): URL => {
  return structuredUrlToUrl(locationToStructuredUrl(location));
};

const locationToStructuredUrl = (location: d.QLocation): StructuredUrl => {
  switch (location._) {
    case "Top":
      return { resourceName: "", searchParams: new Map(), hash: new Map() };
    case "Setting":
      return {
        resourceName: settingPath,
        searchParams: new Map(),
        hash: new Map(),
      };
    case "NewProgram":
      return {
        resourceName: newProgramPath,
        searchParams: new Map(),
        hash: new Map(),
      };
    case "Program":
      return {
        resourceName: programPath,
        resourceId: location.qProgramId,
        searchParams: new Map(),
        hash: new Map(),
      };
    case "NewQuestion":
      return {
        resourceName: newQuestionPath,
        searchParams: new Map<string, string>([
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
        ]),
        hash: new Map(),
      };
    case "Question":
      return {
        resourceName: questionPath,
        resourceId: location.qQuestionId,
        searchParams: new Map(),
        hash: new Map(),
      };
    case "NewClass":
      return {
        resourceName: newClassPath,
        searchParams: new Map([[newClassProgramId, location.qProgramId]]),
        hash: new Map(),
      };
    case "Class":
      return {
        resourceName: classPath,
        resourceId: location.qClassId,
        searchParams: new Map(),
        hash: new Map(),
      };
    case "ClassInvitation":
      return {
        resourceName: classInvitationPath,
        resourceId: location.qClassInvitationToken,
        searchParams: new Map(),
        hash: new Map(),
      };
    case "EditQuestion":
      return {
        resourceName: editQuestionPath,
        resourceId: location.qQuestionId,
        searchParams: new Map(),
        hash: new Map(),
      };
  }
};

/**
 * URLから quest 内の場所と, アカウントトークンを得る
 * オリジンは無視される
 */
export const urlToUrlData = (url: URL): UrlData => {
  const structuredUrl = urlToStructuredUrl(url);
  const location: d.QLocation = structuredUrlToLocation(structuredUrl);
  const accountTokenResult = structuredUrl.hash.get(accountTokenKey);
  if (typeof accountTokenResult === "string") {
    return {
      accountToken: accountTokenResult as d.AccountToken,
      location,
    };
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
const structuredUrlToLocation = (structuredUrl: StructuredUrl): d.QLocation => {
  switch (structuredUrl.resourceName) {
    case settingPath:
      return d.QLocation.Setting;
    case newProgramPath:
      return d.QLocation.NewProgram;
    case programPath:
      if (typeof structuredUrl.resourceId === "string") {
        return d.QLocation.Program(structuredUrl.resourceId as d.QProgramId);
      }
      return defaultLocation;
    case newQuestionPath: {
      const programId = structuredUrl.searchParams.get(newQuestionProgramId);
      const parent = structuredUrl.searchParams.get(newQuestionParent);
      const text = structuredUrl.searchParams.get(newQuestionText);
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
      if (typeof structuredUrl.resourceId === "string") {
        return d.QLocation.Question(structuredUrl.resourceId as d.QQuestionId);
      }
      return defaultLocation;
    case classPath:
      if (typeof structuredUrl.resourceId === "string") {
        return d.QLocation.Class(structuredUrl.resourceId as d.QClassId);
      }
      return defaultLocation;
    case newClassPath: {
      const programId = structuredUrl.searchParams.get(newClassProgramId);
      if (typeof programId === "string") {
        return d.QLocation.NewClass(programId as d.QProgramId);
      }
      return defaultLocation;
    }
    case classInvitationPath: {
      const classInvitationToken = structuredUrl.resourceId;
      if (typeof classInvitationToken === "string") {
        return d.QLocation.ClassInvitation(
          classInvitationToken as d.QClassInvitationToken
        );
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

const addNewPrefix = (path: string): string => "new-" + path;
const addEditPrefix = (path: string): string => "edit-" + path;

const accountTokenKey = "account-token";
const settingPath = "setting";
const programPath = "program";
const newProgramPath = addNewPrefix(programPath);
const questionPath = "question";
const newQuestionPath = addNewPrefix(questionPath);
const newQuestionProgramId = "programId";
const newQuestionParent = "parent";
const newQuestionText = "text";
const classPath = "class";
const newClassPath = addNewPrefix(classPath);
const newClassProgramId = "programId";
const classInvitationPath = "class-invitation";
const editQuestionPath = addEditPrefix(questionPath);

/**
 * 構造化されたURL
 * フラグメントは クエリパラメータのような出力がされる
 */
type StructuredUrl = {
  /** リソース名 `/{question}` */
  readonly resourceName: string;
  /** リソースID `/question/{id}` */
  readonly resourceId?: string;
  /** クエリパラメーター */
  readonly searchParams: ReadonlyMap<string, string>;
  /** ハッシュ (フラグメント) サーバーへのリクエストに含まれない */
  readonly hash: ReadonlyMap<string, string>;
};

const structuredUrlToUrl = (structuredUrl: StructuredUrl): URL => {
  const url = new URL(origin);
  url.pathname =
    "/" +
    structuredUrl.resourceName +
    (typeof structuredUrl.resourceId === "string"
      ? "/" + structuredUrl.resourceId
      : "");
  if (structuredUrl.searchParams !== undefined) {
    for (const [key, value] of structuredUrl.searchParams) {
      url.searchParams.set(key, value);
    }
  }
  if (structuredUrl.hash !== undefined) {
    url.hash = new URLSearchParams([...structuredUrl.hash]).toString();
  }
  return url;
};

const urlToStructuredUrl = (url: URL): StructuredUrl => {
  const pathList = url.pathname.split("/");
  return {
    resourceName: typeof pathList[1] === "string" ? pathList[1] : "",
    resourceId: pathList[2],
    searchParams: new Map([...url.searchParams]),
    hash: new Map([...new URLSearchParams(url.hash.slice(1))]),
  };
};
