import * as apiCodec from "../common/apiCodec";
import * as d from "../data";
import * as firebaseInterface from "./firebaseInterface";
import * as functions from "firebase-functions";
import * as lib from "./lib";
import * as url from "../common/url";
import { imagePng } from "./mimeType";
import { nowMode } from "../common/nowMode";

if (nowMode === "development") {
  firebaseInterface.createAccount({
    id: "71d21c2b889f7479fc67e1abacb5d16b" as d.AccountId,
    name: "テスト用アカウント",
    accountTokenHash:
      "a565b235efeaff4b2d81543f6b532f78de4fc04d1fe5b1415c968837a81f4955",
    iconHash: "ff65b235efeaff4b2d81543f6b532f78de4fc04d1fe5b1415c968837a81f4955" as d.ImageHash,
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
 *               lineLoginCallback ソーシャルログインのコールバック先
 *         http://localhost:5000/lineLoginCallback/?state=&code=
 *      https://north-quest.web.app/lineLoginCallback/?state=&code=
 *                            など
 *            ↓ Firebase Hosting firebase.json rewrite
 *           Cloud Functions for Firebase / lineLoginCallback
 * =====================================================================
 */
export const lineLoginCallback = functions.https.onRequest(
  (request, response) => {
    const code: unknown = request.query.code;
    const state: unknown = request.query.state;
    if (!(typeof code === "string" && typeof state === "string")) {
      console.log("codeかstateが送られて来なかった。ユーザーがキャンセルした?");
      response.redirect(
        301,
        url
          .urlDataToUrl({
            location: d.QLocation.Top,
            accountToken: undefined,
          })
          .toString()
      );
      return;
    }
    lib.lineLoginCallback(code, state).then((result) => {
      response.redirect(301, url.urlDataToUrl(result).toString());
    });
  }
);

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
