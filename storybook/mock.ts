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
  location: d.Location.Top,
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
      iconHash: "fakeIconHash" as d.ImageHashValue,
      name: "サンプルアカウント名",
    };
  },
  isCreatingQuestion: false,
  createQuestion: action("質問を作成しようとした"),
  requestGetQuestionListInProgram: action(
    "プログラムに属している質問を習得しようとした"
  ),

  question: (id): d.Question | undefined => {
    return questionMap.get(id);
  },
  questionChildren: (id: d.QuestionId): ReadonlyArray<d.QuestionId> =>
    questionChildren(id, questionMap),
  questionParentList: (
    id: d.Option<d.QuestionId>
  ): ReadonlyArray<d.Question> => {
    if (id._ === "None") {
      return [];
    }
    return getParentQuestionList(id.value, questionMap);
  },
  getQuestionTreeListWithLoadingStateInProgram: (
    programId: d.ProgramId
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
  requestParticipantListInClass: action("requestParticipantListInClass"),
  requestStudentQuestionTreeInClass: action("getStudentQuestionTreeInClass"),
  getStudentQuestionTree: () => undefined,
};

export const mockAccount: d.Account = {
  id: "fakeAccountId" as d.AccountId,
  iconHash: "fakeIconHash" as d.ImageHashValue,
  name: "サンプルアカウント名",
};
export const mockAccount2: d.Account = {
  id: "fakeAccountId2" as d.AccountId,
  iconHash: "fakeIconHash2" as d.ImageHashValue,
  name: "なんとかさん",
};
export const mockAccount3: d.Account = {
  id: "fakeAccountId3" as d.AccountId,
  iconHash: "fakeIconHash3" as d.ImageHashValue,
  name: "大将",
};

export const mockAccountId = "mockAccountId" as d.AccountId;
export const mockAccountToken = "mockAccountToken" as d.AccountToken;

export const mockProgramIdA = "mockProgramA" as d.ProgramId;
export const mockProgramIdB = "mockProgramB" as d.ProgramId;
export const mockProgramIdLong = "mockProgramLong" as d.ProgramId;
export const mockClassId = "mockClassId" as d.ClassId;

export const mockClassInvitationToken =
  "5dc8e350896ab32e0db92d3edf8c6a9f59877d5175879843ccf546abcaec70e5" as d.StudentClassInvitationToken;

export const mockClass: d.AdminClass = {
  id: mockClassId,
  name: "サンプルクラス",
  programId: mockProgramIdA,
  studentInvitationToken: mockClassInvitationToken,
};

export const mockClassWithParticipantListLoadingParticipant: ClassWithParticipantList =
  {
    qClass: mockClass,
    participantList: undefined,
  };

const lorem =
  "Lorem ipsum dolor sit amet consectetur adipisicing elit. Esse error earum, suscipit ullam";

const korekara = "korekara" as d.QuestionId;
const zinsei = "zinsei" as d.QuestionId;
export const muzintou = "muzintou" as d.QuestionId;
const dream = "draem" as d.QuestionId;
const happy = "happy" as d.QuestionId;
const saketai = "saketai" as d.QuestionId;
const yuhan = "yuhan" as d.QuestionId;

