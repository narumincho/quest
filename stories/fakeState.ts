import * as d from "../data";
import { AppState } from "../client/state";

export const fakeAppState: AppState = {
  loginState: { tag: "NoLogin" },
  jump: (newLocation) => {
    console.log(`${JSON.stringify(newLocation)}に移動しようとした`);
  },
  accountToken: () => undefined,
  location: d.QLocation.Top,
  logout: () => {
    console.log("ログアウトしようとした");
  },
  addNotification: (message, variant) => {
    console.log(`「${message}」(${variant})という通知を追加しようとした`);
  },
  back: () => {
    console.log("戻ろうとした");
  },
};
