import * as apiCodec from "../common/apiCodec";
import * as crypto from "crypto";
import * as d from "../data";
import * as firebaseInterface from "./firebaseInterface";
import * as jimp from "jimp";
import * as jsonWebToken from "jsonwebtoken";
import { UrlData, lineLoginCallbackUrl } from "../common/url";
import axios from "axios";

type ApiCodecType = typeof apiCodec;

export const apiFunc: {
  [apiName in keyof ApiCodecType]: (
    request: apiCodec.GetCodecType<ApiCodecType[apiName]["request"]>
  ) => Promise<apiCodec.GetCodecType<ApiCodecType[apiName]["response"]>>;
} = {
  requestLineLoginUrl: async () => {
    const state = createRandomId();
    await firebaseInterface.createLogInState(state);
    return generateLineLogInUrl(state).toString();
  },
  getAccountByAccountToken: async (accountToken) => {
    const result = await firebaseInterface.getAccountByAccountTokenHash(
      hashAccountToken(accountToken)
    );
    return result === undefined ? "不明なユーザー" : result.name;
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

export const lineLoginCallback = async (
  code: string,
  state: string
): Promise<UrlData> => {
  const isValid = await firebaseInterface.existsLoginState(state);
  if (!isValid) {
    return {
      location: { tag: "top" },
      accountToken: undefined,
    };
  }
  await firebaseInterface.deleteLoginState(state);
  const profile = await getLineProfile(code);
  const imageHash = await getAndSaveUserImage(profile.imageUrl);
  const accountTokenAndHash = issueAccessToken();
  await firebaseInterface.createAccount({
    id: createRandomId(),
    lineId: profile.id,
    imageHash,
    name: profile.name,
    accountTokenHash: accountTokenAndHash.accountTokenHash,
  });
  return {
    location: { tag: "top" },
    accountToken: accountTokenAndHash.accountToken,
  };
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
  accountTokenHash: string;
} => {
  const accountToken = crypto.randomBytes(32).toString("hex") as d.AccountToken;
  return {
    accountToken,
    accountTokenHash: hashAccountToken(accountToken),
  };
};

const hashAccountToken = (accountToken: d.AccountToken): string =>
  crypto
    .createHash("sha256")
    .update(new Uint8Array(d.AccountToken.codec.encode(accountToken)))
    .digest("hex");

const getAndSaveUserImage = async (imageUrl: URL): Promise<d.ImageHash> => {
  const response = await axios.get<Buffer>(imageUrl.toString(), {
    responseType: "arraybuffer",
  });
  return savePngFile(
    await (await jimp.create(response.data))
      .resize(64, 64)
      .getBufferAsync(imagePngMimeType)
  );
};

const imagePngMimeType = "image/png";

/**
 * Cloud Storage for Firebase にPNGファイルを保存する
 */
const savePngFile = async (binary: Uint8Array): Promise<d.ImageHash> => {
  const fileName = createImageHashFromUint8ArrayAndMimeType(
    binary,
    imagePngMimeType
  );
  await firebaseInterface.saveFile(fileName, imagePngMimeType, binary);
  return fileName;
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
