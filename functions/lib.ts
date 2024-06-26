import * as crypto from "crypto";
import * as d from "../data";
import * as firebaseInterface from "./firebaseInterface";
import * as jimp from "jimp";
import * as jsonWebToken from "jsonwebtoken";
import * as validation from "../common/validation";
import { ApiCodecType, GetCodecType } from "../common/apiCodec";
import { QuestionTree, getQuestionTree } from "../client/state/question";
import axios, { AxiosResponse } from "axios";
import { imagePng } from "./mimeType";
import { lineLoginCallbackUrl } from "../common/url";

export const apiFunc: {
  [apiName in keyof ApiCodecType]: (
    request: GetCodecType<ApiCodecType[apiName]["request"]>
  ) => Promise<GetCodecType<ApiCodecType[apiName]["response"]>>;
} = {
  requestLineLoginUrl: async (location) => {
    const state = createRandomId();
    await firebaseInterface.createLogInState(state, location);
    return generateLineLogInUrl(state).toString();
  },
  getAccountTokenAndLocationByCodeAndState: (codeAndState) => {
    return lineLoginCallback(codeAndState.code, codeAndState.state);
  },
  getAccountData: async (accountToken) => {
    const account = await validateAndGetAccount(accountToken);
    const [
      createdProgramList,
      createdClassList,
      joinedClassList,
      notDoneNotificationCount,
    ] = await Promise.all([
      firebaseInterface.getProgramListByCreateAccountId(account.id),
      firebaseInterface.getClassListByCreateAccountId(account.id),
      firebaseInterface.getJoinClassDataListByAccountId(account.id),
      firebaseInterface.getNotDoneNotificationCount(account.id),
    ]);
    return {
      account: {
        name: account.name,
        iconHash: account.iconHash,
        id: account.id,
      },
      createdClassList,
      createdProgramList,
      joinedClassList,
      notDoneNotificationCount,
    };
  },
  createProgram: async (parameter) => {
    const account = await validateAndGetAccount(parameter.accountToken);
    const programNameResult = validation.stringToValidProgramName(
      parameter.programName
    );
    if (programNameResult._ === "Error") {
      throw new Error(programNameResult.errorValue);
    }
    const programId = createRandomId() as d.ProgramId;
    await firebaseInterface.createProgram({
      id: programId,
      name: programNameResult.okValue,
      createAccountId: account.id,
    });
    return {
      id: programId,
      name: programNameResult.okValue,
      createAccountId: account.id,
    };
  },
  getCreatedProgram: async (accountToken) => {
    const account = await validateAndGetAccount(accountToken);
    return firebaseInterface.getProgramListByCreateAccountId(account.id);
  },
  createQuestion: async (parameter) => {
    const account = await validateAndGetAccount(parameter.accountToken);
    const program = await validateAndGetProgram(
      account.id,
      parameter.programId
    );
    const questionTextResult = validation.stringToValidQuestionText(
      parameter.questionText
    );
    if (questionTextResult._ === "Error") {
      throw new Error(questionTextResult.errorValue);
    }
    if (parameter.parent._ === "Some") {
      const parent = await firebaseInterface.getQuestion(
        parameter.parent.value
      );
      if (parent === undefined || program.id !== parent.programId) {
        throw new Error("親の質問が存在しないか, 違うプログラムの質問");
      }
    }
    const questionId = createRandomId() as d.QuestionId;
    const question = {
      id: questionId,
      name: questionTextResult.okValue,
      parent: parameter.parent,
      programId: parameter.programId,
    };
    await firebaseInterface.createQuestion(question);
    return question;
  },
  getQuestionInCreatedProgram: async (parameter) => {
    const account = await validateAndGetAccount(parameter.accountToken);
    await validateAndGetProgram(account.id, parameter.programId);
    return firebaseInterface.getQuestionListByProgramId(parameter.programId);
  },
  createClass: async (parameter) => {
    const account = await validateAndGetAccount(parameter.accountToken);
    await validateAndGetProgram(account.id, parameter.programId);
    const classNameResult = validation.stringToValidClassName(
      parameter.className
    );
    if (classNameResult._ === "Error") {
      throw new Error(classNameResult.errorValue);
    }
    const qClass: d.AdminClass = {
      id: createRandomId() as d.ClassId,
      name: classNameResult.okValue,
      programId: parameter.programId,
      studentInvitationToken:
        createRandomToken() as d.StudentClassInvitationToken,
    };
    await firebaseInterface.createClass(qClass, account.id);
    return qClass;
  },
  getClassListInProgram: async (parameter) => {
    const account = await validateAndGetAccount(parameter.accountToken);
    const program = await validateAndGetProgram(
      account.id,
      parameter.programId
    );
    return firebaseInterface.getClassListInProgram(program.id);
  },
  editQuestion: async (parameter) => {
    const account = await validateAndGetAccount(parameter.accountToken);
    const question = await firebaseInterface.getQuestion(parameter.questionId);
    if (question === undefined) {
      throw new Error("編集する質問を見つけられなかった");
    }
    await validateAndGetProgram(account.id, question.programId);
    const questionTextResult = validation.stringToValidQuestionText(
      parameter.name
    );
    if (questionTextResult._ === "Error") {
      throw new Error(questionTextResult.errorValue);
    }
    if (parameter.parentId._ === "None") {
      firebaseInterface.setQuestion(
        parameter.questionId,
        questionTextResult.okValue,
        null
      );
      return {
        ...question,
        name: questionTextResult.okValue,
      };
    }
    const parentValidationResult = validation.questionParentIsValid(
      parameter.questionId,
      parameter.parentId.value,
      question.programId,
      new Map(
        (
          await firebaseInterface.getQuestionListByProgramId(question.programId)
        ).map((q) => [q.id, q])
      )
    );
    if (!parentValidationResult.isValid) {
      throw new Error(parentValidationResult.reason);
    }
    firebaseInterface.setQuestion(
      parameter.questionId,
      questionTextResult.okValue,
      parameter.parentId.value
    );
    return {
      ...question,
      name: questionTextResult.okValue,
    };
  },
  getClassByClassInvitationToken: async (classInvitationToken) => {
    const result = await firebaseInterface.getClassByClassInvitationToken(
      classInvitationToken
    );
    if (result === undefined) {
      throw new Error("無効な招待です");
    }
    return result;
  },
  joinClassAsStudent: async (parameter) => {
    const account = await validateAndGetAccount(parameter.accountToken);
    const invitationTokenResult =
      await firebaseInterface.getClassByClassInvitationToken(
        parameter.classInvitationToken
      );
    if (invitationTokenResult === undefined) {
      throw new Error("無効な招待です");
    }
    if (invitationTokenResult.createAccountId === account.id) {
      throw new Error("クラス作成者は, 生徒としてクラスに入れません");
    }
    const joinData = await firebaseInterface.getJoinClassData(
      invitationTokenResult.id,
      account.id
    );
    if (
      joinData !== undefined &&
      joinData.role === d.ClassParticipantRole.Student
    ) {
      throw new Error("すでに参加しています");
    }
    await firebaseInterface.joinClassAsStudent(
      invitationTokenResult.id,
      account.id,
      new Date()
    );
    return {
      id: invitationTokenResult.id,
      name: invitationTokenResult.name,
      createAccountId: invitationTokenResult.createAccountId,
      programId: invitationTokenResult.programId,
      role: d.ClassParticipantRole.Student,
    };
  },
  getClassParticipant: async (parameter) => {
    const account = await validateAndGetAccount(parameter.accountToken);
    const qClass = await firebaseInterface.getClassByClassId(parameter.classId);
    if (qClass === undefined) {
      throw new Error("クラスが存在しません");
    }
    const participantList = await firebaseInterface.getJoinClassDataFromClassId(
      parameter.classId
    );

    if (
      !(
        participantList.some(
          (participant) => participant.account.id === account.id
        ) || qClass.createAccountId === account.id
      )
    ) {
      throw new Error(
        "クラスの作成者, 参加者以外がクラスの参加者を取得することはできません"
      );
    }
    return participantList;
  },
  getStudentQuestionTreeInClass: async ({ accountToken, classId }) => {
    const account = await validateAndGetAccount(accountToken);
    const isStudent = firebaseInterface.isStudent(account.id, classId);
    if (!isStudent) {
      throw new Error(
        "生徒以外はクラスの質問と回答状況を取得することはできません"
      );
    }
    const qClass = await firebaseInterface.getClassByClassId(classId);
    if (qClass === undefined) {
      throw new Error("クラスが存在しません");
    }

    const [questionList, answerList] = await Promise.all([
      firebaseInterface.getQuestionListByProgramId(qClass.programId),
      firebaseInterface.getAnswerListByStudentIdAndClassId(account.id, classId),
    ]);

    return getQuestionTree(qClass.programId, questionList).map((tree) =>
      questionTreeToStudentSelfQuestionTree(tree, answerList)
    );
  },
  answerQuestion: async (parameter) => {
    const account = await validateAndGetAccount(parameter.accountToken);
    const isStudent = firebaseInterface.isStudent(
      account.id,
      parameter.classId
    );
    if (!isStudent) {
      throw new Error("生徒以外は質問に答えることはできません");
    }
    const qClass = await firebaseInterface.getClassByClassId(parameter.classId);
    if (qClass === undefined) {
      throw new Error("クラスが存在しません");
    }
    await firebaseInterface.setAnswer({
      accountId: account.id,
      classId: parameter.classId,
      isConfirm: parameter.isConfirm,
      questionId: parameter.questionId,
      text: parameter.answerText,
    });

    if (parameter.isConfirm) {
      firebaseInterface.addNotification({
        accountId: qClass.createAccountId,
        event: {
          tag: "NewAnswer",
          idData: {
            answerStudentId: account.id,
            classId: parameter.classId,
            questionId: parameter.questionId,
          },
        },
        id: d.NotificationId.fromString(createRandomId()),
      });
    }

    const [questionList, answerList] = await Promise.all([
      firebaseInterface.getQuestionListByProgramId(qClass.programId),
      firebaseInterface.getAnswerListByStudentIdAndClassId(
        account.id,
        parameter.classId
      ),
    ]);

    return getQuestionTree(qClass.programId, questionList).map((tree) =>
      questionTreeToStudentSelfQuestionTree(tree, answerList)
    );
  },
  getStudentConfirmedAnswerList: async (parameter) => {
    const account = await validateAndGetAccount(parameter.accountToken);
    const qClass = await firebaseInterface.getClassByClassId(parameter.classId);
    if (qClass === undefined) {
      throw new Error("クラスが存在しません");
    }
    if (qClass.createAccountId !== account.id) {
      throw new Error(
        "クラスの作成者以外が, 生徒の確定した回答を見ることはできません"
      );
    }
    const list = await firebaseInterface.getAnswerListByStudentIdAndClassId(
      parameter.studentAccountId,
      parameter.classId
    );
    return list.flatMap(
      (answer): ReadonlyArray<d.ConfirmedAnswer> =>
        answer.isConfirm
          ? [
              {
                answer: answer.text,
                questionId: answer.questionId,
              },
            ]
          : []
    );
  },
  getAnswersFromOtherStudents: async (parameter) => {
    const account = await validateAndGetAccount(parameter.accountToken);
    const isStudent = firebaseInterface.isStudent(
      account.id,
      parameter.classId
    );
    if (!isStudent) {
      throw new Error("生徒以外は他の生徒の回答を見ることはできません");
    }
    const list = await firebaseInterface.getAnswerListByClassIdAndQuestionId(
      parameter.classId,
      parameter.questionId
    );
    return list.flatMap(
      (answer): ReadonlyArray<d.AnswersFromOtherStudent> =>
        answer.isConfirm
          ? [
              {
                answerText: answer.text,
                studentId: answer.studentId,
              },
            ]
          : []
    );
  },
  addComment: async (parameter) => {
    const account = await validateAndGetAccount(parameter.accountToken);
    const isStudentOrClassCreatorResult = await getIsStudentOrClassCreator(
      account.id,
      parameter.classId
    );
    if (isStudentOrClassCreatorResult.result === "none") {
      throw new Error("生徒か管理者以外はコメントに追加できません");
    }
    const answerStudentIsValidStudent = await firebaseInterface.isStudent(
      parameter.answerStudentId,
      parameter.classId
    );
    if (!answerStudentIsValidStudent) {
      throw new Error("クラスに属していない生徒に対してコメントはできない");
    }
    const commentId = d.CommentId.fromString(createRandomId());
    await firebaseInterface.addComment({
      commentId,
      answerStudentId: parameter.answerStudentId,
      classId: parameter.classId,
      feedbackAccountId: account.id,
      message: parameter.message,
      questionId: parameter.questionId,
    });
    // コメントした本人には通知しない
    const sentAccountId = new Set<d.AccountId>([account.id]);

    if (parameter.answerStudentId !== account.id) {
      // 管理者に通知
      addNewCommentInCreatedClass(
        sentAccountId,
        isStudentOrClassCreatorResult.createAccountId,
        commentId
      );
      sentAccountId.add(isStudentOrClassCreatorResult.createAccountId);
      // 回答者に通知
      firebaseInterface.addNotification({
        accountId: parameter.answerStudentId,
        event: { tag: "NewComment", commentId },
        id: d.NotificationId.fromString(createRandomId()),
      });
      sentAccountId.add(parameter.answerStudentId);
    }
    const commentList = await firebaseInterface.getCommentInAnswer({
      accountId: parameter.answerStudentId,
      classId: parameter.classId,
      questionId: parameter.questionId,
    });
    // コメントした人に通知
    for (const comment of commentList) {
      addNewCommentInCreatedClass(sentAccountId, comment.accountId, commentId);
      sentAccountId.add(comment.accountId);
    }
    return commentList;
  },
  getComment: async (parameter) => {
    const account = await validateAndGetAccount(parameter.accountToken);
    if (
      (await getIsStudentOrClassCreator(account.id, parameter.classId))
        .result === "none"
    ) {
      throw new Error("生徒か管理者以外はコメントを取得できません");
    }
    return firebaseInterface.getCommentInAnswer({
      accountId: parameter.answerStudentId,
      classId: parameter.classId,
      questionId: parameter.questionId,
    });
  },
  getNotificationList: async (accountToken) => {
    const account = await validateAndGetAccount(accountToken);
    return firebaseInterface.getNotificationListByAccount(account.id);
  },
  notificationSetDone: async (parameter) => {
    const account = await validateAndGetAccount(parameter.accountToken);
    await firebaseInterface.setNotificationDone(parameter.notificationId);
    return firebaseInterface.getNotificationListByAccount(account.id);
  },
};

