import * as d from "../data";
import {
  AppState,
  QuestionTree,
  getParentQuestionList,
  getQuestionTree,
  questionChildren,
} from "../client/state";

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
          questionList: {
            tag: "Loaded",
            questionIdList: [...questionMap.keys()],
          },
        };
      case mockProgramIdB:
        return {
          name: "サンプルプログラム名B",
          createAccountId: mockAccountId,
          id: mockProgramIdA,
          questionList: { tag: "Requesting" },
        };
      case mockProgramIdLong:
        return {
          name: lorem,
          createAccountId: mockAccountId,
          id: mockProgramIdA,
          questionList: { tag: "None" },
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
  isCreatingQuestion: false,
  createQuestion: (
    programId: d.QProgramId,
    parent: d.QQuestionId | undefined,
    text: string
  ) => {
    console.log("質問を作成しようとした", programId, parent, text);
  },
  requestGetQuestionListInProgram: (programId) => {
    console.log("プログラムに属している質問を習得しようとした", programId);
  },
  question: (id): d.QQuestion | undefined => {
    return questionMap.get(id);
  },
  questionChildren: (id: d.QQuestionId): ReadonlyArray<d.QQuestionId> =>
    questionChildren(id, questionMap),
  questionParentList: (id: d.QQuestionId): ReadonlyArray<d.QQuestion> => {
    return getParentQuestionList(id, questionMap);
  },
  questionTree: (programId: d.QProgramId): ReadonlyArray<QuestionTree> => {
    return getQuestionTree(programId, questionList);
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

const korekara = "korekara" as d.QQuestionId;
const zinsei = "zinsei" as d.QQuestionId;
export const muzintou = "muzintou" as d.QQuestionId;
const dream = "draem" as d.QQuestionId;
const happy = "happy" as d.QQuestionId;
const saketai = "saketai" as d.QQuestionId;
const yuhan = "yuhan" as d.QQuestionId;

const questionList: ReadonlyArray<d.QQuestion> = [
  {
    id: korekara,
    name: "これから何をしますか",
    parent: d.Maybe.Nothing(),
    programId: mockProgramIdA,
  },
  {
    id: zinsei,
    name: "人生にとって何が大切ですか?",
    parent: d.Maybe.Just(korekara),
    programId: mockProgramIdA,
  },
  {
    id: muzintou,
    name: "無人島に 1つだけ ものを持っていくとしたら何を持っていきますか?",
    parent: d.Maybe.Just(zinsei),
    programId: mockProgramIdA,
  },
  {
    id: "takara" as d.QQuestionId,
    name: "今も持っている宝はありますか?",
    parent: d.Maybe.Just(muzintou),
    programId: mockProgramIdA,
  },
  {
    id: "nanisugosu" as d.QQuestionId,
    name: "時間が余っているときに, 何をして過ごしていますか?",
    parent: d.Maybe.Just(muzintou),
    programId: mockProgramIdA,
  },
  {
    id: dream,
    name: "将来の夢は何ですか?",
    parent: d.Maybe.Just(zinsei),
    programId: mockProgramIdA,
  },
  {
    id: "syougakuseiyume" as d.QQuestionId,
    name: "小学生のときの将来の夢は何ですか",
    parent: d.Maybe.Just(dream),
    programId: mockProgramIdA,
  },
  {
    id: happy,
    name: "今までで, 1番楽しかったことは何ですか?",
    parent: d.Maybe.Just(zinsei),
    programId: mockProgramIdA,
  },
  {
    id: "shougakuseitanosikatta" as d.QQuestionId,
    name: "小学生のとき 1番 楽しかったことは何ですか?",
    parent: d.Maybe.Just(happy),
    programId: mockProgramIdA,
  },
  {
    id: "tyougakuseitanosikatta" as d.QQuestionId,
    name: "中学生のとき 1番 楽しかったことは何ですか?",
    parent: d.Maybe.Just(happy),
    programId: mockProgramIdA,
  },
  {
    id: "kouokouseitanosikatta" as d.QQuestionId,
    name: "高校生のとき 1番 楽しかったことは何ですか?",
    parent: d.Maybe.Just(happy),
    programId: mockProgramIdA,
  },
  {
    id: "daigakuseitanosikatta" as d.QQuestionId,
    name: "大学生のとき 1番 楽しかったことは何ですか?",
    parent: d.Maybe.Just(happy),
    programId: mockProgramIdA,
  },
  {
    id: saketai,
    name: "したくないことは何ですか",
    parent: d.Maybe.Just(zinsei),
    programId: mockProgramIdA,
  },
  {
    id: "iyadatta" as d.QQuestionId,
    name: "今まで嫌だったことは何ですか?",
    parent: d.Maybe.Just(saketai),
    programId: mockProgramIdA,
  },
  {
    id: yuhan,
    name: "関係ないけど, 今日の夕飯は何にしますか?",
    parent: d.Maybe.Nothing(),
    programId: mockProgramIdA,
  },
];

const questionMap: ReadonlyMap<d.QQuestionId, d.QQuestion> = new Map(
  questionList.map((question) => [question.id, question] as const)
);
