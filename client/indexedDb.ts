import * as d from "../data";

/**
 * 1度 indexedDBにアクセスしたら, データベースへの参照を維持しておくための変数
 */
let databaseCache: IDBDatabase | null = null;

const accountTokenObjectStoreName = "accountToken";
const accountTokenKeyName = "lastLogInUser";

const getDatabase = (): Promise<IDBDatabase | null> =>
  new Promise<IDBDatabase | null>((resolve, reject) => {
    if (databaseCache !== null) {
      resolve(databaseCache);
      return;
    }
    const dbRequest: IDBOpenDBRequest = indexedDB.open("main", 1);

    dbRequest.onupgradeneeded = (e): void => {
      console.log(
        `indexedDB の version が上がった ${e.oldVersion}→${e.newVersion}`
      );
      databaseCache = dbRequest.result;
      databaseCache.createObjectStore(accountTokenObjectStoreName, {});
    };

    dbRequest.onsuccess = (): void => {
      resolve(dbRequest.result);
    };

    dbRequest.onerror = (): void => {
      reject(new Error("indexedDB に接続できなかった"));
    };
  });

/**
 * データをindexedDBから読む
 */
export const getAccountToken = (): Promise<d.AccountToken | undefined> =>
  new Promise((resolve, reject) => {
    getDatabase().then((database) => {
      if (database === null) {
        resolve(undefined);
        return;
      }
      const transaction = database.transaction(
        [accountTokenObjectStoreName],
        "readonly"
      );

      transaction.oncomplete = (): void => {
        resolve(getRequest.result);
      };

      transaction.onerror = (): void => {
        reject(new Error("アカウントトークンの読み取りに失敗"));
      };

      const getRequest: IDBRequest<d.AccountToken | undefined> = transaction
        .objectStore(accountTokenObjectStoreName)
        .get(accountTokenKeyName);
    });
  });

/**
 * データをindexedDBに書く
 */
export const setAccountToken = (accountToken: d.AccountToken): Promise<void> =>
  new Promise((resolve, reject) => {
    getDatabase().then((database) => {
      if (database === null) {
        resolve();
        return;
      }

      const transaction = database.transaction(
        [accountTokenObjectStoreName],
        "readwrite"
      );

      transaction.oncomplete = (): void => {
        resolve();
      };

      transaction.onerror = (): void => {
        reject(new Error("アカウントトークンの書き込みに失敗"));
      };

      transaction
        .objectStore(accountTokenObjectStoreName)
        .put(accountToken, accountTokenKeyName);
    });
  });

export const deleteAccountToken = (): Promise<void> =>
  new Promise((resolve, reject) => {
    getDatabase().then((database) => {
      if (database === null) {
        resolve();
        return;
      }

      const transaction = database.transaction(
        [accountTokenObjectStoreName],
        "readwrite"
      );

      transaction.oncomplete = (): void => {
        resolve();
      };

      transaction.onerror = (): void => {
        reject(new Error("アクセストークンの削除に失敗"));
      };

      transaction
        .objectStore(accountTokenObjectStoreName)
        .delete(accountTokenKeyName);
    });
  });
