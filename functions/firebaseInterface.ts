import * as d from "../data";
import * as functions from "firebase-functions";
import type * as stream from "stream";
import type * as typedFirestore from "typed-admin-firestore";
import { FieldValue, Timestamp, getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { imagePng } from "./mimeType";
import { initializeApp } from "firebase-admin/app";

const app = initializeApp();
const firestore = getFirestore(app) as unknown as typedFirestore.Firestore<{
  loginState: {
    key: string;
    value: {
      createTime: Timestamp;
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
      createTime: Timestamp;
      accountTokenHash: string;
    };
    subCollections: Record<never, never>;
  };
  program: {
    key: d.ProgramId;
    value: {
      name: string;
      createAccountId: d.AccountId;
      createTime: Timestamp;
    };
    subCollections: Record<never, never>;
  };
  question: {
    key: d.QuestionId;
    value: {
      name: string;
      parent: d.QuestionId | null;
      programId: d.ProgramId;
      createTime: Timestamp;
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
      createTime: Timestamp;
    };
    subCollections: Record<never, never>;
  };
  classJoinData: {
    key: `${d.AccountId}_${d.ClassId}`;
    value: {
      joinTime: Timestamp;
      role: d.ClassParticipantRole;
      accountId: d.AccountId;
      classId: d.ClassId;
    };
    subCollections: Record<never, never>;
  };
  answer: {
    key: `${d.QuestionId}_${d.ClassId}_${d.AccountId}`;
    value: AnswerDocument;
    subCollections: Record<never, never>;
  };
  feedback: {
    key: d.CommentId;
    value: FeedbackDocument;
    subCollections: Record<never, never>;
  };
  notification: {
    key: d.NotificationId;
    value: NotificationDocument;
    subCollections: Record<never, never>;
  };
  development: {
    key: "main";
    value: { isCreatedAccount: boolean };
    subCollections: Record<never, never>;
  };
}>;

type AnswerDocument = {
  readonly text: string;
  readonly questionId: d.QuestionId;
  readonly classId: d.ClassId;
  readonly accountId: d.AccountId;
  readonly createTime: Timestamp;
  readonly updateTime: Timestamp;
  readonly isConfirm: boolean;
};

type FeedbackDocument = {
  readonly message: string;
  readonly questionId: d.QuestionId;
  readonly classId: d.ClassId;
  readonly answerAccountId: d.AccountId;
  readonly feedbackAccountId: d.AccountId;
  readonly createTime: Timestamp;
};

type NotificationDocument = {
  readonly event: NotificationEventIdData;
  readonly accountId: d.AccountId;
  readonly done: boolean;
  readonly createTime: Timestamp;
};

type NotificationEventIdData =
  | {
      readonly tag: "NewComment";
      readonly commentId: d.CommentId;
    }
  | {
      readonly tag: "NewAnswer";
      readonly idData: d.AnswerIdData;
    };

const cloudStorageBucket = getStorage(app).bucket();

export const createLogInState = async (
  state: string,
  location: d.Location
): Promise<void> => {
  await firestore.collection("loginState").doc(state).create({
    createTime: Timestamp.now(),
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
    createTime: Timestamp.now(),
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

export const getAccountByAccountId = async (
  accountId: d.AccountId
): Promise<d.Account | undefined> => {
  const document = await firestore.collection("account").doc(accountId).get();
  const data = document.data();
  if (data === undefined) {
    return;
  }
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
    createTime: FieldValue.serverTimestamp(),
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
      createTime: FieldValue.serverTimestamp(),
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
    createTime: FieldValue.serverTimestamp(),
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
        const classData = await getClassByClassId(data.classId);
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
      readonly joinTime: Timestamp;
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
      joinTime: Timestamp.fromDate(date),
      role: d.ClassParticipantRole.Student,
    });
};

export const setAnswer = async (parameter: {
  readonly text: string;
  readonly questionId: d.QuestionId;
  readonly classId: d.ClassId;
  readonly accountId: d.AccountId;
  readonly isConfirm: boolean;
}): Promise<void> => {
  const doc = firestore
    .collection("answer")
    .doc(`${parameter.questionId}_${parameter.classId}_${parameter.accountId}`);
  const documentSnapshot = await doc.get();
  if (documentSnapshot.exists) {
    console.log("質問が更新された", parameter);
    doc.update({
      text: parameter.text,
      questionId: parameter.questionId,
      classId: parameter.classId,
      accountId: parameter.accountId,
      updateTime: FieldValue.serverTimestamp(),
      isConfirm: parameter.isConfirm,
    });
    return;
  }
  console.log("質問が作成された", parameter);
  doc.create({
    text: parameter.text,
    questionId: parameter.questionId,
    classId: parameter.classId,
    accountId: parameter.accountId,
    createTime: FieldValue.serverTimestamp(),
    updateTime: FieldValue.serverTimestamp(),
    isConfirm: parameter.isConfirm,
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

export const getAnswerMain = async (
  answerIdData: d.AnswerIdData
): Promise<d.AnswerMain> => {
  const answer = (
    await firestore
      .collection("answer")
      .doc(
        `${answerIdData.questionId}_${answerIdData.classId}_${answerIdData.answerStudentId}`
      )
      .get()
  ).data();
  if (answer === undefined) {
    throw new Error(
      "回答を取得できなかった answerIdData = " + JSON.stringify(answerIdData)
    );
  }
  const [answerStudent, qClass, question] = await Promise.all([
    getAccountByAccountId(answerIdData.answerStudentId),
    getClassByClassId(answerIdData.classId),
    getQuestion(answerIdData.questionId),
  ]);
  if (answerStudent === undefined) {
    throw new Error(
      "回答者を取得できなかった answerIdData = " + JSON.stringify(answerIdData)
    );
  }
  if (qClass === undefined) {
    throw new Error(
      "クラスを取得できなかった answerIdData = " + JSON.stringify(answerIdData)
    );
  }
  if (question === undefined) {
    throw new Error(
      "質問を取得できなかった answerIdData = " + JSON.stringify(answerIdData)
    );
  }
  if (!answer.isConfirm) {
    throw new Error(
      "確定していない回答は取得できない answerIdData = " +
        JSON.stringify(answerIdData)
    );
  }
  return {
    answerStudent,
    answerText: answer.text,
    class: qClass,
    question,
  };
};

type AnswerItem = {
  readonly text: string;
  readonly questionId: d.QuestionId;
  readonly classId: d.ClassId;
  readonly studentId: d.AccountId;
  readonly createTime: d.DateTime;
  readonly updateTime: d.DateTime;
  readonly isConfirm: boolean;
};

export const getAnswerListByStudentIdAndClassId = async (
  accountId: d.AccountId,
  classId: d.ClassId
): Promise<ReadonlyArray<AnswerItem>> => {
  return answerQueryDocumentSnapshotToAnswerItemList(
    (
      await firestore
        .collection("answer")
        .where("accountId", "==", accountId)
        .where("classId", "==", classId)
        .get()
    ).docs
  );
};

export const getAnswerListByClassIdAndQuestionId = async (
  classId: d.ClassId,
  questionId: d.QuestionId
): Promise<ReadonlyArray<AnswerItem>> => {
  return answerQueryDocumentSnapshotToAnswerItemList(
    (
      await firestore
        .collection("answer")
        .where("classId", "==", classId)
        .where("questionId", "==", questionId)
        .get()
    ).docs
  );
};

const answerQueryDocumentSnapshotToAnswerItemList = (
  queryDocumentSnapshot: ReadonlyArray<
    typedFirestore.QueryDocumentSnapshot<string, AnswerDocument>
  >
): ReadonlyArray<AnswerItem> => {
  return queryDocumentSnapshot.map<AnswerItem>((document): AnswerItem => {
    const answer = document.data();
    return {
      text: answer.text,
      classId: answer.classId,
      studentId: answer.accountId,
      createTime: firestoreTimestampToDateTime(answer.createTime),
      updateTime: firestoreTimestampToDateTime(answer.updateTime),
      questionId: answer.questionId,
      isConfirm: answer.isConfirm,
    };
  });
};

export const addComment = async (option: {
  commentId: d.CommentId;
  classId: d.ClassId;
  answerStudentId: d.AccountId;
  feedbackAccountId: d.AccountId;
  questionId: d.QuestionId;
  message: string;
}): Promise<void> => {
  await firestore.collection("feedback").doc(option.commentId).create({
    classId: option.classId,
    answerAccountId: option.answerStudentId,
    createTime: FieldValue.serverTimestamp(),
    feedbackAccountId: option.feedbackAccountId,
    questionId: option.questionId,
    message: option.message,
  });
};

/**
 * コメントの情報を取得する. 見つからなかったりデータが不正だった場合はエラー
 */
const getCommentMain = async (
  commentId: d.CommentId
): Promise<d.CommentMain> => {
  const data = (
    await firestore.collection("feedback").doc(commentId).get()
  ).data();
  if (data === undefined) {
    throw new Error("コメントを見つけられなかった commentId = " + commentId);
  }
  const [answerStudent, account, qClass, question] = await Promise.all([
    getAccountByAccountId(data.answerAccountId),
    getAccountByAccountId(data.feedbackAccountId),
    getClassByClassId(data.classId),
    getQuestion(data.questionId),
  ]);
  if (account === undefined) {
    throw new Error(
      "コメントしたアカウントを見つけられなかった commentId = " + commentId
    );
  }
  if (answerStudent === undefined) {
    throw new Error(
      "回答した生徒のアカウントを見つけられなかった commentId = " + commentId
    );
  }
  if (qClass === undefined) {
    throw new Error("クラスを見つけられなかった commentId = " + commentId);
  }
  if (question === undefined) {
    throw new Error("質問を見つけられなかった commentId = " + commentId);
  }
  return {
    account,
    answerStudent,
    class: {
      id: qClass.id,
      name: qClass.name,
      createAccountId: qClass.createAccountId,
      programId: qClass.programId,
    },
    createDateTime: firestoreTimestampToDateTime(data.createTime),
    id: commentId,
    message: data.message,
    question,
  };
};

export const getCommentInAnswer = async (option: {
  questionId: d.QuestionId;
  classId: d.ClassId;
  accountId: d.AccountId;
}): Promise<ReadonlyArray<d.Comment>> => {
  const result = await firestore
    .collection("feedback")
    .where("questionId", "==", option.questionId)
    .where("classId", "==", option.classId)
    .where("answerAccountId", "==", option.accountId)
    .get();
  return result.docs.map((doc): d.Comment => {
    const data = doc.data();
    return {
      id: doc.id,
      accountId: data.feedbackAccountId,
      message: data.message,
      createDateTime: firestoreTimestampToDateTime(data.createTime),
    };
  });
};

export const addNotification = async (option: {
  readonly event: NotificationEventIdData;
  readonly accountId: d.AccountId;
  readonly id: d.NotificationId;
}): Promise<void> => {
  await firestore.collection("notification").doc(option.id).create({
    accountId: option.accountId,
    event: option.event,
    done: false,
    createTime: FieldValue.serverTimestamp(),
  });
};

export const setNotificationDone = async (
  notificationId: d.NotificationId
): Promise<void> => {
  await firestore.collection("notification").doc(notificationId).update({
    done: true,
  });
};

export const getNotificationListByAccount = async (
  accountId: d.AccountId
): Promise<ReadonlyArray<d.Notification>> => {
  const snapshot = await firestore
    .collection("notification")
    .where("accountId", "==", accountId)
    .get();
  return Promise.all(
    snapshot.docs.map<Promise<d.Notification>>(
      async (doc): Promise<d.Notification> => {
        const data = doc.data();
        return d.Notification.helper({
          id: doc.id,
          done: data.done,
          createTime: firestoreTimestampToDateTime(data.createTime),
          event:
            data.event.tag === "NewComment"
              ? d.NotificationEvent.NewComment(
                  await getCommentMain(data.event.commentId)
                )
              : d.NotificationEvent.NewAnswer(
                  await getAnswerMain(data.event.idData)
                ),
        });
      }
    )
  );
};

/**
 * 通知の未読数を数える
 */
export const getNotDoneNotificationCount = async (
  accountId: d.AccountId
): Promise<number> => {
  const snapshot = await firestore
    .collection("notification")
    .where("accountId", "==", accountId)
    .where("done", "==", false)
    .get();
  return snapshot.size;
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

const millisecondInDay = 1000 * 60 * 60 * 24;

export const firestoreTimestampToDateTime = (
  firestoreTimestamp: Timestamp
): d.DateTime => {
  const millisecond = firestoreTimestamp.toMillis();
  return {
    day: Math.floor(millisecond / millisecondInDay),
    millisecond: millisecond % millisecondInDay,
  };
};

export const setDevelopmentFlag = async (
  isCreatedAccount: boolean
): Promise<void> => {
  await firestore.collection("development").doc("main").set({
    isCreatedAccount,
  });
};

export const getDevelopmentFlag = async (): Promise<boolean> => {
  const e = await firestore.collection("development").doc("main").get();
  return e.data()?.isCreatedAccount ?? false;
};