const questionTreeToStudentSelfQuestionTree = (
  questionTree: QuestionTree,
  answerList: ReadonlyArray<{
    readonly questionId: d.QuestionId;
    readonly text: string;
    readonly isConfirm: boolean;
  }>
): d.StudentSelfQuestionTree => {
  const sameQuestionIdAnswer = answerList.find(
    (answer) => answer.questionId === questionTree.id
  );
  return {
    questionId: questionTree.id,
    answer:
      sameQuestionIdAnswer === undefined
        ? d.Option.None()
        : d.Option.Some({
            isConfirm: sameQuestionIdAnswer.isConfirm,
            text: sameQuestionIdAnswer.text,
          }),
    questionText: questionTree.text,
    children: questionTree.children.map((child) =>
      questionTreeToStudentSelfQuestionTree(child, answerList)
    ),
  };
};

const lineLoginClientId = "1655691758";

const generateLineLogInUrl = (state: string): URL => {
  const url = new URL("https://access.line.me/oauth2/v2.1/authorize");
  url.searchParams.append("response_type", "code");
  url.searchParams.append("client_id", lineLoginClientId);
  url.searchParams.append("redirect_uri", lineLoginCallbackUrl);
  url.searchParams.append("state", state);
  url.searchParams.append("scope", "profile openid");
  return url;
};

