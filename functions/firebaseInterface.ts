import * as admin from "firebase-admin";
import * as d from "../data";
import * as fileSystem from "fs-extra";
import * as functions from "firebase-functions";
import type * as stream from "stream";
import type * as typedFirestore from "typed-admin-firestore";
import { imagePng } from "./mimeType";
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
export const savePngFile = async (
  hash: string,
  binary: Uint8Array
): Promise<void> => {
  const fileName = `${hash}.png`;
  if (nowMode === "production") {
    await cloudStorageBucket
      .file(fileName)
      .save(Buffer.from(binary), { contentType: imagePng });
    return;
  }
  await fileSystem.outputFile(`${fakeCloudStoragePath}/${fileName}`, binary);
};

/**
 * Cloud Storage for Firebase からPNGファイルを読み込む.
 * ローカルではファイルシステムからファイルを読み取る
 */
export const readPngFile = (hash: string): stream.Readable => {
  const fileName = `${hash}.png`;
  if (nowMode === "production") {
    return cloudStorageBucket.file(fileName).createReadStream();
  }
  return fileSystem.createReadStream(`${fakeCloudStoragePath}/${fileName}`);
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
