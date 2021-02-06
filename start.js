/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-var-requires */
const esbuild = require("esbuild");
const fastify = require("fastify");
const axios = require("axios");

const server = fastify.fastify({
  logger: true,
});

const scriptPath = "/script";
const mainServerPortNumber = 5000;
const esbuildPortNumber = 5001;
const esbuildOutFileName = "main.js";

server.get("/", (request, reply) => {
  reply.type("text/html");
  return `
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
`;
});

server.get(scriptPath, async (request) => {
  console.log("request.accept", request.accept);
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
