import * as admin from "firebase-admin";
import * as d from "../data";
import * as functions from "firebase-functions";
import type * as stream from "stream";
import type * as typedFirestore from "typed-admin-firestore";
import { imagePng } from "./mimeType";

const app = admin.initializeApp();
const firestore = app.firestore() as unknown as typedFirestore.Firestore<{
  loginState: {
    key: string;
    value: {
      createTime: admin.firestore.Timestamp;
    };
    subCollections: Record<never, never>;
  };
  account: {
    key: d.AccountId;
    value: {
      name: string;
      lineId: string;
      iconHash: d.ImageHash;
      createTime: admin.firestore.Timestamp;
      accountTokenHash: string;
    };
    subCollections: Record<never, never>;
  };
  program: {
    key: d.QProgramId;
    value: {
      name: string;
      createAccountId: d.AccountId;
      createTime: admin.firestore.Timestamp;
    };
    subCollections: Record<never, never>;
  };
  question: {
    key: d.QQuestionId;
    value: {
      name: string;
      parent: d.QQuestionId | null;
      programId: d.QProgramId;
      createTime: admin.firestore.Timestamp;
    };
    subCollections: Record<never, never>;
  };
  class: {
    key: d.QClassId;
    value: {
      name: string;
      programId: d.QProgramId;
      invitationToken: d.QClassInvitationToken;
      createAccountId: d.AccountId;
      createTime: admin.firestore.Timestamp;
    };
    subCollections: Record<never, never>;
  };
  classJoinData: {
    key: `${d.AccountId}_${d.QClassId}`;
    value: {
      joinTime: admin.firestore.Timestamp;
      role: d.QRole;
      accountId: d.AccountId;
      classId: d.QClassId;
    };
    subCollections: Record<never, never>;
  };
  answer: {
    key: `${d.QQuestionId}_${d.QProgramId}_${d.AccountId}_${number}`;
    value: {
      text: string;
      questionId: d.QQuestionId;
      programId: d.QProgramId;
      accountId: d.AccountId;
      createTime: admin.firestore.Timestamp;
      version: number;
    };
    subCollections: Record<never, never>;
  };
}>;
const cloudStorageBucket = app.storage().bucket();

export const createLogInState = async (state: string): Promise<void> => {
  await firestore.collection("loginState").doc(state).create({
    createTime: admin.firestore.Timestamp.now(),
  });
};

export const existsLoginState = async (state: string): Promise<boolean> => {
  const document = (
    await firestore.collection("loginState").doc(state).get()
  ).data();
  return document !== undefined;
};

export const deleteLoginState = async (state: string): Promise<void> => {
  await firestore.collection("loginState").doc(state).delete();
};

export const createAccount = async (accountCrateData: {
  id: d.AccountId;
  name: string;
  lineId: string;
  iconHash: d.ImageHash;
  accountTokenHash: string;
}): Promise<void> => {
  await firestore.collection("account").doc(accountCrateData.id).create({
    name: accountCrateData.name,
    lineId: accountCrateData.lineId,
    iconHash: accountCrateData.iconHash,
    createTime: admin.firestore.Timestamp.now(),
    accountTokenHash: accountCrateData.accountTokenHash,
  });
};

export const getAccountByAccountTokenHash = async (
  accountTokenHash: string
): Promise<
  { id: d.AccountId; name: string; iconHash: d.ImageHash } | undefined
> => {
  const documents = await firestore
    .collection("account")
    .where("accountTokenHash", "==", accountTokenHash)
    .get();
  const document = documents.docs[0];
  if (document === undefined) {
    return undefined;
  }
  const data = document.data();
  return {
    id: document.id,
    name: data.name,
    iconHash: data.iconHash,
  };
};

export const getAccountByLineId = async (
  lineId: string
): Promise<
  undefined | { id: d.AccountId; name: string; iconHash: d.ImageHash }
> => {
  const documents = await firestore
    .collection("account")
    .where("lineId", "==", lineId)
    .get();
  const document = documents.docs[0];
  if (document === undefined) {
    return undefined;
  }
  const data = document.data();
  return {
    id: document.id,
    name: data.name,
    iconHash: data.iconHash,
  };
};

export const updateAccountToken = async (
  accountId: d.AccountId,
  accountTokenHash: d.AccountTokenHash
): Promise<void> => {
  await firestore.collection("account").doc(accountId).update({
    accountTokenHash,
  });
};

export const createProgram = async (data: {
  id: d.QProgramId;
  name: string;
  createAccountId: d.AccountId;
}): Promise<void> => {
  await firestore.collection("program").doc(data.id).create({
    name: data.name,
    createAccountId: data.createAccountId,
    createTime: admin.firestore.FieldValue.serverTimestamp(),
  });
};

