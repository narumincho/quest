import * as d from "../../data";
import { useState } from "react";

export type RequestQuestionListInProgramState =
  | {
      tag: "None";
    }
  | {
      tag: "Requesting";
    }
  | {
      tag: "Loaded";
      questionIdList: ReadonlyArray<d.QQuestionId>;
    };

export type RequestClassListInProgramState =
  | {
      tag: "None";
    }
  | {
      tag: "Requesting";
    }
  | {
      tag: "Loaded";
      classIdList: ReadonlyArray<d.QClassId>;
    };

export type ProgramWithQuestionIdListAndClassIdList = {
  readonly id: d.QProgramId;
  readonly name: string;
  readonly createAccountId: d.AccountId;
  readonly questionIdList: RequestQuestionListInProgramState;
  readonly classIdList: RequestClassListInProgramState;
};

export type UseProgramMapResult = {
  /** プログラムをリロードするまで保存する */
  setProgram: (program: d.QProgram) => void;
  /** 1度にプログラムをリロードするまで保存する */
  setProgramList: (programList: ReadonlyArray<d.QProgram>) => void;
  getById: (
    id: d.QProgramId
  ) => ProgramWithQuestionIdListAndClassIdList | undefined;
  /** プログラムに属している質問の取得状態を取得中に変更する */
  setQuestionInProgramRequesting: (programId: d.QProgramId) => void;
  /** プログラムに属している質問の取得状態をエラーに変更する */
  setQuestionInProgramError: (programId: d.QProgramId) => void;
  /** プログラムに属しているクラスの取得状態を取得中に変更する */
  setClassInProgramRequesting: (programId: d.QProgramId) => void;
  /** プログラムに属しているクラスの取得状態をエラーに変更する */
  setClassInProgramError: (programId: d.QProgramId) => void;
  /** プログラムに属している質問のIDをキャッシュに保存する */
  setProgramQuestionList: (
    programId: d.QProgramId,
    questionIdList: ReadonlyArray<d.QQuestionId>
  ) => void;
  /** プログラムに属しているクラスのIDをキャッシュに保存する */
  setClassIdList: (
    programId: d.QProgramId,
    classIdList: ReadonlyArray<d.QClassId>
  ) => void;
};

export const useProgramMap = (): UseProgramMapResult => {
  const [programMap, setProgramMap] = useState<
    ReadonlyMap<d.QProgramId, ProgramWithQuestionIdListAndClassIdList>
  >(new Map());
  return {
    /** プログラムをリロードするまで保存する */
    setProgram: (program: d.QProgram): void => {
      setProgramMap((before) => {
        return new Map(before).set(program.id, {
          id: program.id,
          name: program.name,
          createAccountId: program.createAccountId,
          questionIdList: { tag: "None" },
          classIdList: { tag: "None" },
        });
      });
    },
    /** 1度にプログラムをリロードするまで保存する */
    setProgramList: (programList: ReadonlyArray<d.QProgram>): void => {
      setProgramMap((before) => {
        const map = new Map(before);
        for (const program of programList) {
          map.set(program.id, {
            id: program.id,
            name: program.name,
            createAccountId: program.createAccountId,
            questionIdList: { tag: "None" },
            classIdList: { tag: "None" },
          });
        }
        return map;
      });
    },
    getById: (programId) => {
      return programMap.get(programId);
    },
    setQuestionInProgramRequesting: (programId: d.QProgramId): void => {
      setProgramMap((before) => {
        const beforeProgram = before.get(programId);
        if (beforeProgram === undefined) {
          return before;
        }
        return new Map(before).set(programId, {
          ...beforeProgram,
          questionIdList: { tag: "Requesting" },
        });
      });
    },
    setQuestionInProgramError: () => {},
    setClassInProgramRequesting: (programId) => {
      setProgramMap((before) => {
        const beforeProgram = before.get(programId);
        if (beforeProgram === undefined) {
          return before;
        }
        return new Map(before).set(programId, {
          ...beforeProgram,
          classIdList: { tag: "Requesting" },
        });
      });
    },
    setClassInProgramError: () => {},
    setProgramQuestionList: (
      programId: d.QProgramId,
      questionIdList: ReadonlyArray<d.QQuestionId>
    ): void => {
      setProgramMap((before) => {
        const beforeProgram = before.get(programId);
        if (beforeProgram === undefined) {
          return before;
        }
        return new Map(before).set(programId, {
          ...beforeProgram,
          questionIdList: { tag: "Loaded", questionIdList },
        });
      });
    },
    setClassIdList: (programId, classIdList): void => {
      setProgramMap((before) => {
        const beforeProgram = before.get(programId);
        if (beforeProgram === undefined) {
          return before;
        }
        return new Map(before).set(programId, {
          ...beforeProgram,
          classIdList: { tag: "Loaded", classIdList },
        });
      });
    },
  };
};
