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
      location: d.Location;
    };
    subCollections: Record<never, never>;
  };
  account: {
    key: d.AccountId;
    value: {
      name: string;
      lineId: string;
      iconHash: d.ImageHashValue;
      createTime: admin.firestore.Timestamp;
      accountTokenHash: string;
    };
    subCollections: Record<never, never>;
  };
  program: {
    key: d.ProgramId;
    value: {
      name: string;
      createAccountId: d.AccountId;
      createTime: admin.firestore.Timestamp;
    };
    subCollections: Record<never, never>;
  };
  question: {
    key: d.QuestionId;
    value: {
      name: string;
      parent: d.QuestionId | null;
      programId: d.ProgramId;
      createTime: admin.firestore.Timestamp;
    };
    subCollections: Record<never, never>;
  };
  class: {
    key: d.ClassId;
    value: {
      name: string;
      programId: d.ProgramId;
      invitationToken: d.StudentClassInvitationToken;
      createAccountId: d.AccountId;
      createTime: admin.firestore.Timestamp;
    };
    subCollections: Record<never, never>;
  };
  classJoinData: {
    key: `${d.AccountId}_${d.ClassId}`;
    value: {
      joinTime: admin.firestore.Timestamp;
      role: d.ClassParticipantRole;
      accountId: d.AccountId;
      classId: d.ClassId;
    };
    subCollections: Record<never, never>;
  };
  answer: {
    key: `${d.QuestionId}_${d.ProgramId}_${d.AccountId}`;
    value: {
      text: string;
      questionId: d.QuestionId;
      classId: d.ClassId;
      accountId: d.AccountId;
      createTime: admin.firestore.Timestamp;
      updateTime: admin.firestore.Timestamp;
      isConfirm: boolean;
    };
    subCollections: Record<never, never>;
  };
}>;
const cloudStorageBucket = app.storage().bucket();

export const createLogInState = async (
  state: string,
  location: d.Location
): Promise<void> => {
  await firestore.collection("loginState").doc(state).create({
    createTime: admin.firestore.Timestamp.now(),
    location,
  });
};

export const existsLoginState = async (
  state: string
): Promise<d.Location | undefined> => {
  const document = (
    await firestore.collection("loginState").doc(state).get()
  ).data();
  return document?.location;
};

export const deleteLoginState = async (state: string): Promise<void> => {
  await firestore.collection("loginState").doc(state).delete();
};

export const createAccount = async (accountCrateData: {
  id: d.AccountId;
  name: string;
  lineId: string;
  iconHash: d.ImageHashValue;
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
  { id: d.AccountId; name: string; iconHash: d.ImageHashValue } | undefined
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
  undefined | { id: d.AccountId; name: string; iconHash: d.ImageHashValue }
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
  accountTokenHash: d.AccountTokenHashValue
): Promise<void> => {
  await firestore.collection("account").doc(accountId).update({
    accountTokenHash,
  });
};

export const createProgram = async (data: {
  id: d.ProgramId;
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
  programId: d.ProgramId
): Promise<d.Program | undefined> => {
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
): Promise<ReadonlyArray<d.Program>> => {
  const result = await firestore
    .collection("program")
    .where("createAccountId", "==", createAccountId)
    .get();
  return result.docs.map<d.Program>((docSnapshot): d.Program => {
    const document = docSnapshot.data();
    return {
      id: docSnapshot.id,
      name: document.name,
      createAccountId: document.createAccountId,
    };
  });
};

export const createQuestion = async (question: d.Question): Promise<void> => {
  await firestore
    .collection("question")
    .doc(question.id)
    .create({
      name: question.name,
      parent: question.parent._ === "Some" ? question.parent.value : null,
      programId: question.programId,
      createTime: admin.firestore.FieldValue.serverTimestamp(),
    });
};

export const getQuestion = async (
  questionId: d.QuestionId
): Promise<d.Question | undefined> => {
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
    parent: doc.parent === null ? d.Option.None() : d.Option.Some(doc.parent),
    programId: doc.programId,
  };
};

export const setQuestion = async (
  questionId: d.QuestionId,
  name: string,
  parentId: d.QuestionId | null
): Promise<void> => {
  await firestore.collection("question").doc(questionId).update({
    name,
    parent: parentId,
  });
};

export const getQuestionListByProgramId = async (
  programId: d.ProgramId
): Promise<ReadonlyArray<d.Question>> => {
  const result = await firestore
    .collection("question")
    .where("programId", "==", programId)
    .get();
  return result.docs.map<d.Question>((docSnapshot): d.Question => {
    const document = docSnapshot.data();
    return {
      id: docSnapshot.id,
      name: document.name,
      parent:
        document.parent === null
          ? d.Option.None()
          : d.Option.Some(document.parent),
      programId: document.programId,
    };
  });
};

export const createClass = async (
  qClass: d.AdminClass,
  createAccountId: d.AccountId
): Promise<void> => {
  await firestore.collection("class").doc(qClass.id).create({
    name: qClass.name,
    programId: qClass.programId,
    invitationToken: qClass.studentInvitationToken,
    createAccountId,
    createTime: admin.firestore.FieldValue.serverTimestamp(),
  });
};

export const getClassListInProgram = async (
  programId: d.ProgramId
): Promise<ReadonlyArray<ClassData>> => {
  const snapshot = await firestore
    .collection("class")
    .where("programId", "==", programId)
    .get();
  return snapshot.docs.map<ClassData>((doc): ClassData => {
    const data = doc.data();
    return {
      id: doc.id,
      name: data.name,
      programId: data.programId,
      createAccountId: data.createAccountId,
      studentInvitationToken: data.invitationToken,
    };
  });
};

export const getClassByClassInvitationToken = async (
  invitationToken: d.StudentClassInvitationToken
): Promise<ClassData | undefined> => {
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
    studentInvitationToken: data.invitationToken,
    programId: data.programId,
    createAccountId: data.createAccountId,
  };
};

