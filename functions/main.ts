import * as apiCodec from "../common/apiCodec";
import * as d from "../data";
import * as firebaseInterface from "./firebaseInterface";
import * as functions from "firebase-functions";
import * as lib from "./lib";
import { imagePng } from "./mimeType";
import { nowMode } from "../common/nowMode";

if (nowMode === "development") {
  firebaseInterface.createAccount({
    id: d.AccountId.fromString("71d21c2b889f7479fc67e1abacb5d16b"),
    name: "テスト0",
    accountTokenHash:
      "a565b235efeaff4b2d81543f6b532f78de4fc04d1fe5b1415c968837a81f4955",
    iconHash: d.ImageHashValue.fromString(
      "ff65b235efeaff4b2d81543f6b532f78de4fc04d1fe5b1415c968837a81f4955"
    ),
    lineId: "noLineId",
  });
  firebaseInterface.createAccount({
    id: d.AccountId.fromString("443d74e7acc6c2098441e2e4d80cf604"),
    name: "テスト1",
    accountTokenHash: d.AccountToken.fromString(
      "67bb8cdaca8b776f9a30154a3a3add4884d01992b2b4ca79f637d20af0dca4c2"
    ),
    iconHash: d.ImageHashValue.fromString(
      "ff65b235efeaff4b2d81543f6b532f78de4fc04d1fe5b1415c968837a81f4955"
    ),
    lineId: "noLineId",
  });
  firebaseInterface.createAccount({
    id: d.AccountId.fromString("5abdaa7f315f7906cf5eb41ac95d3a77"),
    name: "テスト2",
    accountTokenHash: d.AccountToken.fromString(
      "1759bc4af3049e16edd06fc8f71b301d4fe04116b52aa4451d96e49bad139609"
    ),
    iconHash: d.ImageHashValue.fromString(
      "ff65b235efeaff4b2d81543f6b532f78de4fc04d1fe5b1415c968837a81f4955"
    ),
    lineId: "noLineId",
  });
}
/*
 * =====================================================================
 *               api データを取得したり変更したりする
 *           http://localhost:5000/api/requestLineLoginUrl
 *        https://north-quest.web.app/api/requestLineLoginUrl
 *                            など
 *            ↓ Firebase Hosting firebase.json rewrite
 *                Cloud Functions for Firebase / api
 * =====================================================================
 */
export const api = functions.https.onRequest(async (request, response) => {
  const apiName = request.path.split("/")[2];
  console.log("call api function!", apiName);
  const result = await callApiFunction(apiName, request.body as Buffer);
  if (result === undefined) {
    response.status(400);
    response.send("想定外のパスを受けとった request.path=" + request.path);
    return;
  }
  response.send(Buffer.from(result));
});

const callApiFunction = (
  apiName: string | undefined,
  binary: Uint8Array
): Promise<ReadonlyArray<number> | undefined> => {
  if (typeof apiName !== "string") {
    return Promise.resolve(undefined);
  }
  // apiCodec[apiName] でも良い気がするが prototype 汚染が怖いのでループして一致するものを探す
  for (const [selectedApiName, selectedApiCodec] of Object.entries(apiCodec)) {
    if (apiName === selectedApiName) {
      return callApiFromCodecAndFunction(
        selectedApiName,
        binary,
        selectedApiCodec as apiCodec.ApiCodec<unknown, unknown>,
        lib.apiFunc[selectedApiName as keyof typeof apiCodec] as (
          request: unknown
        ) => Promise<unknown>
      );
    }
  }
  return Promise.resolve(undefined);
};

const callApiFromCodecAndFunction = async <Request, Response>(
  apiName: string,
  binary: Uint8Array,
  codec: apiCodec.ApiCodec<Request, Response>,
  func: (request: Request) => Promise<Response>
): Promise<ReadonlyArray<number>> => {
  const request: Request = codec.request.decode(0, binary).result;
  const response: Response = await func(codec.request.decode(0, binary).result);
  console.log(
    "call api",
    apiName,
    JSON.stringify(request),
    JSON.stringify(response)
  );
  return codec.response.encode(response);
};

/*
 * =====================================================================
 *              file Cloud Storage for Firebase のファイルを取得
 *           (ローカルの開発時には, ファイルシステムに保存されているものを取得)
 *
 * http://localhost:5000/file/ff4ceb521f1a66ecb44a59e2377c22ee9881b2ed0759137bfd1368a7b5b7cd5e
 * https://north-quest.web.app/file/ff4ceb521f1a66ecb44a59e2377c22ee9881b2ed0759137bfd1368a7b5b7cd5e
 *                            など
 *            ↓ Firebase Hosting firebase.json rewrite
 *           Cloud Functions for Firebase / file
 * =====================================================================
 */
export const file = functions.https.onRequest((request, response) => {
  const fileHash = request.path.split("/")[2];
  if (typeof fileHash !== "string") {
    response.status(400).send(
      `ファイルの取得には, ファイルのSHA256のハッシュ値をパスにしていする必要があります.
例: https://north-quest.web.app/file/ff4ceb521f1a66ecb44a59e2377c22ee9881b2ed0759137bfd1368a7b5b7cd5e`
    );
    return;
  }
  const mimeTypeAndReadableStream = firebaseInterface.readPngFile(fileHash);
  response.contentType(imagePng);
  mimeTypeAndReadableStream.pipe(response);
});
