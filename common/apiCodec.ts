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
