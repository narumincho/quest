import * as d from "../data";
import { AppState } from "../client/state";

export const mockAppState: AppState = {
  loginState: { tag: "NoLogin" },
  jump: (newLocation) => {
    console.log(`${JSON.stringify(newLocation)}に移動しようとした`);
  },
  changeLocation: (newLocation) => {
    console.log(
      `${JSON.stringify(newLocation)}に履歴を置き換える形で移動しようとした`
    );
  },
  location: d.QLocation.Top,
  requestLogin: () => {
    console.log("ログインURLを発行して, 推移しようとした");
  },
  logout: () => {
    console.log("ログアウトしようとした");
  },
  addNotification: (message, variant) => {
    console.log(`「${message}」(${variant})という通知を追加しようとした`);
  },
  back: () => {
    console.log("戻ろうとした");
  },
  createProgram: (projectName) => {
    console.log(`${projectName} というプログラムを作ろうとした`);
  },
  program: (id) => {
    return {
      id,
      createAccountId: "fakeUserId" as d.AccountId,
      name: "サンプルプログラム名",
    };
  },
  account: (id) => {
    return {
      id,
      iconHash: "fakeIconHash" as d.ImageHash,
      name: "サンプルアカウント名",
    };
  },
};

export const mockAccount: d.QAccount = {
  id: "fakeAccountId" as d.AccountId,
  iconHash: "fakeIconHash" as d.ImageHash,
  name: "サンプルアカウント名",
};
export const mockAccountId = "mockAccountId" as d.AccountId;
export const mockAccountToken = "mockAccountToken" as d.AccountToken;

export const mockProgramId = "mockProgramId" as d.QProgramId;
export const mockProgram: d.QProgram = {
  name: "サンプルプログラム名",
  createAccountId: mockAccountId,
  id: mockProgramId,
};
