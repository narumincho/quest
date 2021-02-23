import * as esbuild from "esbuild";
import * as fileSystem from "fs-extra";
import * as ts from "typescript";

const clientSourceEntryPath = "./client/main.tsx";
const functionsSourceEntryPath = "./functions/main.ts";
const distributionPath = "./distribution";
const functionsDistributionPath = `${distributionPath}/functions`;
const hostingDistributionPath = `${distributionPath}/hosting`;

type BuildMode = "development" | "production";
/**
 * Firebase へ デプロイするためにやビルドする
 */
export const build = async (buildMode: BuildMode): Promise<void> => {
  await outputPackageJsonForFunctions();

  await generateFirebaseJson(buildMode);

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
};

const generateFirebaseJson = (clientMode: BuildMode): Promise<void> => {
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