const lineLoginCallback = async (
  code: string,
  state: string
): Promise<d.Option<d.AccountTokenAndLocation>> => {
  const locationMaybe = await firebaseInterface.existsLoginState(state);
  if (locationMaybe === undefined) {
    return d.Option.None();
  }
  await firebaseInterface.deleteLoginState(state);
  const profile = await getLineProfile(code);
  const account = await firebaseInterface.getAccountByLineId(profile.id);
  const accountTokenAndHash = issueAccessToken();
  if (account === undefined) {
    const iconHash = await getAndSaveUserImage(profile.imageUrl);
    await firebaseInterface.createAccount({
      id: createRandomId() as d.AccountId,
      lineId: profile.id,
      iconHash,
      name: profile.name,
      accountTokenHash: accountTokenAndHash.accountTokenHash,
    });
  } else {
    await firebaseInterface.updateAccountToken(
      account.id,
      accountTokenAndHash.accountTokenHash
    );
  }
  return d.Option.Some({
    location: locationMaybe,
    accountToken: accountTokenAndHash.accountToken,
  });
};

/**
 * Id. 各種リソースを識別するために使うID. UUID(v4)やIPv6と同じ128bit, 16bytes
 * 小文字に統一して, 大文字, ハイフンは使わない. 長さは32文字
 */
