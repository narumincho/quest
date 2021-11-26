import * as d from "../data";

export type GetCodecType<codec> = codec extends d.Codec<infer t> ? t : never;

export type ApiCodec<Request, Response> = {
  request: d.Codec<Request>;
  response: d.Codec<Response>;
};

const createApiCodec = <Request, Response>(
  request: d.Codec<Request>,
  response: d.Codec<Response>
): ApiCodec<Request, Response> => {
  return {
    request,
    response,
  };
};

export type ApiCodecType = typeof apiCodec;

export const apiCodec = {
  /**
   * LINE ログインの URL を生成して取得する
   */
  requestLineLoginUrl: createApiCodec(d.Location.codec, d.String.codec),
  /**
   * アカウントトークンを取得する
   */
  getAccountTokenAndLocationByCodeAndState: createApiCodec(
    d.CodeAndState.codec,
    d.Option.codec(d.AccountTokenAndLocation.codec)
  ),

  /**
   * アカウントトークンから, アカウントに関連するデータ (アカウント情報, 作成したプログラム, 参加/作成したクラス等) を取得する
   */
  getAccountData: createApiCodec(d.AccountToken.codec, d.AccountData.codec),
  /**
   * プログラムを作成する
   */
  createProgram: createApiCodec(
    d.CreateProgramParameter.codec,
    d.Program.codec
  ),
  /**
   * 指定したアカウントトークンのアカウントの作成したプログラムを取得する
   */
  getCreatedProgram: createApiCodec(
    d.AccountToken.codec,
    d.List.codec(d.Program.codec)
  ),
  /** 質問を作成する */
  createQuestion: createApiCodec(
    d.CreateQuestionParamter.codec,
    d.Question.codec
  ),
  /**
   * 自身が作成したプログラムの質問を取得する
   */
  getQuestionInCreatedProgram: createApiCodec(
    d.AccountTokenAndProgramId.codec,
    d.List.codec(d.Question.codec)
  ),
  /**
   * クラスを作成する
   */
  createClass: createApiCodec(d.CreateClassParameter.codec, d.AdminClass.codec),
  /**
   * プログラムに存在するクラスを取得する
   */
  getClassListInProgram: createApiCodec(
    d.AccountTokenAndProgramId.codec,
    d.List.codec(d.AdminClass.codec)
  ),
  /**
   * 質問を編集する
   */
  editQuestion: createApiCodec(d.EditQuestionParameter.codec, d.Question.codec),
  /** クラスの招待URLからクラスの情報を得る. ログインしていないときに招待URLを開いたときに使う */
  getClassByClassInvitationToken: createApiCodec(
    d.StudentClassInvitationToken.codec,
    d.AdminClass.codec
  ),
  /** 生徒として, クラスに参加する */
  joinClassAsStudent: createApiCodec(
    d.JoinClassAsStudentParameter.codec,
    d.ParticipantClass.codec
  ),
  /** クラス作成者か参加者がクラスに参加している参加者を取得する */
  getClassParticipant: createApiCodec(
    d.AccountTokenAndClassId.codec,
    d.List.codec(d.Participant.codec)
  ),
  /**
   * 生徒が, クラスの木構造の質問と自分の回答と回答状況を取得する
   */
  getStudentQuestionTreeInClass: createApiCodec(
    d.AccountTokenAndClassId.codec,
    d.List.codec(d.StudentSelfQuestionTree.codec)
  ),
  /**
   * 質問に回答する
   */
  answerQuestion: createApiCodec(
    d.AnswerQuestionParameter.codec,
    d.List.codec(d.StudentSelfQuestionTree.codec)
  ),
  /**
   * 管理者が, 生徒が確定した回答を取得する
   */
  getStudentConfirmedAnswerList: createApiCodec(
    d.GetStudentAnswerTreeParameter.codec,
    d.List.codec(d.ConfirmedAnswer.codec)
  ),
  /**
   * 他の人の回答を習得する
   */
  getAnswersFromOtherStudents: createApiCodec(
    d.GetAnswersFromOtherStudentsParameter.codec,
    d.List.codec(d.AnswersFromOtherStudent.codec)
  ),
  /**
   * コメントを送信する
   */
  addComment: createApiCodec(
    d.AddCommentParameter.codec,
    d.List.codec(d.Comment.codec)
  ),
  /**
   * コメントを取得する
   */
  getComment: createApiCodec(
    d.GetCommentParameter.codec,
    d.List.codec(d.Comment.codec)
  ),
  /**
   * 通知を取得する
   */
  getNotificationList: createApiCodec(
    d.AccountToken.codec,
    d.List.codec(d.Notification.codec)
  ),
  /**
   * 通知を既読にする
   */
  notificationSetDone: createApiCodec(
    d.NotificationSetDoneParameter.codec,
    d.List.codec(d.Notification.codec)
  ),
} as const;
