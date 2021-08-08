import * as apiCodec from "../common/apiCodec";
import * as crypto from "crypto";
import * as d from "../data";
import * as firebaseInterface from "./firebaseInterface";
import * as jimp from "jimp";
import * as jsonWebToken from "jsonwebtoken";
import * as validation from "../common/validation";
import axios from "axios";
import { imagePng } from "./mimeType";
import { lineLoginCallbackUrl } from "../common/url";

type ApiCodecType = typeof apiCodec;

export const apiFunc: {
  [apiName in keyof ApiCodecType]: (
    request: apiCodec.GetCodecType<ApiCodecType[apiName]["request"]>
  ) => Promise<apiCodec.GetCodecType<ApiCodecType[apiName]["response"]>>;
} = {
  requestLineLoginUrl: async (qLocation) => {
    const state = createRandomId();
    await firebaseInterface.createLogInState(state, qLocation);
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
      throw new Error(programNameResult.error);
    }
    const programId = createRandomId() as d.QProgramId;
    await firebaseInterface.createProgram({
      id: programId,
      name: programNameResult.ok,
      createAccountId: account.id,
    });
    return {
      id: programId,
      name: programNameResult.ok,
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
      throw new Error(questionTextResult.error);
    }
    if (parameter.parent._ === "Just") {
      const parent = await firebaseInterface.getQuestion(
        parameter.parent.value
      );
      if (parent === undefined || program.id !== parent.programId) {
        throw new Error("親の質問が存在しないか, 違うプログラムの質問");
      }
    }
    const questionId = createRandomId() as d.QQuestionId;
    const question = {
      id: questionId,
      name: questionTextResult.ok,
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
      throw new Error(classNameResult.error);
    }
    const qClass: d.QClass = {
      id: createRandomId() as d.QClassId,
      name: classNameResult.ok,
      programId: parameter.programId,
      createAccountId: account.id,
      invitationToken: createRandomToken() as d.QClassInvitationToken,
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
      throw new Error(questionTextResult.error);
    }
    if (parameter.parentId._ === "Nothing") {
      firebaseInterface.setQuestion(
        parameter.questionId,
        questionTextResult.ok,
        null
      );
      return {
        ...question,
        name: questionTextResult.ok,
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
      questionTextResult.ok,
      parameter.parentId.value
    );
    return {
      ...question,
      name: questionTextResult.ok,
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
    if (joinData !== undefined && joinData.role === d.QRole.Student) {
      throw new Error("すでに参加しています");
    }
    await firebaseInterface.joinClassAsStudent(
      invitationTokenResult.id,
      account.id,
      new Date()
    );
    return invitationTokenResult;
  },
  getQuestionInProgramByQuestionId: async (parameter) => {
    const account = await validateAndGetAccount(parameter.accountToken);
    const question = await firebaseInterface.getQuestion(parameter.questionId);
    if (question === undefined) {
      throw new Error("指定した質問がが存在しないか, 作った本人でない");
    }
    await validateAndGetProgram(account.id, question.programId);
    return firebaseInterface.getQuestionListByProgramId(question.programId);
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
        participantList.some(({ first }) => first.id === account.id) ||
        qClass.createAccountId === account.id
      )
    ) {
      throw new Error(
        "クラスの作成者, 参加者以外がクラスの参加者を取得することはできません"
      );
    }
    return participantList;
  },
  getStudentQuestionTreeInClass: async (parameter) => {
    const account = await validateAndGetAccount(parameter.first);
    const isStudent = firebaseInterface.isStudent(account.id, parameter.second);
    if (!isStudent) {
      throw new Error(
        "生徒以外はクラスの質問と回答状況を取得することはできません"
      );
    }

    // TODO
    return [];
  },
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
): Promise<d.Maybe<d.AccountTokenAndQLocation>> => {
  const locationMaybe = await firebaseInterface.existsLoginState(state);
  if (locationMaybe === undefined) {
    return d.Maybe.Nothing();
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
  return d.Maybe.Just({
    qLocation: locationMaybe,
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
  accountTokenHash: d.AccountTokenHash;
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

const hashAccountToken = (accountToken: d.AccountToken): d.AccountTokenHash =>
  crypto
    .createHash("sha256")
    .update(new Uint8Array(d.AccountToken.codec.encode(accountToken)))
    .digest("hex") as d.AccountTokenHash;

const getAndSaveUserImage = async (imageUrl: URL): Promise<d.ImageHash> => {
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
const savePngFile = async (binary: Uint8Array): Promise<d.ImageHash> => {
  const imageHash = createImageHashFromUint8ArrayAndMimeType(binary, imagePng);
  await firebaseInterface.savePngFile(imageHash, binary);
  return imageHash;
};

const createImageHashFromUint8ArrayAndMimeType = (
  binary: Uint8Array,
  mimeType: string
): d.ImageHash =>
  crypto
    .createHash("sha256")
    .update(binary)
    .update(mimeType, "utf8")
    .digest("hex") as d.ImageHash;

/**
 * アカウントトークンが正しいかと, アカウントの情報を得る
 * @throws 指定したアカウントトークンのアカウントが見つからなかったとき
 */
const validateAndGetAccount = async (
  accountToken: d.AccountToken
): Promise<d.QAccount> => {
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
  programId: d.QProgramId
): Promise<d.QProgram> => {
  const program = await firebaseInterface.getProgram(programId);
  if (program === undefined || program.createAccountId !== accountId) {
    throw new Error("指定したプログラムが存在しないか, 作った本人でない");
  }
  return program;
};