const createRandomId = (): string => {
  return crypto.randomBytes(16).toString("hex");
};

const getLineProfile = async (
  code: string
): Promise<{ name: string; id: string; imageUrl: URL }> => {
  const response = await axios.post<
    URLSearchParams,
    AxiosResponse<{ [key in string]: unknown }>
  >(
    "https://api.line.me/oauth2/v2.1/token",
    new URLSearchParams([
      ["grant_type", "authorization_code"],
      ["code", code],
      ["redirect_uri", lineLoginCallbackUrl],
      ["client_id", lineLoginClientId],
      ["client_secret", firebaseInterface.lineLoginSecret()],
    ]),
    {
      headers: {
        accept: "application/json",
        "content-type": "application/x-www-form-urlencoded",
      },
    }
  );
  const idToken: unknown = response.data.id_token;
  if (typeof idToken !== "string") {
    throw new Error(
      "LINEにプロフィール情報をリクエストしたら, 解釈できないレスポンスが返された!"
    );
  }
  const decoded = jsonWebToken.decode(idToken);
  if (typeof decoded === "string" || decoded === null) {
    throw new Error("Google idToken not include object");
  }
  const markedDecoded = decoded as {
    iss: unknown;
    sub: unknown;
    name: unknown;
    picture: unknown;
  };
  if (
    markedDecoded.iss !== "https://access.line.me" ||
    typeof markedDecoded.name !== "string" ||
    typeof markedDecoded.sub !== "string" ||
    typeof markedDecoded.picture !== "string"
  ) {
    console.error(
      `LINEから送られてきたIDトークンがおかしい ${JSON.stringify(
        markedDecoded
      )}`
    );
    throw new Error("LINEから送られてきたIDトークンがおかしい");
  }

  return {
    id: markedDecoded.sub,
    name: markedDecoded.name,
    imageUrl: new URL(markedDecoded.picture),
  };
};

