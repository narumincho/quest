import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import type * as typedFirestore from "typed-admin-firestore";

const app = admin.initializeApp();
const firestore = (app.firestore() as unknown) as typedFirestore.Firestore<{
  loginState: {
    key: string;
    value: {
      createTime: admin.firestore.Timestamp;
    };
    subCollections: Record<never, never>;
  };
  account: {
    key: string;
    value: {
      name: string;
      lineId: string;
      imageUrl: string;
      createTime: admin.firestore.Timestamp;
      accountTokenHash: string;
    };
    subCollections: Record<never, never>;
  };
}>;

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
  id: string;
  name: string;
  lineId: string;
  imageUrl: string;
  accountTokenHash: string;
}): Promise<void> => {
  await firestore.collection("account").doc(accountCrateData.id).create({
    name: accountCrateData.name,
    lineId: accountCrateData.lineId,
    imageUrl: accountCrateData.imageUrl,
    createTime: admin.firestore.Timestamp.now(),
    accountTokenHash: accountCrateData.accountTokenHash,
  });
};

export const getAccountByAccountTokenHash = async (
  accountTokenHash: string
): Promise<{ name: string } | undefined> => {
  const documents = await firestore
    .collection("account")
    .where("accountTokenHash", "==", accountTokenHash)
    .get();
  const document = documents.docs[0];
  if (document === undefined) {
    return undefined;
  }
  return {
    name: document.data().name,
  };
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