export const getProgram = async (
  programId: d.QProgramId
): Promise<d.QProgram | undefined> => {
  const docSnapshot = await firestore
    .collection("program")
    .doc(programId)
    .get();
  const doc = docSnapshot.data();
  if (doc === undefined) {
    return undefined;
  }
  return {
    id: docSnapshot.id,
    name: doc.name,
    createAccountId: doc.createAccountId,
  };
};

export const getProgramListByCreateAccountId = async (
  createAccountId: d.AccountId
): Promise<ReadonlyArray<d.QProgram>> => {
  const result = await firestore
    .collection("program")
    .where("createAccountId", "==", createAccountId)
    .get();
  return result.docs.map<d.QProgram>((docSnapshot): d.QProgram => {
    const document = docSnapshot.data();
    return {
      id: docSnapshot.id,
      name: document.name,
      createAccountId: document.createAccountId,
    };
  });
};

export const createQuestion = async (question: d.QQuestion): Promise<void> => {
  await firestore
    .collection("question")
    .doc(question.id)
    .create({
      name: question.name,
      parent: question.parent._ === "Just" ? question.parent.value : null,
      programId: question.programId,
      createTime: admin.firestore.FieldValue.serverTimestamp(),
    });
};

export const getQuestion = async (
  questionId: d.QQuestionId
): Promise<d.QQuestion | undefined> => {
  const docSnapshot = await firestore
    .collection("question")
    .doc(questionId)
    .get();
  const doc = docSnapshot.data();
  if (doc === undefined) {
    return undefined;
  }
  return {
    id: docSnapshot.id,
    name: doc.name,
    parent: doc.parent === null ? d.Maybe.Nothing() : d.Maybe.Just(doc.parent),
    programId: doc.programId,
  };
};

export const setQuestion = async (
  questionId: d.QQuestionId,
  name: string,
  parentId: d.QQuestionId | null
): Promise<void> => {
  await firestore.collection("question").doc(questionId).update({
    name,
    parent: parentId,
  });
};

export const getQuestionListByProgramId = async (
  programId: d.QProgramId
): Promise<ReadonlyArray<d.QQuestion>> => {
  const result = await firestore
    .collection("question")
    .where("programId", "==", programId)
    .get();
  return result.docs.map<d.QQuestion>((docSnapshot): d.QQuestion => {
    const document = docSnapshot.data();
    return {
      id: docSnapshot.id,
      name: document.name,
      parent:
        document.parent === null
          ? d.Maybe.Nothing()
          : d.Maybe.Just(document.parent),
      programId: document.programId,
    };
  });
};

export const createClass = async (
  qClass: d.QClass,
  createAccountId: d.AccountId
): Promise<void> => {
  await firestore.collection("class").doc(qClass.id).create({
    name: qClass.name,
    programId: qClass.programId,
    invitationToken: qClass.invitationToken,
    createAccountId,
    createTime: admin.firestore.FieldValue.serverTimestamp(),
  });
};

export const getClassListInProgram = async (
  programId: d.QProgramId
): Promise<ReadonlyArray<d.QClass>> => {
  const snapshot = await firestore
    .collection("class")
    .where("programId", "==", programId)
    .get();
  return snapshot.docs.map<d.QClass>((doc): d.QClass => {
    const data = doc.data();
    return {
      id: doc.id,
      name: data.name,
      programId: data.programId,
      createAccountId: data.createAccountId,
      invitationToken: data.invitationToken,
    };
  });
};

export const getClassByClassInvitationToken = async (
  invitationToken: d.QClassInvitationToken
): Promise<d.QClass | undefined> => {
  const snapshot = await firestore
    .collection("class")
    .where("invitationToken", "==", invitationToken)
    .get();
  const doc = snapshot.docs[0];
  if (doc === undefined) {
    return undefined;
  }
  const data = doc.data();
  return {
    id: doc.id,
    name: data.name,
    invitationToken: data.invitationToken,
    programId: data.programId,
    createAccountId: data.createAccountId,
  };
};

export const getClassListByCreateAccountId = async (
  accountId: d.AccountId
): Promise<ReadonlyArray<d.QClass>> => {
  const snapshot = await firestore
    .collection("class")
    .where("createAccountId", "==", accountId)
    .get();
  return snapshot.docs.map<d.QClass>((doc): d.QClass => {
    const data = doc.data();
    return {
      id: doc.id,
      name: data.name,
      programId: data.programId,
      invitationToken: data.invitationToken,
      createAccountId: data.createAccountId,
    };
  });
};

