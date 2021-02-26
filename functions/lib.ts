import * as apiCodec from "../common/apiCodec";

type ApiCodecType = typeof apiCodec;

export const apiFunc: {
  [apiName in keyof ApiCodecType]: (
    request: apiCodec.GetCodecType<ApiCodecType[apiName]["request"]>
  ) => Promise<apiCodec.GetCodecType<ApiCodecType[apiName]["response"]>>;
} = {
  requestLineLoginUrl: () => {
    return Promise.resolve("https://narumincho.com");
  },
};
