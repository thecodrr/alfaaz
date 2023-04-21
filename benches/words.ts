import { readFileSync } from "fs";
import path from "path";
import { Bench } from "tinybench";
import { countWords } from "../src";
// @ts-ignore
import markdownTable from "markdown-table";

const artOfWar = readFileSync(
  path.join(__dirname, "data", "art-of-war.txt"),
  "utf-8"
);
const gulliverTravels = readFileSync(
  path.join(__dirname, "data", "gulliver.txt"),
  "utf-8"
);

async function runBenchmark(name: string, text: string) {
  const REGEX =
    /\s+|[\p{Script=Han}\p{Script=Katakana}\p{Script=Hiragana}\u3000-\u303f]/u;

  const bench = new Bench({
    warmupIterations: 100,
  });

  bench
    .add("alfaaz", () => {
      countWords(text);
    })
    .add("regex", () => {
      text.split(REGEX).length;
    });

  await bench.run();

  console.log(
    `**${name}:**\n\n`,
    "Total words:",
    countWords(text),
    "  \n",
    "File size (bytes):",
    Buffer.from(text).length,
    "  \n",
    "File length (chars):",
    text.length,
    "  "
  );

  const results = markdownTable([
    ["Task name", "ops/s", "GB/s", "Words/s"],
    ...bench.tasks.map(({ name, result }) =>
      result
        ? [
            name,
            result.hz.toString(),
            (
              (Buffer.from(text).length * Math.round(result.hz)) /
              1024 /
              1024 /
              1024
            ).toString(),
            countWords(text) * Math.round(result.hz),
          ]
        : []
    ),
  ]);
  console.log();
  console.log(results);
  console.log();
}

async function main() {
  await runBenchmark("Count words (no CJK, only English):", gulliverTravels);
  await runBenchmark("Count words (CJK + English):", artOfWar);
}

main();
