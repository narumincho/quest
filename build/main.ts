import * as esbuild from "esbuild";
import * as fileSystem from "fs-extra";
import {
  ModuleKind,
  ModuleResolutionKind,
  NewLineKind,
  ScriptTarget,
  createProgram,
} from "typescript";
import { jsTs, d as jsTsData, packageJson } from "@narumincho/gen";
import { Mode } from "../common/mode";

const clientSourceEntryPath = "./client/main.tsx";
const functionsSourceEntryPath = "./functions/main.ts";
const distributionPath = "./distribution";
const functionsDistributionPath = `${distributionPath}/functions`;
const hostingDistributionPath = `${distributionPath}/hosting`;
const firestoreRulesFilePath = `${distributionPath}/firestore.rules`;
const cloudStorageRulesPath = `${distributionPath}/storage.rules`;

/**
 * Firebase へ デプロイするためにやビルドする
 */
export const build = async (mode: Mode): Promise<void> => {
  await fileSystem.remove(distributionPath);
  console.log(`${distributionPath}をすべて削除完了!`);
  if (mode === "development") {
    await fileSystem.copy(
      "../secret/quest.json",
      `${functionsDistributionPath}/.runtimeconfig.json`
    );
    console.log(
      `.runtimeconfig.json サーバーの秘密情報をローカルファイルからコピー完了`
    );
  }

  await outputPackageJsonForFunctions();
  console.log(`package.json を出力完了!`);
  await outputCommonOrigin(mode);
  console.log(`common/origin.ts を出力完了!`);
  await generateFirestoreRules();
  console.log(
    `Firestore 向けセキュリティールール (${firestoreRulesFilePath}) を出力完了!`
  );
  await generateCloudStorageRules();
  console.log(
    `Cloud Storage 向けの セキュリティールール (${cloudStorageRulesPath}) を出力完了!`
  );
  await generateFirebaseJson(mode);

  await fileSystem.copy("./static", hostingDistributionPath);
  console.log("staticなファイルのコピーが完了!");

  await esbuild.build({
    entryPoints: [clientSourceEntryPath],
    bundle: true,
    outdir: hostingDistributionPath,
    define: {
      "process.env.NODE_ENV": `"production"`,
    },
    sourcemap: true,
    minify: true,
    target: ["chrome90", "firefox88", "safari14"],
  });
  console.log("ブラウザ向けのプログラムのビルドが完了!");

  buildFunctionsTypeScript();
  console.log("Cloud Functions for Firebase 向けのプログラムのビルドが完了!");
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
      firestore: {
        rules: firestoreRulesFilePath,
      },
      storage: {
        rules: cloudStorageRulesPath,
      },
      hosting: {
        public: hostingDistributionPath,
        rewrites: [
          {
            source: "/api/**",
            function: "api",
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
              storage: {
                port: 9199,
              },
              ui: {
                enabled: true,
              },
            },
    })
  );
};

const generateFirestoreRules = (): Promise<void> => {
  return fileSystem.outputFile(
    firestoreRulesFilePath,
    `
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
`
  );
};

const generateCloudStorageRules = (): Promise<void> => {
  return fileSystem.outputFile(
    cloudStorageRulesPath,
    `rules_version = '2';

service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
`
  );
};

/**
 * Cloud Functions for Firebase の コードをビルドする
 *
 * TypeScript の 標準のコンパイラ tsc を使う
 */
const buildFunctionsTypeScript = (): void => {
  createProgram({
    rootNames: [functionsSourceEntryPath],
    options: {
      target: ScriptTarget.ES2020,
      forceConsistentCasingInFileNames: true,
      newLine: NewLineKind.LineFeed,
      lib: ["DOM", "ES2020"],
      strict: true,
      moduleResolution: ModuleResolutionKind.NodeJs,
      module: ModuleKind.CommonJS,
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
  const devDependencies = packageJson.fromJson(
    await fileSystem.readJSON("package.json")
  ).devDependencies;
  const packageNameUseInFunctions = [
    "@narumincho/gen",
    "firebase-admin",
    "firebase-functions",
    "axios",
    "jsonwebtoken",
    "graphql",
    "jimp",
  ];

  const packageJsonResult = packageJson.toJson({
    name: "definy-functions",
    version: "1.0.0",
    description: "definy in Cloud Functions for Firebase",
    entryPoint: "./functions/main.js",
    author: "narumincho",
    nodeVersion: "14",
    dependencies: new Map<string, string>(
      [...devDependencies].flatMap(
        ([packageName, packageVersion]): ReadonlyArray<
          readonly [string, string]
        > =>
          packageNameUseInFunctions.includes(packageName)
            ? [[packageName, packageVersion]]
            : []
      )
    ),
    gitHubAccountName: "narumincho",
    gitHubRepositoryName: "quest",
    homepage: "https://github.com/narumincho/quest",
  });
  if (packageJsonResult._ === "Error") {
    throw new Error(packageJsonResult.error);
  }

  await fileSystem.outputJson(
    `${functionsDistributionPath}/package.json`,
    packageJsonResult.ok
  );
};

/** `common/origin` のファイルを出力する. modeによって出力されるオリジンが変更される. */
const outputCommonOrigin = (mode: Mode): Promise<void> => {
  const modeIdentifer = jsTs.identiferFromString("Mode");
  return fileSystem.outputFile(
    "./common/nowMode.ts",
    jsTs.generateCodeAsString(
      {
        exportDefinitionList: [
          jsTsData.ExportDefinition.Variable({
            name: jsTs.identiferFromString("nowMode"),
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
