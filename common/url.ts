import * as d from "../data";
import { nowMode } from "./nowMode";

/** オリジン */
const origin =
  nowMode === "development"
    ? "http://localhost:5000"
    : "https://north-quest.web.app";

export const locationToUrl = (location: d.Location): URL => {
  return structuredUrlToUrl(locationToStructuredUrl(location));
};

const locationToStructuredUrl = (location: d.Location): StructuredUrl => {
  switch (location._) {
    case "Top":
      return {
        resourceName: "",
        resourceId: undefined,
        searchParams: new Map(),
        hash: new Map(),
      };
    case "Setting":
      return {
        resourceName: settingPath,
        resourceId: undefined,
        searchParams: new Map(),
        hash: new Map(),
      };
    case "NewProgram":
      return {
        resourceName: newProgramPath,
        resourceId: undefined,
        searchParams: new Map(),
        hash: new Map(),
      };
    case "Program":
      return {
        resourceName: programPath,
        resourceId: location.programId,
        searchParams: new Map(),
        hash: new Map(),
      };
    case "NewQuestion":
      return {
        resourceName: newQuestionPath,
        resourceId: undefined,
        searchParams: new Map<string, string>([
          [newQuestionProgramId, location.newQuestionParameter.programId],
          ...(location.newQuestionParameter.parent._ === "Some"
            ? ([
                [newQuestionParent, location.newQuestionParameter.parent.value],
              ] as const)
            : []),
        ]),
        hash: new Map(),
      };
    case "AdminQuestion":
      return {
        resourceName: adminQuestionPath,
        resourceId: location.programIdAndQuestionId.questionId,
        searchParams: new Map([
          [adminQuestionProgramId, location.programIdAndQuestionId.programId],
        ]),
        hash: new Map(),
      };
    case "NewClass":
      return {
        resourceName: newClassPath,
        resourceId: undefined,
        searchParams: new Map([[newClassProgramId, location.programId]]),
        hash: new Map(),
      };
    case "Class":
      return {
        resourceName: classPath,
        resourceId: location.classId,
        searchParams: new Map(),
        hash: new Map(),
      };
    case "ClassInvitation":
      return {
        resourceName: classInvitationPath,
        resourceId: location.studentClassInvitationToken,
        searchParams: new Map(),
        hash: new Map(),
      };
    case "EditQuestion":
      return {
        resourceName: editQuestionPath,
        resourceId: location.programIdAndQuestionId.questionId,
        searchParams: new Map([
          [editQuestionProgramId, location.programIdAndQuestionId.programId],
        ]),
        hash: new Map(),
      };
    case "StudentEditQuestion":
      return {
        resourceName: studentEditQuestionPath,
        resourceId: location.classIdAndQuestionId.questionId,
        searchParams: new Map([
          [studentEditQuestionClassId, location.classIdAndQuestionId.classId],
        ]),
        hash: new Map(),
      };
  }
};

/**
 * URLから quest 内の場所と, アカウントトークンを得る
 * オリジンは無視される
 */
export const urlToUrlData = (url: URL): d.UrlData => {
  const structuredUrl = urlToStructuredUrl(url);
  return structuredUrlToLocation(structuredUrl);
};

const defaultLocation: d.Location = d.Location.Top;
/**
 * URL から quest 内の場所を得る.
 * アカウントトークンとオリジンは無視する
 */
