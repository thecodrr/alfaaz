<p align="center">
    <img src="assets/alfaaz.jpg" width="600px" style="border-radius: 25px;" />
</p>

<h1 align="center">Alfaaz</h1>

Alfaaz is the fastest multilingual word counter that can count millions of words per second (up to 0.9 GB/s 100x faster than RegExp based solutions). It has built-in support for CJK texts & words in many different languages such as Urdu & Arabic.

**Features:**

- The fastest (millions of words per second)
- Multilingual
- 100% tested TypeScript code
- 0 dependencies
- Lightweight (< 1KB)

## Installation

`alfaaz` can be installed using your favorite package manager:

```bash
# npm:
npm i alfaaz

# yarn:
yarn add alfaaz

# pnpm:
pnpm i alfaaz

# bun:
bun install alfaaz
```

## Usage

`alfaaz` exposes only 2 functions:

### 1. `countWords(text: string) => number`

This function takes a `string` as input and returns the total number of words in the text.

### 2. `countLines(text: string) => number`

This function takes a `string` as input and returns the total number of lines in the text.

### Example

```ts
import { countWords, countLines } from "alfaaz";

const text = "my example text.";

const totalWords = countWords(text);
const totalLines = countLines(text);
```

## Benchmarks

You can run these benchmarks yourself:

```
npm run bench
```

**Count lines:**

Total lines: 9923  
File size (bytes): 613838  
File length (chars): 611767

| Task name | ops/s              | GB/s               |
| --------- | ------------------ | ------------------ |
| alfaaz    | 3514.632761145021  | 2.0094593707472086 |
| split     | 1737.3269435409347 | 0.9930102210491896 |
| regex     | 2325.0174924363723 | 1.3291587587445974 |

**Count words (no CJK, only English)::**

Total words: 111013  
File size (bytes): 613838  
File length (chars): 611767

| Task name | ops/s              | GB/s                 | Words/s      |
| --------- | ------------------ | -------------------- | ------------ |
| alfaaz    | 389.92325817817687 | 0.22295566275715828  | 43.2 million |
| regex     | 85.92392297420068  | 0.049164582043886185 | 9.53 million |

**Count words (CJK + English)::**

Total words: 180318  
File size (bytes): 647964  
File length (chars): 223368

| Task name | ops/s              | GB/s                | Words/s       |
| --------- | ------------------ | ------------------- | ------------- |
| alfaaz    | 1164.1081011893878 | 0.7024315148591995  | 209.9 million |
| regex     | 78.97780608550106  | 0.04767361655831337 | 14.24 million |

**Machine specs:**

```
Processor: Intel(R) Core(TM) i7-10610U CPU @ 1.80GHz (8 CPUs), ~2.3GHz
Memory: 24576MB RAM
SSD: SAMSUNG MZVLW256HEHP-000L7
Node: v18.15.0
```

## Use case

`alfaaz` was born out of need. I needed to count words (and fast!) in Notesnook as the user types in the editor. Traditional `RegExp` based solutions became noticeably slower after 10K words.

Counting words is not an uncommon need. Having a fast word counter can greatly increase your productivity. Ultimately the goal is to make all software operate with you having to wait for it.

At its current speed, `alfaaz` can handle millions of words per second.

## What's the secret sauce?

> **TLDR;** Bitmaps.

In all honesty, the approach I have used is one of the slowest (if not _the_ slowest ones). Word counting is a problem best solved by using SIMD because going through the text 1 character at a time is going to be ultra slow no matter what magic you do.

However, since we do not have SIMD in JavaScript (or a way to coerce the JIT into doing SIMD for us), I had to resort to doing as little work as possible inside the loop.

A simple word counter can be implemented in 5 lines by just incrementing a counter when you come across a space. It'd look something like this:

```ts
const text = "hello world";
let count = 0;
for (let i = 0; i < text.length; ++i) {
  count += text[i] === " ";
}
```

The above code operates at only 0.494 GB/s. Not as big a difference from `alfaaz` as you might expect considering how much simpler the solution is.

The problem is, the requirements for a word counter are not simple:

1. Consecutive word separators must be considered as 1 word (e.g. `hello    world` is 2 words)
2. Must be able to count CJK words (in CJK we count each character as 1 word since there are no spaces between words).
3. Must be able to use multiple characters as word separators (e.g. space, newline, asterick are all word separators).
4. Must not take too much memory

Solving all these problems means sacrificing on a lot of performance because you will have to do more work. More work = less speed.

The best solution I could come up with (and there might certainly be better solutions) is to use a Bitmap where each bit's index represents a Unicode codepoint & the value of the bit represents whether it is a separator or not. A first implementation might look like this:

```ts
const bitmap = { 32: 1 }; // codepoint for space is 32

const text = "hello world";
let count = 0;
for (let i = 0; i < text.length; ++i) {
  count += bitmap[text.codePointAt(i)];
}
```

This brings us down to 0.194 GB/s. Using a Bitmap allows us to support an arbitrary number of word separators. Sounds nice but using an `Object` for this takes up way too much memory especially for thousands upon thousands of codepoints for detecting CJK characters.

A better solution would be to use a `Uint8Array` but instead of using up 1 byte per codepoint, we can use 1 bit reducing our memory footprint by 8x. In code, it'd look like this:

```ts
const BYTE_SIZE = 8; // a byte is 8 bits
const LENGTH = 32 / BYTE_SIZE;
const bitmap = new Uint8Array(LENGTH);

const charCode = 32;
const byteIndex = Math.floor(charCode / BYTE_SIZE);
const bitIndex = charCode % BYTE_SIZE;
bitmap[byteIndex] = bitmap[byteIndex] ^ (1 << bitIndex);
```

We fill up the Bitmap once on program startup and then use it for all our word counting needs:

```ts
const text = "hello world";
let count = 0;
for (let i = 0; i < text.length; ++i) {
  const charCode = text.charCodeAt(i);
  const byteIndex = Math.floor(charCode / BYTE_SIZE);
  const bitIndex = charCode % BYTE_SIZE;

  count += (BITMAP[byteIndex] >> bitIndex) & 1;
}
```

This allows us to greatly reduce the memory footprint (from 32 bytes to 4 bytes) and we also see a solid jump in performance: from 0.194 GB/s to 0.221 GB/s.

In conclusion, the secret sauce here is using Bitmaps.

### Why not use `Uint16Array` or `Uint32Array`?

There's no difference in speed or memory between these different `TypedArrays`.

### Why is `RegExp` so slow?

First because `RegExp` runs in its own VM (which has an overhead) and second, because it needs to support all sorts of stuff like group matching, greedy matching etc.

In most cases, you'll find a handwritten solution much faster than `RegExp` (always do benchmarking to make sure!).

In a few words, `RegExp` does more work to accomplish the same goals.

### What about SIMD?

I am no expert in SIMD but I did find [fastlwc](https://github.com/expr-fi/fastlwc) which uses SIMD to get mind boggling speeds. However, it is very simple and only considers spaces as words. I am not sure if it is even possible or feasible to support multiple word separators while using SIMD.

### Can this be made faster by using WebAssembly?

I haven't done any benchmarking but sending the text to WebAssembly runtime again and again must have a significant overhead. Someone should write up a solution to see how it fares though.

### What about parallelization?

I don't think the workload is well-suited for parallelization. For one, even the slowest solution is way faster than spinning up a worker. Secondly, transferring data to a worker would take longer than the actual processing.

I may be wrong so do your own testing.
