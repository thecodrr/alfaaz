import { test, expect } from "vitest";
import { countLines } from "../src";

test("count lines separated by \\n", () => {
  expect(countLines("hello world I am here\nout there")).toBe(2);
});

test("count lines separated by \\r\\n", () => {
  expect(countLines("hello world I am here\r\nout there")).toBe(2);
});