// eslint-disable-next-line complexity
const structuredUrlToLocation = (structuredUrl: StructuredUrl): d.UrlData => {
  switch (structuredUrl.resourceName) {
    case settingPath:
      return d.UrlData.Normal(d.Location.Setting);
    case newProgramPath:
      return d.UrlData.Normal(d.Location.NewProgram);
    case programPath:
      if (typeof structuredUrl.resourceId === "string") {
        return d.UrlData.Normal(
          d.Location.Program(d.ProgramId.fromString(structuredUrl.resourceId))
        );
      }
      return d.UrlData.Normal(defaultLocation);
    case newQuestionPath: {
      const programId = structuredUrl.searchParams.get(newQuestionProgramId);
      const parent = structuredUrl.searchParams.get(newQuestionParent);
      if (typeof programId === "string") {
        return d.UrlData.Normal(
          d.Location.NewQuestion({
            programId: d.ProgramId.fromString(programId),
            parent:
              typeof parent === "string"
                ? d.Option.Some(d.QuestionId.fromString(parent))
                : d.Option.None(),
          })
        );
      }
      return d.UrlData.Normal(defaultLocation);
    }
    case adminQuestionPath: {
      const programId = structuredUrl.searchParams.get(adminQuestionProgramId);
      if (
        typeof structuredUrl.resourceId === "string" &&
        typeof programId === "string"
      ) {
        return d.UrlData.Normal(
          d.Location.AdminQuestion({
            questionId: d.QuestionId.fromString(structuredUrl.resourceId),
            programId: d.ProgramId.fromString(programId),
          })
        );
      }
      return d.UrlData.Normal(defaultLocation);
    }
    case classPath:
      if (typeof structuredUrl.resourceId === "string") {
        return d.UrlData.Normal(
          d.Location.Class(d.ClassId.fromString(structuredUrl.resourceId))
        );
      }
      return d.UrlData.Normal(defaultLocation);
    case newClassPath: {
      const programId = structuredUrl.searchParams.get(newClassProgramId);
      if (typeof programId === "string") {
        return d.UrlData.Normal(
          d.Location.NewClass(d.ProgramId.fromString(programId))
        );
      }
      return d.UrlData.Normal(defaultLocation);
    }
    case classInvitationPath: {
      const classInvitationToken = structuredUrl.resourceId;
      if (typeof classInvitationToken === "string") {
        return d.UrlData.Normal(
          d.Location.ClassInvitation(
            d.StudentClassInvitationToken.fromString(classInvitationToken)
          )
        );
      }
      return d.UrlData.Normal(defaultLocation);
    }
    case lineLoginCallbackPath: {
      const code = structuredUrl.searchParams.get("code");
      const state = structuredUrl.searchParams.get("state");
      if (typeof code === "string" && typeof state === "string") {
        return d.UrlData.LogInCallback({ code, state });
      }
      return d.UrlData.Normal(defaultLocation);
    }
    case editQuestionPath: {
      const programId = structuredUrl.searchParams.get(editQuestionProgramId);
      if (
        typeof structuredUrl.resourceId === "string" &&
        typeof programId === "string"
      ) {
        return d.UrlData.Normal(
          d.Location.EditQuestion({
            programId: d.ProgramId.fromString(programId),
            questionId: d.QuestionId.fromString(structuredUrl.resourceId),
          })
        );
      }
      return d.UrlData.Normal(defaultLocation);
    }
    case studentEditQuestionPath: {
      const classId = structuredUrl.searchParams.get(
        studentEditQuestionClassId
      );
      if (
        typeof structuredUrl.resourceId === "string" &&
        typeof classId === "string"
      ) {
        return d.UrlData.Normal(
          d.Location.StudentEditQuestion({
            classId: d.ClassId.fromString(classId),
            questionId: d.QuestionId.fromString(structuredUrl.resourceId),
          })
        );
      }
      return d.UrlData.Normal(defaultLocation);
    }
  }
  return d.UrlData.Normal(defaultLocation);
};

/** LINEログインで指定する. コールバックURL */
export const lineLoginCallbackUrl = `${origin}/lineLoginCallback`;

/** アカウントの画像などのURLを生成する */
export const imageUrl = (imageHash: d.ImageHashValue): URL =>
  new URL(`${origin}/file/${imageHash}`);

const settingPath = "setting";
const programPath = "program";
const newProgramPath = "new-program";
const adminQuestionPath = "admin-question";
const adminQuestionProgramId = "programId";
const newQuestionPath = "new-question";
const newQuestionProgramId = "programId";
const newQuestionParent = "parent";
const classPath = "class";
const newClassPath = "new-class";
const newClassProgramId = "programId";
const classInvitationPath = "class-invitation";
const editQuestionPath = "edit-question";
const editQuestionProgramId = "programId";
const studentEditQuestionPath = "student-edit-question";
const studentEditQuestionClassId = "classId";

const lineLoginCallbackPath = "lineLoginCallback";

/**
 * 構造化されたURL
 * フラグメントは クエリパラメータのような出力がされる
 */
type StructuredUrl = {
  /** リソース名 `/{question}` */
  readonly resourceName: string;
  /** リソースID `/question/{id}` */
  readonly resourceId: string | undefined;
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
