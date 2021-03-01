import * as admin from "firebase-admin";
import * as d from "../data";
import * as fileSystem from "fs-extra";
import * as functions from "firebase-functions";
import type * as stream from "stream";
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
      iconHash: d.ImageHash;
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
): Promise<{ name: string; iconHash: d.ImageHash } | undefined> => {
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
    name: data.name,
    iconHash: data.iconHash,
  };
};

const fakeCloudStoragePath = "./fakeCloudStorage";

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
    `${fakeCloudStoragePath}/${fileName}${mimeTypeToExtension(mimeType)}`,
    binary
  );
};

/**
 * Cloud Storage for Firebase からファイルを読み込む
 */
export const readFile = async (fileName: string): Promise<stream.Readable> => {
  if (nowMode === "production") {
    return cloudStorageBucket.file(fileName).createReadStream();
  }
  const fileNameListInFakeFolder = await fileSystem.readdir(
    `${fakeCloudStoragePath}`
  );
  for (const fileNameInFakeFolder of fileNameListInFakeFolder) {
    if (fileNameInFakeFolder.startsWith(fileName)) {
      return fileSystem.createReadStream(
        `${fakeCloudStoragePath}/${fileNameInFakeFolder}`
      );
    }
  }
  throw new Error(
    `開発モードでファイルを見つけることができなかった ${fileName}`
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
