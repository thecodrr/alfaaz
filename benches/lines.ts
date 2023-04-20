import { readFileSync } from "fs";
import path from "path";
import { Bench } from "tinybench";
import { countLines } from "../src";
// @ts-ignore
import markdownTable from "markdown-table";

const gulliverTravels = readFileSync(
  path.join(__dirname, "data", "gulliver.txt"),
  "utf-8"
);

async function runBenchmark(name: string, text: string) {
  const REGEX = /\n/g;

  const bench = new Bench({
    warmupIterations: 100,
  });

  bench
    .add("alfaaz", () => {
      countLines(text);
    })
    .add("split", () => {
      text.split("\n").length;
    })
    .add("regex", () => {
      text.split(REGEX).length;
    });

  await bench.run();

  console.log(
    `**${name}:**\n\n`,
    "Total lines:",
    countLines(text),
    "  \n",
    "File size (bytes):",
    Buffer.from(text).length,
    "  \n",
    "File length (chars):",
    text.length,
    "  "
  );

  const results = markdownTable([
    ["Task name", "ops/s", "GB/s"],
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
          ]
        : []
    ),
  ]);
  console.log();
  console.log(results);
  console.log();
}

async function main() {
  await runBenchmark("Count lines", gulliverTravels);
}

main();
