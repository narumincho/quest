import * as d from "../../data";
import { useState } from "react";

export type UseClassMapResult = {
  /** クラスをリロードするまで保存する */
  setClass: (qClass: d.QClass) => void;
  /** 1度に複数のクラスをリロードするまで保存する */
  setClassList: (classList: ReadonlyArray<d.QClass>) => void;
  getById: (id: d.QClassId) => d.QClass | undefined;
};

export const useClassMap = (): UseClassMapResult => {
  const [classMap, setClassMap] = useState<ReadonlyMap<d.QClassId, d.QClass>>(
    new Map()
  );
  return {
    setClass: (qClass) => {
      setClassMap((before) => {
        return new Map(before).set(qClass.id, {
          id: qClass.id,
          name: qClass.name,
          programId: qClass.programId,
        });
      });
    },
    getById: (id) => {
      return classMap.get(id);
    },
    setClassList: (classList) => {
      setClassMap((before) => {
        const map = new Map(before);
        for (const qClass of classList) {
          map.set(qClass.id, {
            id: qClass.id,
            name: qClass.name,
            programId: qClass.programId,
          });
        }
        return map;
      });
    },
  };
};