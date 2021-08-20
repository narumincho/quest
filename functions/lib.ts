import * as apiCodec from "../common/apiCodec";
import * as crypto from "crypto";
import * as d from "../data";
import * as firebaseInterface from "./firebaseInterface";
import * as jimp from "jimp";
import * as jsonWebToken from "jsonwebtoken";
import * as validation from "../common/validation";
import { QuestionTree, getQuestionTree } from "../client/state/question";
import axios from "axios";
import { imagePng } from "./mimeType";
import { lineLoginCallbackUrl } from "../common/url";

type ApiCodecType = typeof apiCodec;

export const apiFunc: {
  [apiName in keyof ApiCodecType]: (
    request: apiCodec.GetCodecType<ApiCodecType[apiName]["request"]>
  ) => Promise<apiCodec.GetCodecType<ApiCodecType[apiName]["response"]>>;
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
    const [createdProgramList, createdClassList, joinedClassList] =
      await Promise.all([
        firebaseInterface.getProgramListByCreateAccountId(account.id),
        firebaseInterface.getClassListByCreateAccountId(account.id),
        firebaseInterface.getJoinClassDataListByAccountId(account.id),
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
      firebaseInterface.getAnswerListByAccountIdAndClassId(account.id, classId),
    ]);

    return getQuestionTree(qClass.programId, questionList).map((tree) =>
      questionTreeToStudentSelfQuestionTree(tree, answerList)
    );
  },
  answerQuestion: async ({
    accountToken,
    classId,
    isConfirm,
    questionId,
    answerText,
  }) => {
    const account = await validateAndGetAccount(accountToken);
    const isStudent = firebaseInterface.isStudent(account.id, classId);
    if (!isStudent) {
      throw new Error("生徒以外は質問に答えることはできません");
    }
    const qClass = await firebaseInterface.getClassByClassId(classId);
    if (qClass === undefined) {
      throw new Error("クラスが存在しません");
    }
    await firebaseInterface.setAnswer({
      accountId: account.id,
      classId,
      isConfirm,
      questionId,
      text: answerText,
    });

    const [questionList, answerList] = await Promise.all([
      firebaseInterface.getQuestionListByProgramId(qClass.programId),
      firebaseInterface.getAnswerListByAccountIdAndClassId(account.id, classId),
    ]);

    return getQuestionTree(qClass.programId, questionList).map((tree) =>
      questionTreeToStudentSelfQuestionTree(tree, answerList)
    );
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
  const response = await axios.post<{ [key in string]: unknown }>(
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