/**
 * アクセストークンを生成する
 */
const issueAccessToken = (): {
  accountToken: d.AccountToken;
  accountTokenHash: d.AccountTokenHashValue;
} => {
  const accountToken = createRandomToken() as d.AccountToken;
  return {
    accountToken,
    accountTokenHash: hashAccountToken(accountToken),
  };
};

const createRandomToken = (): string => {
  return crypto.randomBytes(32).toString("hex");
};

const hashAccountToken = (
  accountToken: d.AccountToken
): d.AccountTokenHashValue =>
  crypto
    .createHash("sha256")
    .update(new Uint8Array(d.AccountToken.codec.encode(accountToken)))
    .digest("hex") as d.AccountTokenHashValue;

const getAndSaveUserImage = async (
  imageUrl: URL
): Promise<d.ImageHashValue> => {
  const response = await axios.get<Buffer>(imageUrl.toString(), {
    responseType: "arraybuffer",
  });
  return savePngFile(
    await (await jimp.create(response.data))
      .resize(64, 64)
      .getBufferAsync(imagePng)
  );
};

/**
 * Cloud Storage for Firebase にPNGファイルを保存する
 */
const savePngFile = async (binary: Uint8Array): Promise<d.ImageHashValue> => {
  const imageHash = createImageHashFromUint8ArrayAndMimeType(binary, imagePng);
  await firebaseInterface.savePngFile(imageHash, binary);
  return imageHash;
};

