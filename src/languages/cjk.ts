import { UnicodeRange } from "../types";

export const CJK_UNICODE_RANGES: UnicodeRange = [
  [19968, 40959], // CJK Unified Ideographs                     4E00-9FFF   Common
  [13312, 19903], // CJK Unified Ideographs Extension A         3400-4DBF   Rare
  [131072, 173791], // CJK Unified Ideographs Extension B       20000-2A6DF Rare, historic
  [173824, 177983], // CJK Unified Ideographs Extension C       2A700–2B73F Rare, historic
  [177984, 178207], // CJK Unified Ideographs Extension D       2B740–2B81F Uncommon, some in current use
  [178208, 183983], // CJK Unified Ideographs Extension E       2B820–2CEAF Rare, historic
  [183984, 191471], // CJK Unified Ideographs Extension F       2CEB0–2EBEF  Rare, historic
  [196608, 201551], // CJK Unified Ideographs Extension G       30000–3134F  Rare, historic
  [201552, 205743], // CJK Unified Ideographs Extension H       31350–323AF Rare, historic
  [63744, 64255], // CJK Compatibility Ideographs               F900-FAFF   Duplicates, unifiable variants, corporate characters
  [194560, 195103], // CJK Compatibility Ideographs Supplement  2F800-2FA1F Unifiable variants
  [12032, 12255], // CJK Radicals / Kangxi Radicals             2F00–2FDF
  [11904, 12031], // CJK Radicals Supplement                    2E80–2EFF
  [12288, 12351], // CJK Symbols and Punctuation                3000–303F
  [13056, 13311], // CJK Compatibility                          3300-33FF
  [65072, 65103], // CJK Compatibility Forms                     FE30-FE4F
];
