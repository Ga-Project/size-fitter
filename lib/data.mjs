// size-fitter — curated sizing datasets（自前再構成・ブラウザ内で完結）
//
// 設計方針:
//   - 単一の真実 = 身体寸法(cm)。足長 or 胸囲/バストを基準に各表記へ写像する。
//   - 各カテゴリは「標準換算表(rows)」と「ブランド一覧(brands)」を持つ。
//     標準表は JIS/Mondopoint 等の一般的換算を自前で構造化した「目安」値。
//     ブランドは printed system(US/EU/UK/JP) と定性的フィット傾向(note)を持つ。
//   - 数値推奨は標準換算（検証可能な目安）に固定し、ブランド固有の曖昧な
//     オフセットは note（定性ガイド）で表現する。誤った精度を出さない。
//   - ブランド名は識別目的の事実記述。提携・公認関係を示すものではない。
//
// ⚠️ すべて「目安」。最終判断は各ブランドの公式サイズチャートで確認すること。

/**
 * @typedef {"jp"|"us"|"eu"|"uk"} Region
 * @typedef {Object} SizeRow
 * @property {number} cm   基準となる身体寸法(cm)。靴=足長 / トップス=胸囲・バスト。
 * @property {string} jp
 * @property {string} us
 * @property {string} eu
 * @property {string} uk
 * @typedef {Object} Brand
 * @property {string} id
 * @property {string} name
 * @property {Region} system  そのブランドが主に印字する表記系
 * @property {string} note    フィット傾向の定性ガイド（目安）
 * @typedef {Object} Category
 * @property {string} id
 * @property {string} label
 * @property {{key:string,label:string,unit:string,min:number,max:number,step:number,help:string}} metric
 * @property {SizeRow[]} rows  cm 昇順
 * @property {Brand[]} brands
 */

/** @type {Record<Region,string>} */
export const REGION_LABELS = { jp: "JP", us: "US", eu: "EU", uk: "UK" };

/** @type {Region[]} */
export const REGIONS = ["jp", "us", "eu", "uk"];

// --- 靴 メンズ（足長cm → US/EU/UK、JP=cm） --------------------------------
const shoesMenRows = [
  { cm: 24.0, jp: "24.0", us: "6", eu: "38.5", uk: "5.5" },
  { cm: 24.5, jp: "24.5", us: "6.5", eu: "39", uk: "6" },
  { cm: 25.0, jp: "25.0", us: "7", eu: "40", uk: "6.5" },
  { cm: 25.5, jp: "25.5", us: "7.5", eu: "40.5", uk: "7" },
  { cm: 26.0, jp: "26.0", us: "8", eu: "41", uk: "7.5" },
  { cm: 26.5, jp: "26.5", us: "8.5", eu: "42", uk: "8" },
  { cm: 27.0, jp: "27.0", us: "9", eu: "42.5", uk: "8.5" },
  { cm: 27.5, jp: "27.5", us: "9.5", eu: "43", uk: "9" },
  { cm: 28.0, jp: "28.0", us: "10", eu: "44", uk: "9.5" },
  { cm: 28.5, jp: "28.5", us: "10.5", eu: "44.5", uk: "10" },
  { cm: 29.0, jp: "29.0", us: "11", eu: "45", uk: "10.5" },
  { cm: 29.5, jp: "29.5", us: "11.5", eu: "45.5", uk: "11" },
  { cm: 30.0, jp: "30.0", us: "12", eu: "46", uk: "11.5" },
];

// --- 靴 レディース（足長cm → US/EU/UK、JP=cm） ----------------------------
const shoesWomenRows = [
  { cm: 22.0, jp: "22.0", us: "5", eu: "35.5", uk: "2.5" },
  { cm: 22.5, jp: "22.5", us: "5.5", eu: "36", uk: "3" },
  { cm: 23.0, jp: "23.0", us: "6", eu: "36.5", uk: "3.5" },
  { cm: 23.5, jp: "23.5", us: "6.5", eu: "37.5", uk: "4" },
  { cm: 24.0, jp: "24.0", us: "7", eu: "38", uk: "4.5" },
  { cm: 24.5, jp: "24.5", us: "7.5", eu: "38.5", uk: "5" },
  { cm: 25.0, jp: "25.0", us: "8", eu: "39", uk: "5.5" },
  { cm: 25.5, jp: "25.5", us: "8.5", eu: "40", uk: "6" },
  { cm: 26.0, jp: "26.0", us: "9", eu: "40.5", uk: "6.5" },
  { cm: 26.5, jp: "26.5", us: "9.5", eu: "41", uk: "7" },
  { cm: 27.0, jp: "27.0", us: "10", eu: "42", uk: "7.5" },
];

// --- トップス メンズ（胸囲cm → JP/US/EU/UK・alpha + EU numeric） -----------
// JPはUSアルファより概ね1段小さい（=海外ブランドは大きめ）という一般傾向を反映。
const topsMenRows = [
  { cm: 84, jp: "S", us: "XS", eu: "44", uk: "XS" },
  { cm: 88, jp: "M", us: "S", eu: "46", uk: "S" },
  { cm: 94, jp: "L", us: "M", eu: "48", uk: "M" },
  { cm: 100, jp: "LL", us: "L", eu: "50", uk: "L" },
  { cm: 106, jp: "3L", us: "XL", eu: "52", uk: "XL" },
  { cm: 112, jp: "4L", us: "XXL", eu: "54", uk: "XXL" },
];