export const getJoinClassDataListByAccountId = async (
  accountId: d.AccountId
): Promise<ReadonlyArray<d.Tuple2<d.QClassStudentOrGuest, d.QRole>>> => {
  const snapshot = await firestore
    .collection("classJoinData")
    .where("accountId", "==", accountId)
    .get();
  const result: ReadonlyArray<d.Tuple2<d.QClassStudentOrGuest, d.QRole>> =
    await Promise.all(
      snapshot.docs.map<Promise<d.Tuple2<d.QClassStudentOrGuest, d.QRole>>>(
        async (doc): Promise<d.Tuple2<d.QClassStudentOrGuest, d.QRole>> => {
          const data = doc.data();
          const classData = (
            await firestore.collection("class").doc(data.classId).get()
          ).data();
          if (classData === undefined) {
            throw new Error("unknown class " + data.classId);
          }
          return {
            first: {
              id: data.classId,
              name: classData.name,
              createAccountId: classData.createAccountId,
            },
            second: data.role,
          };
        }
      )
    );
  return result;
};

export const getClassByClassId = async (
  classId: d.QClassId
): Promise<undefined | d.QClass> => {
  const data = (await firestore.collection("class").doc(classId).get()).data();
  if (data === undefined) {
    return undefined;
  }
  return {
    id: classId,
    name: data.name,
    invitationToken: data.invitationToken,
    programId: data.programId,
    createAccountId: data.createAccountId,
  };
};

export const getJoinClassData = async (
  classId: d.QClassId,
  accountId: d.AccountId
): Promise<
  | undefined
  | {
      readonly joinTime: admin.firestore.Timestamp;
      readonly role: d.QRole;
      readonly accountId: d.AccountId;
      readonly classId: d.QClassId;
    }
> => {
  const doc = await firestore
    .collection("classJoinData")
    .doc(`${classId}_${accountId}`)
    .get();
  return doc.data();
};

export const getJoinClassDataFromClassId = async (
  classId: d.QClassId
): Promise<ReadonlyArray<d.Tuple2<d.QAccount, d.QRole>>> => {
  const docs = await firestore
    .collection("classJoinData")
    .where("classId", "==", classId)
    .get();
  const resultList: Array<d.Tuple2<d.QAccount, d.QRole>> = [];
  for (const doc of docs.docs) {
    const data = doc.data();
    // eslint-disable-next-line no-await-in-loop
    const accountData = await firestore
      .collection("account")
      .doc(data.accountId)
      .get();
    const account = accountData.data();
    if (account === undefined) {
      throw new Error("クラスの参加者のアカウント情報の取得に失敗しました");
    }
    resultList.push({
      first: {
        id: accountData.id,
        name: account.name,
        iconHash: account.iconHash,
      },
      second: data.role,
    });
  }
  return resultList;
};

export const joinClassAsStudent = async (
  classId: d.QClassId,
  accountId: d.AccountId,
  date: Date
): Promise<void> => {
  await firestore
    .collection("classJoinData")
    .doc(`${classId}_${accountId}`)
    .create({
      accountId,
      classId,
      joinTime: admin.firestore.Timestamp.fromDate(date),
      role: d.QRole.Student,
    });
};

export const setAnswer = async (option: {
  readonly text: string;
  readonly questionId: d.QQuestionId;
  readonly programId: d.QProgramId;
  readonly accountId: d.AccountId;
  readonly createTime: Date;
  readonly version: number;
}): Promise<void> => {
  await firestore
    .collection("answer")
    .doc(
      `${option.questionId}_${option.programId}_${option.accountId}_${option.version}`
    )
    .create({
      text: option.text,
      questionId: option.questionId,
      programId: option.programId,
      accountId: option.accountId,
      createTime: admin.firestore.Timestamp.fromDate(option.createTime),
      version: option.version,
    });
};

/**
 * Cloud Storage for Firebase にファイルを保存する
 */
export const savePngFile = async (
  hash: string,
  binary: Uint8Array
): Promise<void> => {
  const fileName = `${hash}.png`;
  await cloudStorageBucket
    .file(fileName)
    .save(Buffer.from(binary), { contentType: imagePng });
};

/**
 * Cloud Storage for Firebase からPNGファイルを読み込む.
 * ローカルではファイルシステムからファイルを読み取る
 */
export const readPngFile = (hash: string): stream.Readable => {
  const fileName = `${hash}.png`;
  return cloudStorageBucket.file(fileName).createReadStream();
};

/**
 * Firebase の 環境変数を読む
 */
export const lineLoginSecret = (): string => {
  const config: {
    [keyA in string]: { [keyB in string]: unknown };
  } = functions.config();
  if (
    config.linelogin === undefined ||
    config.linelogin === null ||
    typeof config.linelogin.secret !== "string"
  ) {
    throw new Error(
      "LINEログインのチャネルシークレットを環境変数に保存できていない!"
    );
  }
  return config.linelogin.secret;
};
