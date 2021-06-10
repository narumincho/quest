import * as d from "../../data";
import { mapSet } from "../../common/map";

/** ログインしたときに保存する管理する状態 */
export type LoggedInState = {
  readonly accountToken: d.AccountToken;
  readonly account: d.QAccount;
  readonly createdProgramList: ReadonlyMap<d.QProgramId, ProgramWithClassList>;
  readonly joinedClassList: ReadonlyArray<
    d.Tuple2<d.QClassStudentOrGuest, d.QRole>
  >;
  readonly questionDict: ReadonlyMap<d.QProgramId, QuestionListState>;
};

/** 作成したプログラムと作成したクラス */
export type ProgramWithClassList = {
  readonly id: d.QProgramId;
  readonly name: string;
  readonly createAccountId: d.AccountId;
  readonly classList: ReadonlyArray<d.QClass>;
};

/** 質問の取得状態 */
export type QuestionListState =
  | {
      readonly tag: "Requesting";
    }
  | {
      readonly tag: "Error";
    }
  | {
      readonly tag: "Loaded";
      readonly questionIdList: ReadonlyArray<d.QQuestion>;
    };

export const initLoggedInState = (option: {
  readonly accountToken: d.AccountToken;
  readonly accountData: d.QAccountData;
}): LoggedInState => {
  return {
    accountToken: option.accountToken,
    account: option.accountData.account,
    createdProgramList: new Map<d.QProgramId, ProgramWithClassList>(
      option.accountData.createdProgramList.map((program): [
        d.QProgramId,
        ProgramWithClassList
      ] => [
        program.id,
        {
          id: program.id,
          name: program.name,
          classList: option.accountData.createdClassList.filter(
            (qClass) => qClass.programId === program.id
          ),
          createAccountId: program.createAccountId,
        },
      ])
    ),
    joinedClassList: option.accountData.joinedClassList,
    questionDict: new Map(),
  };
};

export const setProgram = (
  program: d.QProgram,
  beforeLoggedInState: LoggedInState
): LoggedInState => {
  return {
    ...beforeLoggedInState,
    createdProgramList: mapSet(
      beforeLoggedInState.createdProgramList,
      program.id,
      {
        id: program.id,
        classList: [],
        createAccountId: program.createAccountId,
        name: program.name,
      }
    ),
  };
};

export const setQuestionListState = (
  beforeLoggedInState: LoggedInState,
  option: { programId: d.QProgramId; questionListState: QuestionListState }
): LoggedInState => {
  return {
    ...beforeLoggedInState,
    questionDict: new Map(beforeLoggedInState.questionDict).set(
      option.programId,
      option.questionListState
    ),
  };
};
