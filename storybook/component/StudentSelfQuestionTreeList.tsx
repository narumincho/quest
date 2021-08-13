import * as React from "react";
import * as d from "../../data";
import { Meta, Story } from "@storybook/react";
import { StudentSelfQuestionTreeList } from "../../client/component/StudentSelfQuestionTreeList";

const meta: Meta = {
  title: "StudentSelfQuestionTreeList",
  component: StudentSelfQuestionTreeList,
};
export default meta;

export const Default: Story<never> = () => (
  <StudentSelfQuestionTreeList
    treeList={[
      {
        answer: d.Maybe.Nothing(),
        questionId: d.QQuestionId.fromString("sampleA"),
        questionText: "学生時代に頑張ったこと",
        children: [
          {
            answer: d.Maybe.Nothing(),
            questionText: "どんな課題に取り組んだか",
            children: [],
            questionId: d.QQuestionId.fromString("sampleAA"),
          },
          {
            answer: d.Maybe.Nothing(),
            questionText: "どんな目標に取り組んだか",
            children: [],
            questionId: d.QQuestionId.fromString("sampleAB"),
          },
          {
            answer: d.Maybe.Nothing(),
            questionText: "実際の取り組みはどのようなものだったのか",
            children: [],
            questionId: d.QQuestionId.fromString("sampleAC"),
          },
          {
            answer: d.Maybe.Just({
              isConfirm: false,
              text: "良い結果を得られた. 具体的な内容は……",
            }),
            questionText: "結果はそのようなものが得られたか",
            children: [],
            questionId: d.QQuestionId.fromString("sampleAD"),
          },
          {
            answer: d.Maybe.Just({
              isConfirm: true,
              text: "はい",
            }),
            questionText: "学びは得られたか?",
            children: [],
            questionId: d.QQuestionId.fromString("sampleAE"),
          },
        ],
      },
      {
        answer: d.Maybe.Just({
          isConfirm: true,
          text: "私は人間です",
        }),
        questionId: d.QQuestionId.fromString("sampleB"),
        questionText: "自己紹介",
        children: [],
      },
    ]}
  />
);
