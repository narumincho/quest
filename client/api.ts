import * as apiCodec from "../common/apiCodec";
import * as d from "../data";

type ApiCodecType = typeof apiCodec;

/**
 * quest の API. api[api名](リクエストのデータ) で呼べる. 戻り値の Nothing は fetch が失敗した場合に返す.
 * いずれは, Result型を返したい
 */
export const api = Object.fromEntries(
  Object.entries(apiCodec).map(([apiName, codec]) => [
    apiName,
    async (
      requestData: apiCodec.GetCodecType<
        ApiCodecType[keyof ApiCodecType]["request"]
      >
    ): Promise<
      d.Maybe<
        apiCodec.GetCodecType<ApiCodecType[keyof ApiCodecType]["response"]>
      >
    > => {
      console.log(apiName, "request", requestData);
      try {
        const response = await fetch(`/api/${apiName}`, {
          method: "POST",
          body: new Uint8Array(codec.request.encode(requestData as never)),
          headers: [["content-type", "application/octet-stream"]],
        });
        const binaryResponse = await response.arrayBuffer();
        const decodedResponse = codec.response.decode(
          0,
          new Uint8Array(binaryResponse)
        ).result;
        console.log(apiName, "response", decodedResponse);
        return d.Maybe.Just(decodedResponse);
      } catch (reason) {
        console.error(
          `quest api の ${apiName} を呼ぶときにエラーが発生した`,
          reason
        );
        return d.Maybe.Nothing();
      }
    },
  ])
) as {
  [apiName in keyof ApiCodecType]: (
    requestData: apiCodec.GetCodecType<ApiCodecType[apiName]["request"]>
  ) => Promise<
    d.Maybe<apiCodec.GetCodecType<ApiCodecType[apiName]["response"]>>
  >;
};
