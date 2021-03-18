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

export type ProgramWithQuestionIdList = {
  readonly id: d.QProgramId;
  readonly name: string;
  readonly createAccountId: d.AccountId;
  readonly questionList: RequestQuestionListInProgramState;
};

export const useProgramMap = () => {
  const [programMap, setProgramMap] = useState<
    ReadonlyMap<d.QProgramId, ProgramWithQuestionIdList>
  >(new Map());
  return {
    /** プログラムをリロードするまで保存する */
    setProgram: (program: d.QProgram): void => {
      setProgramMap((before) => {
        return new Map(before).set(program.id, {
          id: program.id,
          name: program.name,
          createAccountId: program.createAccountId,
          questionList: { tag: "None" },
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
            questionList: { tag: "None" },
          });
        }
        return map;
      });
    },
    getById: (
      programId: d.QProgramId
    ): ProgramWithQuestionIdList | undefined => {
      return programMap.get(programId);
    },
    setProgramQuestionRequesting: (programId: d.QProgramId) => {
      setProgramMap((before) => {
        const beforeProgram = before.get(programId);
        if (beforeProgram === undefined) {
          return before;
        }
        return new Map(before).set(programId, {
          id: programId,
          name: beforeProgram.name,
          createAccountId: beforeProgram.createAccountId,
          questionList: { tag: "Requesting" },
        });
      });
    },
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
          id: programId,
          name: beforeProgram.name,
          createAccountId: beforeProgram.createAccountId,
          questionList: { tag: "Loaded", questionIdList },
        });
      });
    },
  };
};
