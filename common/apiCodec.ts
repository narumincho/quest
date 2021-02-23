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
