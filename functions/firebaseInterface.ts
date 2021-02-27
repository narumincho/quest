import * as admin from "firebase-admin";
import * as fileSystem from "fs-extra";
import * as functions from "firebase-functions";
import type * as typedFirestore from "typed-admin-firestore";
import { nowMode } from "../common/nowMode";

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
      imageHash: string;
      createTime: admin.firestore.Timestamp;
      accountTokenHash: string;
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
  id: string;
  name: string;
  lineId: string;
  imageHash: string;
  accountTokenHash: string;
}): Promise<void> => {
  await firestore.collection("account").doc(accountCrateData.id).create({
    name: accountCrateData.name,
    lineId: accountCrateData.lineId,
    imageHash: accountCrateData.imageHash,
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
 * Cloud Storage for Firebase にファイルを保存する
 */
export const saveFile = async (
  fileName: string,
  mimeType: string,
  binary: Uint8Array
): Promise<void> => {
  if (nowMode === "production") {
    await cloudStorageBucket
      .file(fileName)
      .save(Buffer.from(binary), { contentType: mimeType });
    return;
  }
  await fileSystem.outputFile(
    `./fakeCloudStorage/${fileName}${mimeTypeToExtension(mimeType)}`,
    binary
  );
};

const mimeTypeToExtension = (mimeType: string): string => {
  switch (mimeType) {
    case "image/png":
      return ".png";
  }
  return "";
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
