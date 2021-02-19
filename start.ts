import * as axios from "axios";
import * as esbuild from "esbuild";
import * as fastify from "fastify";

const server = fastify.fastify({
  logger: true,
});

const scriptPath = "/script";
const mainServerPortNumber = 5000;
const esbuildPortNumber = 5001;
const esbuildOutFileName = "main.js";

server.get(
  "/",
  (request, reply): Promise<string> => {
    reply.type("text/html");
    return Promise.resolve(`
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src=${scriptPath}></script>
    <title>タイトル</title>
</head>
<body>
  <noscript>このサイトではJavaScriptを使用します. ブラウザの設定から有効にしてください</noscript>
</body>
</html>
`);
  }
);

server.get(scriptPath, async (request) => {
  console.log("request.accept", request.headers.accept);
  const response = await axios.default.get(
    `http://localhost:${esbuildPortNumber}/${esbuildOutFileName}`,
    {
      headers: {
        Accept: "application/javascript",
      },
    }
  );
  return response.data;
});

server.listen(mainServerPortNumber).catch((e) => {
  throw e;
});

esbuild
  .serve(
    {
      port: esbuildPortNumber,
    },
    {
      entryPoints: ["src/main.tsx"],
      bundle: true,
      define: {
        "process.env.NODE_ENV": '"develop"',
      },
      outfile: esbuildOutFileName,
    }
  )
  .then((e) => {
    throw e;
  });

console.log(`http://localhost:${mainServerPortNumber}`);
