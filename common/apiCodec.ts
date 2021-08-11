import * as d from "../data";

export type GetCodecType<codec> = codec extends d.Codec<infer t> ? t : never;

export type ApiCodec<Request, Response> = {
  request: d.Codec<Request>;
  response: d.Codec<Response>;
};

/**
 * LINE ログインの URL を生成して取得する
 */
export const requestLineLoginUrl: ApiCodec<d.QLocation, d.String> = {
  request: d.QLocation.codec,
  response: d.String.codec,
};

/**
 * アカウントトークンを取得する
 */
export const getAccountTokenAndLocationByCodeAndState: ApiCodec<
  d.CodeAndState,
  d.Maybe<d.AccountTokenAndQLocation>
> = {
  request: d.CodeAndState.codec,
  response: d.Maybe.codec(d.AccountTokenAndQLocation.codec),
};

/**
 * アカウントトークンから, アカウントに関連するデータ (アカウント情報, 作成したプログラム, 参加/作成したクラス等) を取得する
 */
export const getAccountData: ApiCodec<d.AccountToken, d.QAccountData> = {
  request: d.AccountToken.codec,
  response: d.QAccountData.codec,
};

/**
 * プログラムを作成する
 */
export const createProgram: ApiCodec<d.QCreateProgramParameter, d.QProgram> = {
  request: d.QCreateProgramParameter.codec,
  response: d.QProgram.codec,
};

/**
 * 指定したアカウントトークンのアカウントの作成したプログラムを取得する
 */
export const getCreatedProgram: ApiCodec<d.AccountToken, d.List<d.QProgram>> = {
  request: d.AccountToken.codec,
  response: d.List.codec(d.QProgram.codec),
};

/** 質問を作成する */
export const createQuestion: ApiCodec<d.QCreateQuestionParamter, d.QQuestion> =
  {
    request: d.QCreateQuestionParamter.codec,
    response: d.QQuestion.codec,
  };

/**
 * 自身が作成したプログラムの質問を取得する
 */
export const getQuestionInCreatedProgram: ApiCodec<
  d.QAccountTokenAndProgramId,
  d.List<d.QQuestion>
> = {
  request: d.QAccountTokenAndProgramId.codec,
  response: d.List.codec(d.QQuestion.codec),
};

/**
 * クラスを作成する
 */
export const createClass: ApiCodec<d.QCreateClassParameter, d.QClass> = {
  request: d.QCreateClassParameter.codec,
  response: d.QClass.codec,
};

/**
 * プログラムに存在するクラスを取得する
 */
export const getClassListInProgram: ApiCodec<
  d.QAccountTokenAndProgramId,
  d.List<d.QClass>
> = {
  request: d.QAccountTokenAndProgramId.codec,
  response: d.List.codec(d.QClass.codec),
};

/**
 * 質問を編集する
 */
export const editQuestion: ApiCodec<d.QEditQuestion, d.QQuestion> = {
  request: d.QEditQuestion.codec,
  response: d.QQuestion.codec,
};

/** クラスの招待URLからクラスの情報を得る. ログインしていないときに招待URLを開いたときに使う */
export const getClassByClassInvitationToken: ApiCodec<
  d.QClassInvitationToken,
  d.QClass
> = {
  request: d.QClassInvitationToken.codec,
  response: d.QClass.codec,
};

/** 生徒として, クラスに参加する */
export const joinClassAsStudent: ApiCodec<
  d.JoinClassAsStudentParameter,
  d.QClass
> = {
  request: d.JoinClassAsStudentParameter.codec,
  response: d.QClass.codec,
};

/** プログラムに属する質問をすべてをある, 質問IDから得る */
export const getQuestionInProgramByQuestionId: ApiCodec<
  d.GetQuestionListInProgramByQuestionIdParameter,
  d.List<d.QQuestion>
> = {
  request: d.GetQuestionListInProgramByQuestionIdParameter.codec,
  response: d.List.codec(d.QQuestion.codec),
};

/** クラス作成者か参加者がクラスに参加している参加者を取得する */
export const getClassParticipant: ApiCodec<
  d.GetClassParticipantParameter,
  ReadonlyArray<d.Tuple2<d.QAccount, d.QRole>>
> = {
  request: d.GetClassParticipantParameter.codec,
  response: d.List.codec(d.Tuple2.codec(d.QAccount.codec, d.QRole.codec)),
};

/**
 * 生徒が, クラスの木構造の質問と自分の回答と回答状況を取得する
 */
export const getStudentQuestionTreeInClass: ApiCodec<
  d.Tuple2<d.AccountToken, d.QClassId>,
  d.List<d.StudentSelfQuestionTree>
> = {
  request: d.Tuple2.codec(d.AccountToken.codec, d.QClassId.codec),
  response: d.List.codec(d.StudentSelfQuestionTree.codec),
};
