import * as d from "../data";

export type GetCodecType<codec> = codec extends d.Codec<infer t> ? t : never;

export type ApiCodec<Request, Response> = {
  request: d.Codec<Request>;
  response: d.Codec<Response>;
};

export const requestLineLoginUrl: ApiCodec<d.Unit, d.String> = {
  request: d.Unit.codec,
  response: d.String.codec,
};

export const getAccountByAccountToken: ApiCodec<d.AccountToken, d.QAccount> = {
  request: d.AccountToken.codec,
  response: d.QAccount.codec,
};

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
  d.QGetQuestionListByProgramId,
  d.List<d.QQuestion>
> = {
  request: d.QGetQuestionListByProgramId.codec,
  response: d.List.codec(d.QQuestion.codec),
};