const createImageHashFromUint8ArrayAndMimeType = (
  binary: Uint8Array,
  mimeType: string
): d.ImageHashValue =>
  crypto
    .createHash("sha256")
    .update(binary)
    .update(mimeType, "utf8")
    .digest("hex") as d.ImageHashValue;

/**
 * アカウントトークンが正しいかと, アカウントの情報を得る
 * @throws 指定したアカウントトークンのアカウントが見つからなかったとき
 */
const validateAndGetAccount = async (
  accountToken: d.AccountToken
): Promise<d.Account> => {
  const accountResult = await firebaseInterface.getAccountByAccountTokenHash(
    hashAccountToken(accountToken)
  );
  if (accountResult === undefined) {
    throw new Error("アカウントトークンからアカウントの情報を得られなかった");
  }
  return accountResult;
};

/**
 * プログラムの情報を得る
 * @throws プログラムが存在しなかった場合, 指定したアカウントが取得したプログラムを作っていないとき
 */
const validateAndGetProgram = async (
  accountId: d.AccountId,
  programId: d.ProgramId
): Promise<d.Program> => {
  const program = await firebaseInterface.getProgram(programId);
  if (program === undefined || program.createAccountId !== accountId) {
    throw new Error("指定したプログラムが存在しないか, 作った本人でない");
  }
  return program;
};

export const getIsStudentOrClassCreator = async (
  accountId: d.AccountId,
  classId: d.ClassId
): Promise<{
  readonly result: "student" | "creator" | "none";
  /** クラスの作成者 */
  readonly createAccountId: d.AccountId;
}> => {
  const qClass = await firebaseInterface.getClassByClassId(classId);
  if (qClass === undefined) {
    throw new Error("クラスが存在しません");
  }
  if (qClass.createAccountId === accountId) {
    return {
      result: "creator",
      createAccountId: qClass.createAccountId,
    };
  }
  return {
    result: (await firebaseInterface.isStudent(accountId, classId))
      ? "student"
      : "none",
    createAccountId: qClass.createAccountId,
  };
};

const addNewCommentInCreatedClass = async (
  sentAccountIdSet: ReadonlySet<d.AccountId>,
  accountId: d.AccountId,
  commentId: d.CommentId
): Promise<void> => {
  if (sentAccountIdSet.has(accountId)) {
    return;
  }
  await firebaseInterface.addNotification({
    accountId,
    event: { tag: "NewComment", commentId },
    id: d.NotificationId.fromString(createRandomId()),
  });
};
