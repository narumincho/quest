import * as d from "../data";
import {
  AppState,
  LoggedInState,
  ProgramWithClassList,
  QuestionTreeListWithLoadingState,
} from "../client/state";
import {
  ClassAndRole,
  ClassWithParticipantList,
} from "../client/state/loggedInState";
import {
  getParentQuestionList,
  getQuestionTree,
  questionChildren,
} from "../client/state/question";
import { action } from "@storybook/addon-actions";

export const mockAppState: AppState = {
  logInState: { tag: "NoLogin" },
  jump: action("移動しようとした"),
  changeLocation: action("履歴を置き換える形で移動しようとした"),
  location: d.QLocation.Top,
  requestLogin: action("ログインURLを発行して, 推移しようとした"),
  requestLogInAsTestAccount: action(
    "テストアカウントとしてログインしようとした"
  ),
  logout: action("ログアウトしようとした"),
  addNotification: action("通知を追加しようとした"),
  back: action("戻ろうとした"),
  createProgram: action("プログラムを作ろうとした"),
  program: (id) => {
    switch (id) {
      case mockProgramIdA:
        return {
          name: "サンプルプログラム名A",
          createAccountId: mockAccountId,
          id: mockProgramIdA,
          questionIdListState: {
            tag: "Loaded",
            questionIdList: [...questionMap.keys()],
          },
          classList: [mockClassWithParticipantListLoadingParticipant],
        };
      case mockProgramIdB:
        return {
          name: "サンプルプログラム名B",
          createAccountId: mockAccountId,
          id: mockProgramIdA,
          questionIdListState: { tag: "Requesting" },
          classList: [],
        };
      case mockProgramIdLong:
        return {
          name: lorem,
          createAccountId: mockAccountId,
          id: mockProgramIdA,
          questionIdListState: { tag: "None" },
          classList: [],
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
  isCreatingQuestion: false,
  createQuestion: action("質問を作成しようとした"),
  requestGetQuestionListInProgram: action(
    "プログラムに属している質問を習得しようとした"
  ),

  question: (id): d.QQuestion | undefined => {
    return questionMap.get(id);
  },
  questionChildren: (id: d.QQuestionId): ReadonlyArray<d.QQuestionId> =>
    questionChildren(id, questionMap),
  questionParentList: (
    id: d.Maybe<d.QQuestionId>
  ): ReadonlyArray<d.QQuestion> => {
    if (id._ === "Nothing") {
      return [];
    }
    return getParentQuestionList(id.value, questionMap);
  },
  getQuestionTreeListWithLoadingStateInProgram: (
    programId: d.QProgramId
  ): QuestionTreeListWithLoadingState => {
    return {
      tag: "Loaded",
      questionTreeList: getQuestionTree(programId, questionList),
    };
  },
  createClass: action("createClass"),
  getClassAndRole: (): ClassAndRole => {
    return {
      tag: "admin",
      classWithParticipantList: mockClassWithParticipantListLoadingParticipant,
    };
  },
  shareClassInviteLink: action("shareClassInviteLink"),
  editQuestion: action("editQuestion"),
  getQuestionThatCanBeParentList: () => {
    return questionList;
  },
  joinClass: action("joinClass"),
  getQuestionInProgramByQuestionId: action("getQuestionInProgramByQuestionId"),
  requestParticipantListInClass: action("requestParticipantListInClass"),
};

export const mockAccount: d.QAccount = {
  id: "fakeAccountId" as d.AccountId,
  iconHash: "fakeIconHash" as d.ImageHash,
  name: "サンプルアカウント名",
};
export const mockAccount2: d.QAccount = {
  id: "fakeAccountId2" as d.AccountId,
  iconHash: "fakeIconHash2" as d.ImageHash,
  name: "なんとかさん",
};
export const mockAccount3: d.QAccount = {
  id: "fakeAccountId3" as d.AccountId,
  iconHash: "fakeIconHash3" as d.ImageHash,
  name: "大将",
};

export const mockAccountId = "mockAccountId" as d.AccountId;
export const mockAccountToken = "mockAccountToken" as d.AccountToken;

export const mockProgramIdA = "mockProgramA" as d.QProgramId;
export const mockProgramIdB = "mockProgramB" as d.QProgramId;
export const mockProgramIdLong = "mockProgramLong" as d.QProgramId;
export const mockClassId = "mockClassId" as d.QClassId;

export const mockClassInvitationToken =
  "5dc8e350896ab32e0db92d3edf8c6a9f59877d5175879843ccf546abcaec70e5" as d.QClassInvitationToken;

export const mockClass: d.QClass = {
  id: mockClassId,
  name: "サンプルクラス",
  programId: mockProgramIdA,
  invitationToken: mockClassInvitationToken,
  createAccountId: "" as d.AccountId,
};

export const mockClassWithParticipantListLoadingParticipant: ClassWithParticipantList =
  {
    qClass: mockClass,
    participantList: undefined,
  };

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

const programA: ProgramWithClassList = {
  name: "サンプルプログラム名A",
  createAccountId: mockAccountId,
  id: mockProgramIdA,
  classList: [mockClassWithParticipantListLoadingParticipant],
};

export const mockQClassStudentOrGuest: d.QClassStudentOrGuest = {
  id: mockClassId,
  name: "サンプルクラス名",
  createAccountId: mockAccountId,
  programId: mockProgramIdA,
};

export const mockLoggedInState: LoggedInState = {
  account: mockAccount,
  accountToken: mockAccountToken,
  createdProgramMap: new Map<d.QProgramId, ProgramWithClassList>([
    [mockProgramIdA, programA],
  ]),
  questionMap: new Map(),
  joinedClassMap: new Map([
    [
      mockClassId,
      {
        class: mockQClassStudentOrGuest,
        role: d.QRole.Guest,
        participantList: undefined,
      },
    ],
  ]),
};
