const CHINESE_MAX_CODE_POINT = 205743;
const CHINESE_MIN_CODE_POINT = 11904;
const BYTE_SIZE = 8;

// CHAR_MAP is used to determine whether a codepoint is a word boundary
// or not. Instead of taking 1 byte per codepoint, we divide each byte
// into 8 indices which reduces the memory footprint from 205.7 KB
// to 25.7 KB.
// The extra 1 byte at the end is required to insert the codepoint at the
// last index.
const BITMAP = new Uint8Array(CHINESE_MAX_CODE_POINT / BYTE_SIZE + 1);

function insertCharsIntoMap(...chars: string[]) {
  for (const char of chars) {
    const charCode = char.charCodeAt(0);
    const byteIndex = Math.floor(charCode / BYTE_SIZE);
    const bitIndex = charCode % BYTE_SIZE;
    BITMAP[byteIndex] = BITMAP[byteIndex] ^ (1 << bitIndex);
  }
}

function insertRangeIntoMap(from: number, to: number) {
  for (let i = from / BYTE_SIZE; i < Math.ceil(to / BYTE_SIZE); i++) {
    BITMAP[i] = 0b11111111;
  }
}

const NEWLINE = "\n";
insertCharsIntoMap(
  " ",
  "\n",
  "\t",
  "\v",
  "*",
  "/",
  "&",
  ":",
  ";",
  ".",
  ",",
  "?",
  "="
);

// CJK Unified Ideographs                     4E00-9FFF   Common
insertRangeIntoMap(19968, 40959);
// CJK Unified Ideographs Extension A         3400-4DBF   Rare
insertRangeIntoMap(13312, 19903);
// CJK Unified Ideographs Extension B       20000-2A6DF Rare, historic
insertRangeIntoMap(131072, 173791);
// CJK Unified Ideographs Extension C       2A700–2B73F Rare, historic
insertRangeIntoMap(173824, 177983);
// CJK Unified Ideographs Extension D       2B740–2B81F Uncommon, some in current use
insertRangeIntoMap(177984, 178207);
// CJK Unified Ideographs Extension E       2B820–2CEAF Rare, historic
insertRangeIntoMap(178208, 183983);
// CJK Unified Ideographs Extension F       2CEB0–2EBEF  Rare, historic
insertRangeIntoMap(183984, 191471);
// CJK Unified Ideographs Extension G       30000–3134F  Rare, historic
insertRangeIntoMap(196608, 201551);
// CJK Unified Ideographs Extension H       31350–323AF Rare, historic
insertRangeIntoMap(201552, 205743);
// CJK Compatibility Ideographs               F900-FAFF   Duplicates, unifiable variants, corporate characters
insertRangeIntoMap(63744, 64255);
// CJK Compatibility Ideographs Supplement  2F800-2FA1F Unifiable variants
insertRangeIntoMap(194560, 195103);
// CJK Radicals / Kangxi Radicals             2F00–2FDF
insertRangeIntoMap(12032, 12255);
// CJK Radicals Supplement                    2E80–2EFF
insertRangeIntoMap(11904, 12031);
// CJK Symbols and Punctuation                3000–303F
insertRangeIntoMap(12288, 12351);
// CJK Compatibility                          3300-33FF
insertRangeIntoMap(13056, 13311);
// CJK Compatibility Forms                     FE30-FE4F
insertRangeIntoMap(65072, 65103);

export function countWords(str: string) {
  let count = 0;
  let shouldCount = false;

  for (let i = 0; i < str.length; i++) {
    const charCode = str.charCodeAt(i);
    const byteIndex = Math.floor(charCode / BYTE_SIZE);
    const bitIndex = charCode % BYTE_SIZE;

    const isMatch = (BITMAP[byteIndex] >> bitIndex) & 1;

    // @ts-ignore allow JS to naturally coerce boolean into a number
    count += isMatch && (shouldCount || charCode > CHINESE_MIN_CODE_POINT);
    shouldCount = !isMatch;
  }

  // @ts-ignore allow JS to naturally coerce boolean into a number
  count += shouldCount;

  return count;
}

export function countLines(str: string) {
  let count = 0;
  for (
    let i = -1;
    (i = str.indexOf(NEWLINE, ++i)) !== -1 && i < str.length;
    count++
  );
  count++;
  return count;
}