const questionList: ReadonlyArray<d.Question> = [
  {
    id: korekara,
    name: "これから何をしますか",
    parent: d.Option.None(),
    programId: mockProgramIdA,
  },
  {
    id: zinsei,
    name: "人生にとって何が大切ですか?",
    parent: d.Option.Some(korekara),
    programId: mockProgramIdA,
  },
  {
    id: muzintou,
    name: "無人島に 1つだけ ものを持っていくとしたら何を持っていきますか?",
    parent: d.Option.Some(zinsei),
    programId: mockProgramIdA,
  },
  {
    id: "takara" as d.QuestionId,
    name: "今も持っている宝はありますか?",
    parent: d.Option.Some(muzintou),
    programId: mockProgramIdA,
  },
  {
    id: "nanisugosu" as d.QuestionId,
    name: "時間が余っているときに, 何をして過ごしていますか?",
    parent: d.Option.Some(muzintou),
    programId: mockProgramIdA,
  },
  {
    id: dream,
    name: "将来の夢は何ですか?",
    parent: d.Option.Some(zinsei),
    programId: mockProgramIdA,
  },
  {
    id: "syougakuseiyume" as d.QuestionId,
    name: "小学生のときの将来の夢は何ですか",
    parent: d.Option.Some(dream),
    programId: mockProgramIdA,
  },
  {
    id: happy,
    name: "今までで, 1番楽しかったことは何ですか?",
    parent: d.Option.Some(zinsei),
    programId: mockProgramIdA,
  },
  {
    id: "shougakuseitanosikatta" as d.QuestionId,
    name: "小学生のとき 1番 楽しかったことは何ですか?",
    parent: d.Option.Some(happy),
    programId: mockProgramIdA,
  },
  {
    id: "tyougakuseitanosikatta" as d.QuestionId,
    name: "中学生のとき 1番 楽しかったことは何ですか?",
    parent: d.Option.Some(happy),
    programId: mockProgramIdA,
  },
  {
    id: "kouokouseitanosikatta" as d.QuestionId,
    name: "高校生のとき 1番 楽しかったことは何ですか?",
    parent: d.Option.Some(happy),
    programId: mockProgramIdA,
  },
  {
    id: "daigakuseitanosikatta" as d.QuestionId,
    name: "大学生のとき 1番 楽しかったことは何ですか?",
    parent: d.Option.Some(happy),
    programId: mockProgramIdA,
  },
  {
    id: saketai,
    name: "したくないことは何ですか",
    parent: d.Option.Some(zinsei),
    programId: mockProgramIdA,
  },
  {
    id: "iyadatta" as d.QuestionId,
    name: "今まで嫌だったことは何ですか?",
    parent: d.Option.Some(saketai),
    programId: mockProgramIdA,
  },
  {
    id: yuhan,
    name: "関係ないけど, 今日の夕飯は何にしますか?",
    parent: d.Option.None(),
    programId: mockProgramIdA,
  },
];

const questionMap: ReadonlyMap<d.QuestionId, d.Question> = new Map(
  questionList.map((question) => [question.id, question] as const)
);

const programA: ProgramWithClassList = {
  name: "サンプルプログラム名A",
  createAccountId: mockAccountId,
  id: mockProgramIdA,
  classList: [mockClassWithParticipantListLoadingParticipant],
};

export const mockQClassStudentOrGuest: d.ParticipantClass = {
  id: mockClassId,
  name: "サンプルクラス名",
  createAccountId: mockAccountId,
  programId: mockProgramIdA,
  role: d.ClassParticipantRole.Student,
};

export const mockLoggedInState: LoggedInState = {
  account: mockAccount,
  accountToken: mockAccountToken,
  createdProgramMap: new Map<d.ProgramId, ProgramWithClassList>([
    [mockProgramIdA, programA],
  ]),
  questionMap: new Map(),
  joinedClassMap: new Map([
    [
      mockClassId,
      {
        class: mockQClassStudentOrGuest,
        role: d.ClassParticipantRole.Guest,
        participantList: undefined,
        questionTreeList: undefined,
      },
    ],
  ]),
};

export const mockStudentSelfQuestionTreeList: ReadonlyArray<d.StudentSelfQuestionTree> =
  [
    {
      answer: d.Option.None(),
      questionId: d.QuestionId.fromString("sampleA"),
      questionText: "学生時代に頑張ったこと",
      children: [
        {
          answer: d.Option.None(),
          questionText: "どんな課題に取り組んだか",
          children: [],
          questionId: d.QuestionId.fromString("sampleAA"),
        },
        {
          answer: d.Option.None(),
          questionText: "どんな目標に取り組んだか",
          children: [],
          questionId: d.QuestionId.fromString("sampleAB"),
        },
        {
          answer: d.Option.None(),
          questionText: "実際の取り組みはどのようなものだったのか",
          children: [],
          questionId: d.QuestionId.fromString("sampleAC"),
        },
        {
          answer: d.Option.Some({
            isConfirm: false,
            text: "良い結果を得られた. 具体的な内容は……",
          }),
          questionText: "結果はそのようなものが得られたか",
          children: [],
          questionId: d.QuestionId.fromString("sampleAD"),
        },
        {
          answer: d.Option.Some({
            isConfirm: true,
            text: "はい",
          }),
          questionText: "学びは得られたか?",
          children: [],
          questionId: d.QuestionId.fromString("sampleAE"),
        },
      ],
    },
    {
      answer: d.Option.Some({
        isConfirm: true,
        text: "私は人間です",
      }),
      questionId: d.QuestionId.fromString("sampleB"),
      questionText: "自己紹介",
      children: [],
    },
  ];
