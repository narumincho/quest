import * as d from "../data";
import { origin } from "./origin";

/** URLに含めるデータ */
export type UrlData = {
  location: Location;
  accountToken: d.AccountToken | undefined;
};

/** quest 内の場所 */
export type Location = { tag: "top" };

/** アカウントトークンを含んだ パスとハッシュを生成する */
export const urlDataToUrl = (urlData: UrlData): URL => {
  const url = new URL(origin);
  url.pathname = locationToPath(urlData.location);
  url.hash = `account-token=${urlData.accountToken}`;
  return url;
};

/** quest 内の場所からURLのパスを得る */
export const locationToPath = (location: Location): string => {
  switch (location.tag) {
    case "top":
      return "/";
  }
};

/**
 * URLのパスとハッシュから quest 内の場所と, アカウントトークンを得る
 *
 * @param path URL の `/` からはじまる. パス (`/`を含む)
 * @param hash URL の `#` からはじまる. ハッシュ (`#`を含む)
 */
export const pathAndHashToUrlData = (path: string, hash: string): UrlData => {
  const location: Location = pathToLocation(path);
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
export const pathToLocation = (path: string): Location => {
  return { tag: "top" };
};

/** LINEログインで指定する. コールバックURL */
export const lineLoginCallbackUrl = `${origin}/lineLoginCallback`;
