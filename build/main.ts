import * as esbuild from "esbuild";
import * as fileSystem from "fs-extra";
import * as ts from "typescript";
import {
  generateCodeAsString,
  identifer,
  d as jsTsData,
} from "js-ts-code-generator";
import { Mode } from "../common/mode";

const clientSourceEntryPath = "./client/main.tsx";
const functionsSourceEntryPath = "./functions/main.ts";
const distributionPath = "./distribution";
const functionsDistributionPath = `${distributionPath}/functions`;
const hostingDistributionPath = `${distributionPath}/hosting`;

/**
 * Firebase へ デプロイするためにやビルドする
 */
export const build = async (mode: Mode): Promise<void> => {
  await outputPackageJsonForFunctions();
  await outputCommonOrigin(mode);

  await generateFirebaseJson(mode);

  /** staticなファイルのコピー */
  await fileSystem.copy("./static", hostingDistributionPath);

  await esbuild.build({
    entryPoints: [clientSourceEntryPath],
    bundle: true,
    outdir: hostingDistributionPath,
    define: {
      "process.env.NODE_ENV": `"production"`,
    },
    sourcemap: true,
    minify: true,
    target: ["chrome88", "firefox85", "safari14"],
  });

  buildFunctionsTypeScript();
  console.log(
    `やったー ${distributionPath}に${
      mode === "development" ? "開発" : "本番"
    }用のビルドができたぞ!`
  );
};

const generateFirebaseJson = (clientMode: Mode): Promise<void> => {
  return fileSystem.outputFile(
    `firebase.json`,
    JSON.stringify({
      functions: {
        source: functionsDistributionPath,
      },
      hosting: {
        public: hostingDistributionPath,
        rewrites: [
          {
            source: "/api/**",
            function: "api",
          },
          {
            source: "/lineLoginCallback",
            function: "lineLoginCallback",
          },
          {
            source: "/file/**",
            function: "file",
          },
          {
            source: "**",
            destination: "/index.html",
          },
        ],
        cleanUrls: true,
        trailingSlash: false,
      },
      emulators:
        clientMode === "production"
          ? undefined
          : {
              functions: {
                port: 5001,
              },
              firestore: {
                port: 8080,
              },
              hosting: {
                port: 5000,
              },
              ui: {
                enabled: true,
              },
            },
    })
  );
};

/**
 * Cloud Functions for Firebase の コードをビルドする
 *
 * TypeScript の 標準のコンパイラ tsc を使う
 */
const buildFunctionsTypeScript = (): void => {
  ts.createProgram({
    rootNames: [functionsSourceEntryPath],
    options: {
      target: ts.ScriptTarget.ES2020,
      forceConsistentCasingInFileNames: true,
      newLine: ts.NewLineKind.LineFeed,
      lib: ["DOM", "ES2020"],
      strict: true,
      moduleResolution: ts.ModuleResolutionKind.NodeJs,
      module: ts.ModuleKind.CommonJS,
      outDir: functionsDistributionPath,
    },
  }).emit();
};

/**
 * Cloud Functions for Firebase で 使われる `package.json` のファイルを出力する
 *
 * 使用するパッケージはこの関数内で指定し,
 * バージョンは リポジトリのルートにある `package.json` のバージョンを読み取って使用する.
 */
const outputPackageJsonForFunctions = async (): Promise<void> => {
  const packageJson: {
    devDependencies: Record<string, string>;
  } = await fileSystem.readJSON("package.json");
  const packageNameUseInFunctions = [
    "@narumincho/html",
    "firebase-admin",
    "firebase-functions",
    "axios",
    "jsonwebtoken",
    "graphql",
    "jimp",
    "fs-extra",
  ];

  await fileSystem.outputFile(
    `${functionsDistributionPath}/package.json`,
    JSON.stringify({
      name: "definy-functions",
      version: "1.0.0",
      description: "definy in Cloud Functions for Firebase",
      main: "./functions/main.js",
      author: "narumincho",
      engines: { node: "14" },
      dependencies: Object.fromEntries(
        Object.entries(packageJson.devDependencies).flatMap(
          ([packageName, packageVersion]): ReadonlyArray<
            readonly [string, string]
          > =>
            packageNameUseInFunctions.includes(packageName)
              ? [[packageName, packageVersion]]
              : []
        )
      ),
    })
  );
};

/** `common/origin` のファイルを出力する. modeによって出力されるオリジンが変更される. */
const outputCommonOrigin = (mode: Mode): Promise<void> => {
  const modeIdentifer = identifer.fromString("Mode");
  return fileSystem.outputFile(
    "./common/nowMode.ts",
    generateCodeAsString(
      {
        exportDefinitionList: [
          jsTsData.ExportDefinition.Variable({
            name: identifer.fromString("nowMode"),
            document: "現在のビルドの動作モード",
            expr: jsTsData.TsExpr.StringLiteral(mode),
            type: jsTsData.TsType.ImportedType({
              moduleName: "./mode",
              name: modeIdentifer,
            }),
          }),
        ],
        statementList: [],
      },
      "TypeScript"
    )
  );
};
