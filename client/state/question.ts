import * as d from "../../data";
import { useState } from "react";

export const useQuestionMap = () => {
  const [questionMap, setQuestionMap] = useState<
    ReadonlyMap<d.QQuestionId, d.QQuestion>
  >(new Map());
  return {
    /** 質問をすべて置き換える (storybook 用) */
    overwriteQuestionList: (questionList: ReadonlyArray<d.QQuestion>): void => {
      setQuestionMap(
        new Map(
          questionList.map((question) => [question.id, question] as const)
        )
      );
    },
    /** 質問を保存する */
    setQuestion: (question: d.QQuestion): void => {
      setQuestionMap((before) => {
        return new Map(before).set(question.id, question);
      });
    },
    /** 複数の質問を一度に保存する */
    setQuestionList: (questionList: ReadonlyArray<d.QQuestion>): void => {
      setQuestionMap((before) => {
        const map = new Map(before);
        for (const question of questionList) {
          map.set(question.id, question);
        }
        return map;
      });
    },
    /** 質問のキャッシュ辞書 */
    questionMap,
    /** QuestionId から 質問を得る */
    questionById: (id: d.QQuestionId) => {
      return questionMap.get(id);
    },
  };
};
