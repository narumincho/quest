import * as d from "../data";

export type GetCodecType<codec> = codec extends d.Codec<infer t> ? t : never;

export type ApiCodec<Request, Response> = {
  request: d.Codec<Request>;
  response: d.Codec<Response>;
};

/**
 * LINE ログインの URL を生成して取得する
 */
export const requestLineLoginUrl: ApiCodec<d.Location, d.String> = {
  request: d.Location.codec,
  response: d.String.codec,
};

/**
 * アカウントトークンを取得する
 */
export const getAccountTokenAndLocationByCodeAndState: ApiCodec<
  d.CodeAndState,
  d.Option<d.AccountTokenAndLocation>
> = {
  request: d.CodeAndState.codec,
  response: d.Option.codec(d.AccountTokenAndLocation.codec),
};

/**
 * アカウントトークンから, アカウントに関連するデータ (アカウント情報, 作成したプログラム, 参加/作成したクラス等) を取得する
 */
export const getAccountData: ApiCodec<d.AccountToken, d.AccountData> = {
  request: d.AccountToken.codec,
  response: d.AccountData.codec,
};

/**
 * プログラムを作成する
 */
export const createProgram: ApiCodec<d.CreateProgramParameter, d.Program> = {
  request: d.CreateProgramParameter.codec,
  response: d.Program.codec,
};

/**
 * 指定したアカウントトークンのアカウントの作成したプログラムを取得する
 */
export const getCreatedProgram: ApiCodec<d.AccountToken, d.List<d.Program>> = {
  request: d.AccountToken.codec,
  response: d.List.codec(d.Program.codec),
};

/** 質問を作成する */
export const createQuestion: ApiCodec<d.CreateQuestionParamter, d.Question> = {
  request: d.CreateQuestionParamter.codec,
  response: d.Question.codec,
};

/**
 * 自身が作成したプログラムの質問を取得する
 */
export const getQuestionInCreatedProgram: ApiCodec<
  d.AccountTokenAndProgramId,
  d.List<d.Question>
> = {
  request: d.AccountTokenAndProgramId.codec,
  response: d.List.codec(d.Question.codec),
};

/**
 * クラスを作成する
 */
export const createClass: ApiCodec<d.CreateClassParameter, d.AdminClass> = {
  request: d.CreateClassParameter.codec,
  response: d.AdminClass.codec,
};

/**
 * プログラムに存在するクラスを取得する
 */
export const getClassListInProgram: ApiCodec<
  d.AccountTokenAndProgramId,
  d.List<d.AdminClass>
> = {
  request: d.AccountTokenAndProgramId.codec,
  response: d.List.codec(d.AdminClass.codec),
};

/**
 * 質問を編集する
 */
export const editQuestion: ApiCodec<d.EditQuestionParameter, d.Question> = {
  request: d.EditQuestionParameter.codec,
  response: d.Question.codec,
};

/** クラスの招待URLからクラスの情報を得る. ログインしていないときに招待URLを開いたときに使う */
export const getClassByClassInvitationToken: ApiCodec<
  d.StudentClassInvitationToken,
  d.AdminClass
> = {
  request: d.StudentClassInvitationToken.codec,
  response: d.AdminClass.codec,
};

/** 生徒として, クラスに参加する */
export const joinClassAsStudent: ApiCodec<
  d.JoinClassAsStudentParameter,
  d.ParticipantClass
> = {
  request: d.JoinClassAsStudentParameter.codec,
  response: d.ParticipantClass.codec,
};

/** クラス作成者か参加者がクラスに参加している参加者を取得する */
export const getClassParticipant: ApiCodec<
  d.AccountTokenAndClassId,
  ReadonlyArray<d.Participant>
> = {
  request: d.AccountTokenAndClassId.codec,
  response: d.List.codec(d.Participant.codec),
};

/**
 * 生徒が, クラスの木構造の質問と自分の回答と回答状況を取得する
 */
export const getStudentQuestionTreeInClass: ApiCodec<
  d.AccountTokenAndClassId,
  d.List<d.StudentSelfQuestionTree>
> = {
  request: d.AccountTokenAndClassId.codec,
  response: d.List.codec(d.StudentSelfQuestionTree.codec),
};

/**
 * 質問に回答する
 */
export const answerQuestion: ApiCodec<
  d.AnswerQuestionParameter,
  d.List<d.StudentSelfQuestionTree>
> = {
  request: d.AnswerQuestionParameter.codec,
  response: d.List.codec(d.StudentSelfQuestionTree.codec),
};

/**
 * 管理者が, 生徒が確定した回答を取得する
 */
export const getStudentConfirmedAnswerList: ApiCodec<
  d.GetStudentAnswerTreeParameter,
  d.List<d.ConfirmedAnswer>
> = {
  request: d.GetStudentAnswerTreeParameter.codec,
  response: d.List.codec(d.ConfirmedAnswer.codec),
};

/**
 * 他の人の回答を習得する
 */
export const getAnswersFromOtherStudents: ApiCodec<
  d.GetAnswersFromOtherStudentsParameter,
  ReadonlyArray<d.AnswersFromOtherStudent>
> = {
  request: d.GetAnswersFromOtherStudentsParameter.codec,
  response: d.List.codec(d.AnswersFromOtherStudent.codec),
};

/**
 * コメントを送信する
 */
export const addComment: ApiCodec<
  d.AddFeedbackParameter,
  ReadonlyArray<d.Feedback>
> = {
  request: d.AddFeedbackParameter.codec,
  response: d.List.codec(d.Feedback.codec),
};

/**
 * コメントを取得する
 */
export const getComment: ApiCodec<
  d.GetFeedbackParameter,
  ReadonlyArray<d.Feedback>
> = {
  request: d.GetFeedbackParameter.codec,
  response: d.List.codec(d.Feedback.codec),
};

/**
 * 通知を取得する
 */
export const getNotificationList: ApiCodec<
  d.AccountToken,
  ReadonlyArray<d.Notification>
> = {
  request: d.AccountToken.codec,
  response: d.List.codec(d.Notification.codec),
};

/**
 * 通知を既読にする
 */
export const notificationSetDone: ApiCodec<
  d.NotificationSetDoneParameter,
  ReadonlyArray<d.Notification>
> = {
  request: d.NotificationSetDoneParameter.codec,
  response: d.List.codec(d.Notification.codec),
};
