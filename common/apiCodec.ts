import * as d from "../data";

export type GetCodecType<codec> = codec extends d.Codec<infer t> ? t : never;

export type ApiCodec<Request, Response> = {
  request: d.Codec<Request>;
  response: d.Codec<Response>;
};

/**
 * LINE ログインの URL を生成して取得する
 */
export const requestLineLoginUrl: ApiCodec<d.Unit, d.String> = {
  request: d.Unit.codec,
  response: d.String.codec,
};

/**
 * アカウントトークンからアカウントを作成する
 */
export const getAccountByAccountToken: ApiCodec<d.AccountToken, d.QAccount> = {
  request: d.AccountToken.codec,
  response: d.QAccount.codec,
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
export const createQuestion: ApiCodec<
  d.QCreateQuestionParamter,
  d.QQuestion
> = {
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
