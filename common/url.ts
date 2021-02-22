import { AccountToken } from "./accountToken";

/** URLに含めるデータ */
export type UrlData = {
  location: Location;
  accountToken: AccountToken | undefined;
};

/** quest 内の場所 */
export type Location = { tag: "top" };

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
 * @param path URL の `/` からはじまる. パス
 * @param hash URL の `#` からはじまる. ハッシュ
 */
export const urlToUrlData = (path: string, hash: string): UrlData => {
  const location: Location = pathToLocation(path);
  const accountTokenResult = hash.match(
    /account-token=(?<token>[0-9a-f]{64})/u
  );
  if (
    accountTokenResult !== null &&
    accountTokenResult.groups !== undefined &&
    typeof accountTokenResult.groups["account-token"] === "string"
  ) {
    const accountTokenAsString = accountTokenResult.groups["account-token"];
    if (typeof accountTokenAsString === "string") {
      return {
        accountToken: accountTokenAsString as AccountToken,
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