// --- トップス レディース（バストcm → JP号/US/EU/UK・目安） -----------------
const topsWomenRows = [
  { cm: 78, jp: "S(7号)", us: "XS(0-2)", eu: "34", uk: "6" },
  { cm: 82, jp: "M(9号)", us: "S(4)", eu: "36", uk: "8" },
  { cm: 86, jp: "L(11号)", us: "M(6-8)", eu: "38", uk: "10" },
  { cm: 90, jp: "LL(13号)", us: "L(10)", eu: "40", uk: "12" },
  { cm: 95, jp: "3L(15号)", us: "XL(12-14)", eu: "42", uk: "14" },
];

/** @type {Category[]} */
export const CATEGORIES = [
  {
    id: "shoes-men",
    label: "靴（メンズ）",
    metric: {
      key: "footLengthCm",
      label: "足長",
      unit: "cm",
      min: 24,
      max: 30,
      step: 0.5,
      help: "かかとから一番長い指先までの実寸（左右で長い方）。",
    },
    rows: shoesMenRows,
    brands: [
      {
        id: "nike",
        name: "Nike",
        system: "us",
        note: "やや小さめ・細めという声が多い。心配ならハーフサイズ上も検討。",
      },
      {
        id: "adidas",
        name: "adidas",
        system: "us",
        note: "標準的。Stan Smith 等は大きめという声あり。",
      },
      {
        id: "new-balance",
        name: "New Balance",
        system: "us",
        note: "標準的。D ワイズ基準、幅広は 2E/4E を検討。",
      },
      {
        id: "converse",
        name: "Converse",
        system: "us",
        note: "大きめの傾向。All Star はハーフ〜1サイズ下げる人が多い。",
      },
      { id: "vans", name: "Vans", system: "us", note: "標準〜やや大きめ。" },
      {
        id: "asics",
        name: "ASICS",
        system: "us",
        note: "標準的。日本ブランドで cm 表記併記が多い。",
      },
      {
        id: "dr-martens",
        name: "Dr. Martens",
        system: "uk",
        note: "UK 表記。厚手ソックス前提でやや大きめ、ハーフ下げる人も。",
      },
      { id: "clarks", name: "Clarks", system: "uk", note: "UK 表記。標準的。" },
    ],
  },
  {
    id: "shoes-women",
    label: "靴（レディース）",
    metric: {
      key: "footLengthCm",
      label: "足長",
      unit: "cm",
      min: 22,
      max: 27,
      step: 0.5,
      help: "かかとから一番長い指先までの実寸（左右で長い方）。",
    },
    rows: shoesWomenRows,
    brands: [
      {
        id: "nike",
        name: "Nike",
        system: "us",
        note: "やや小さめ・細めという声が多い。心配ならハーフサイズ上も検討。",
      },
      { id: "adidas", name: "adidas", system: "us", note: "標準的。" },
      {
        id: "new-balance",
        name: "New Balance",
        system: "us",
        note: "標準的。幅広は B/D ワイズを確認。",
      },
      {
        id: "converse",
        name: "Converse",
        system: "us",
        note: "大きめの傾向。ハーフ下げる人が多い。",
      },
      { id: "vans", name: "Vans", system: "us", note: "標準〜やや大きめ。" },
      {
        id: "birkenstock",
        name: "Birkenstock",
        system: "eu",
        note: "EU 表記。Regular/Narrow 幅あり、大きめなので下げる人も。",
      },
      {
        id: "dr-martens",
        name: "Dr. Martens",
        system: "uk",
        note: "UK 表記。やや大きめ、ハーフ下げる人も。",
      },
      { id: "clarks", name: "Clarks", system: "uk", note: "UK 表記。標準的。" },
    ],
  },
  {
    id: "tops-men",
    label: "トップス（メンズ）",
    metric: {
      key: "chestCm",
      label: "胸囲",
      unit: "cm",
      // スライダー範囲は rows の cm レンジに揃える（範囲内なのに clamp 警告が出る不整合を防ぐ）。
      min: 84,
      max: 112,
      step: 1,
      help: "脇の下を通した胸の最も太い周囲（バスト）。",
    },
    rows: topsMenRows,
    brands: [
      {
        id: "uniqlo",
        name: "ユニクロ",
        system: "jp",
        note: "日本基準。海外ブランドより小さめ。",
      },
      {
        id: "gap",
        name: "GAP",
        system: "us",
        note: "米国基準。日本サイズより大きめ。",
      },
      {
        id: "nike",
        name: "Nike",
        system: "us",
        note: "US 基準。アスレチックフィットは細め。",
      },
      {
        id: "zara",
        name: "ZARA",
        system: "eu",
        note: "欧州基準。細身・小さめという声が多い。",
      },
      {
        id: "hm",
        name: "H&M",
        system: "eu",
        note: "欧州基準。やや小さめ・モデルによりばらつき。",
      },
    ],
  },
  {
    id: "tops-women",
    label: "トップス（レディース）",
    metric: {
      key: "bustCm",
      label: "バスト",
      unit: "cm",
      // スライダー範囲は rows の cm レンジに揃える（範囲内なのに clamp 警告が出る不整合を防ぐ）。
      min: 78,
      max: 95,
      step: 1,
      help: "胸の最も高い位置を通した水平の周囲。",
    },
    rows: topsWomenRows,
    brands: [
      {
        id: "uniqlo",
        name: "ユニクロ",
        system: "jp",
        note: "日本基準。号数表記が近い。",
      },
      {
        id: "gap",
        name: "GAP",
        system: "us",
        note: "米国基準。日本サイズより大きめ。",
      },
      {
        id: "zara",
        name: "ZARA",
        system: "eu",
        note: "欧州基準。細身・小さめという声が多い。",
      },
      { id: "hm", name: "H&M", system: "eu", note: "欧州基準。やや小さめ。" },
      { id: "nike", name: "Nike", system: "us", note: "US 基準。" },
    ],
  },
];

/** @param {string} id @returns {Category|undefined} */
export function getCategory(id) {
  return CATEGORIES.find((c) => c.id === id);
}
