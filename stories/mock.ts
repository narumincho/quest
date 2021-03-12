import * as d from "../data";
import { AppState } from "../client/state";

export const mockAppState: AppState = {
  loginState: { tag: "NoLogin" },
  createdProgramListState: { tag: "None" },
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
    switch (id) {
      case mockProgramIdA:
        return {
          name: "サンプルプログラム名A",
          createAccountId: mockAccountId,
          id: mockProgramIdA,
        };
      case mockProgramIdB:
        return {
          name: "サンプルプログラム名B",
          createAccountId: mockAccountId,
          id: mockProgramIdA,
        };
      case mockProgramIdLong:
        return {
          name: lorem,
          createAccountId: mockAccountId,
          id: mockProgramIdA,
        };
    }
    return undefined;
  },
  account: (id) => {
    return {
      id,
      iconHash: "fakeIconHash" as d.ImageHash,
      name: "サンプルアカウント名",
    };
  },
  requestGetCreatedProgram: () => {
    console.log("作成したプログラム一覧を取得しようとした");
  },
};

export const mockAccount: d.QAccount = {
  id: "fakeAccountId" as d.AccountId,
  iconHash: "fakeIconHash" as d.ImageHash,
  name: "サンプルアカウント名",
};
export const mockAccountId = "mockAccountId" as d.AccountId;
export const mockAccountToken = "mockAccountToken" as d.AccountToken;

export const mockProgramIdA = "mockProgramA" as d.QProgramId;
export const mockProgramIdB = "mockProgramB" as d.QProgramId;
export const mockProgramIdLong = "mockProgramLong" as d.QProgramId;

const lorem =
  "Lorem ipsum dolor sit amet consectetur adipisicing elit. Esse error earum, suscipit ullam";
