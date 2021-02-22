/**
 * アカウントトークン
 *
 * これを所持しているものはそのアカウントの所有者となる. アカウントトークンが知られてしまったら, 勝手に操作されてしまう危険があるが, 再度ログインしなおせば, 古いアカウントトークンは無効になる.
 */
export type AccountToken = string & { accountToken: never };
