import * as d from "../../data";
import { useState } from "react";

export type UseAccountMapResult = {
  /** リロードするまで, アカウントを保存する */
  set: (account: d.QAccount) => void;
  /** 1度に複数のアカウントをリロードするまで保存する */
  setList: (accountList: ReadonlyArray<d.QAccount>) => void;
  /** アカウントをキャッシュから取得する */
  getById: (id: d.AccountId) => d.QAccount | undefined;
  /** ログアウトしたとき, キャッシュを削除する */
  deleteAll: () => void;
};

export const useAccountMap = (): UseAccountMapResult => {
  const [accountMap, setAccountMap] = useState<
    ReadonlyMap<d.AccountId, d.QAccount>
  >(new Map());
  return {
    set: (account) => {
      setAccountMap((before) => {
        return new Map(before).set(account.id, account);
      });
    },
    getById: (id) => {
      return accountMap.get(id);
    },
    setList: (accountList) => {
      setAccountMap((before) => {
        const map = new Map(before);
        for (const account of accountList) {
          map.set(account.id, account);
        }
        return map;
      });
    },
    deleteAll: () => {
      setAccountMap(new Map());
    },
  };
};