export const getClassListByCreateAccountId = async (
  accountId: d.AccountId
): Promise<ReadonlyArray<ClassData>> => {
  const snapshot = await firestore
    .collection("class")
    .where("createAccountId", "==", accountId)
    .get();
  return snapshot.docs.map<ClassData>((doc): ClassData => {
    const data = doc.data();
    return {
      id: doc.id,
      name: data.name,
      programId: data.programId,
      studentInvitationToken: data.invitationToken,
      createAccountId: data.createAccountId,
    };
  });
};

export const getJoinClassDataListByAccountId = async (
  accountId: d.AccountId
): Promise<ReadonlyArray<d.ParticipantClass>> => {
  const snapshot = await firestore
    .collection("classJoinData")
    .where("accountId", "==", accountId)
    .get();
  const result: ReadonlyArray<d.ParticipantClass> = await Promise.all(
    snapshot.docs.map<Promise<d.ParticipantClass>>(
      async (doc): Promise<d.ParticipantClass> => {
        const data = doc.data();
        const classData = (
          await firestore.collection("class").doc(data.classId).get()
        ).data();
        if (classData === undefined) {
          throw new Error("unknown class " + data.classId);
        }
        return {
          id: data.classId,
          name: classData.name,
          createAccountId: classData.createAccountId,
          programId: classData.programId,
          role: data.role,
        };
      }
    )
  );
  return result;
};

export type ClassData = d.AdminClass & {
  readonly createAccountId: d.AccountId;
};

export const getClassByClassId = async (
  classId: d.ClassId
): Promise<undefined | ClassData> => {
  const data = (await firestore.collection("class").doc(classId).get()).data();
  if (data === undefined) {
    return undefined;
  }
  return {
    id: classId,
    name: data.name,
    studentInvitationToken: data.invitationToken,
    programId: data.programId,
    createAccountId: data.createAccountId,
  };
};

export const getJoinClassData = async (
  classId: d.ClassId,
  accountId: d.AccountId
): Promise<
  | undefined
  | {
      readonly joinTime: admin.firestore.Timestamp;
      readonly role: d.ClassParticipantRole;
      readonly accountId: d.AccountId;
      readonly classId: d.ClassId;
    }
> => {
  const doc = await firestore
    .collection("classJoinData")
    .doc(`${classId}_${accountId}`)
    .get();
  return doc.data();
};

export const getJoinClassDataFromClassId = async (
  classId: d.ClassId
): Promise<ReadonlyArray<d.Participant>> => {
  const docs = await firestore
    .collection("classJoinData")
    .where("classId", "==", classId)
    .get();
  const resultList: Array<d.Participant> = [];
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
      account: {
        id: accountData.id,
        name: account.name,
        iconHash: account.iconHash,
      },
      role: data.role,
    });
  }
  return resultList;
};

export const joinClassAsStudent = async (
  classId: d.ClassId,
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
      role: d.ClassParticipantRole.Student,
    });
};

export const setAnswer = async (option: {
  readonly text: string;
  readonly questionId: d.QuestionId;
  readonly classId: d.ClassId;
  readonly accountId: d.AccountId;
  readonly createTime: Date;
  readonly updateTime: Date;
}): Promise<void> => {
  await firestore
    .collection("answer")
    .doc(`${option.questionId}_${option.classId}_${option.accountId}`)
    .create({
      text: option.text,
      questionId: option.questionId,
      classId: option.classId,
      accountId: option.accountId,
      createTime: admin.firestore.Timestamp.fromDate(option.createTime),
      updateTime: admin.firestore.Timestamp.fromDate(option.updateTime),
      isConfirm: false,
    });
};

/**
 * クラスの生徒かどうか
 */
export const isStudent = async (
  accountId: d.AccountId,
  classId: d.ClassId
): Promise<boolean> => {
  const document = (
    await firestore
      .collection("classJoinData")
      .where("accountId", "==", accountId)
      .where("classId", "==", classId)
      .get()
  ).docs[0];
  return (
    document !== undefined &&
    document.data().role === d.ClassParticipantRole.Student
  );
};

export const getAnswerListByAccountIdAndClassId = async (
  accountId: d.AccountId,
  classId: d.ClassId
): Promise<
  ReadonlyArray<{
    readonly questionId: d.QuestionId;
    readonly text: string;
    readonly isConfirm: boolean;
  }>
> => {
  const queryDocumentSnapshot = (
    await firestore
      .collection("answer")
      .where("accountId", "==", accountId)
      .where("classId", "==", classId)
      .get()
  ).docs;
  return queryDocumentSnapshot.map<{
    readonly questionId: d.QuestionId;
    readonly text: string;
    readonly isConfirm: boolean;
  }>((document) => {
    const answer = document.data();
    return {
      questionId: answer.questionId,
      text: answer.text,
      isConfirm: answer.isConfirm,
    };
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
