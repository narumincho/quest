import * as d from "../data";
import { nowMode } from "./nowMode";

/** オリジン */
const origin =
  nowMode === "development"
    ? "http://localhost:5000"
    : "https://north-quest.web.app";

/** URLに含めるデータ */
export type UrlData = {
  location: d.QLocation;
  accountToken: d.AccountToken | undefined;
};

/** アカウントトークンを含んだ パスとハッシュを生成する */
export const urlDataToUrl = (urlData: UrlData): URL => {
  const url = new URL(origin);
  url.pathname = locationToPath(urlData.location);
  if (typeof urlData.accountToken === "string") {
    url.hash = `account-token=${urlData.accountToken}`;
  }
  return url;
};

/** quest 内の場所からURLのパスを得る */
export const locationToPath = (location: d.QLocation): string => {
  switch (location) {
    case "Top":
      return "/";
    case "Setting":
      return settingPath;
    case "NewProject":
      return newProjectPath;
  }
};

/**
 * URLのパスとハッシュから quest 内の場所と, アカウントトークンを得る
 *
 * @param path URL の `/` からはじまる. パス (`/`を含む)
 * @param hash URL の `#` からはじまる. ハッシュ (`#`を含む)
 */
export const pathAndHashToUrlData = (path: string, hash: string): UrlData => {
  const location: d.QLocation = pathToLocation(path);
  const accountTokenResult = hash.match(
    /account-token=(?<token>[0-9a-f]{64})/u
  );
  if (
    accountTokenResult !== null &&
    accountTokenResult.groups !== undefined &&
    typeof accountTokenResult.groups.token === "string"
  ) {
    const accountTokenAsString = accountTokenResult.groups.token;
    if (typeof accountTokenAsString === "string") {
      return {
        accountToken: accountTokenAsString as d.AccountToken,
        location,
      };
    }
  }
  return {
    location,
    accountToken: undefined,
  };
};

/** パスから quest 内の場所を得る */
export const pathToLocation = (path: string): d.QLocation => {
  switch (path) {
    case settingPath:
      return d.QLocation.Setting;
    case newProjectPath:
      return d.QLocation.NewProject;
  }
  return d.QLocation.Top;
};

/** LINEログインで指定する. コールバックURL */
export const lineLoginCallbackUrl = `${origin}/lineLoginCallback`;

/** アカウントの画像などのURLを生成する */
export const imageUrl = (imageHash: d.ImageHash): URL =>
  new URL(`${origin}/file/${imageHash}`);

const settingPath = "/setting";
const newProjectPath = "/new-project";
