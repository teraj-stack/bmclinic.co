import { build } from "esbuild";
import { readFileSync, writeFileSync } from "node:fs";
async function main() {
  const result = await build({
    entryPoints: ["src/demo/symptoms.tsx"],
    bundle: true,
    minify: true,
    write: false,
    platform: "browser",
    format: "iife",
    target: ["es2020"],
    define: { "process.env.NODE_ENV": '"production"' },
  });
  const script = result.outputFiles[0].text.replace(
    /<\/script/gi,
    "<\\/script",
  );
  const css = readFileSync("src/components/symptoms/symptom-map.css", "utf8");
  writeFileSync(
    "public/objawy-demo.html",
    `<!doctype html><html lang="pl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>BM Clinic — możliwości leczenia i mapa objawów</title><style>body{margin:0;background:#e8ede8}button,select,textarea{font:inherit}*{box-sizing:border-box}${css}</style></head><body><div id="root"></div><noscript>Do otwarcia interaktywnej demonstracji włącz JavaScript.</noscript><script>${script}</script></body></html>`,
  );
  console.log(
    "Built public/objawy-demo.html — shared React components, offline and no backend",
  );
}
void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
