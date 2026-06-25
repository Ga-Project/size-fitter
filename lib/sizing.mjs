// size-fitter — 逆引きエンジン（純関数・ブラウザ内で完結）
//
// 入力（実寸cm or 手持ちブランド+サイズ）→ 基準寸法(cm)を確定 → 標準表記
// (US/EU/UK/JP) と各ブランドの推奨サイズ・フィット傾向を返す。
// すべて副作用なしの純関数。node:test でそのまま検証できる。

import { getCategory } from "./data.mjs";

/**
 * @typedef {import("./data.mjs").Category} Category
 * @typedef {Object} Recommendation
 * @property {number} inputCm     入力された/逆算された基準寸法(cm)
 * @property {number} matchedCm   最も近い標準表の行のcm
 * @property {boolean} exact      入力cmが標準表の行と一致したか
 * @property {boolean} clamped    入力cmが対応範囲外で端にクランプされたか
 * @property {{jp:string,us:string,eu:string,uk:string}} standard
 * @property {Array<{id:string,name:string,system:import("./data.mjs").Region,note:string,label:string}>} brands
 */

/**
 * 標準表から cm に最も近い行を返す。範囲外は端にクランプ。
 * @param {Category} cat
 * @param {number} cm
 */
export function nearestRow(cat, cm) {
  let best = cat.rows[0];
  let bestDiff = Infinity;
  for (const row of cat.rows) {
    const diff = Math.abs(row.cm - cm);
    if (diff < bestDiff) {
      best = row;
      bestDiff = diff;
    }
  }
  return best;
}

/**
 * 実寸(cm)から推奨サイズ一式を算出。
 * @param {string} categoryId
 * @param {number} cm
 * @returns {Recommendation|null}
 */
export function recommendByMeasurement(categoryId, cm) {
  const cat = getCategory(categoryId);
  if (!cat) return null;
  if (typeof cm !== "number" || !Number.isFinite(cm)) return null;

  const min = cat.rows[0].cm;
  const max = cat.rows[cat.rows.length - 1].cm;
  const clamped = cm < min || cm > max;
  const row = nearestRow(cat, cm);

  return {
    inputCm: cm,
    matchedCm: row.cm,
    exact: Math.abs(row.cm - cm) < 1e-9,
    clamped,
    standard: { jp: row.jp, us: row.us, eu: row.eu, uk: row.uk },
    brands: cat.brands.map((b) => ({
      id: b.id,
      name: b.name,
      system: b.system,
      note: b.note,
      label: String(row[b.system]),
    })),
  };
}

/**
 * 手持ちブランド+印字サイズから、基準寸法(cm)を逆算する。
 * @param {string} categoryId
 * @param {string} brandId
 * @param {string} label
 * @returns {number|null}
 */
export function cmFromBrandSize(categoryId, brandId, label) {
  const cat = getCategory(categoryId);
  if (!cat) return null;
  const brand = cat.brands.find((b) => b.id === brandId);
  if (!brand) return null;
  const row = cat.rows.find((r) => String(r[brand.system]) === String(label));
  return row ? row.cm : null;
}

/**
 * 手持ちブランド+サイズから推奨サイズ一式を算出（逆引き）。
 * @param {string} categoryId
 * @param {string} brandId
 * @param {string} label
 * @returns {Recommendation|null}
 */
export function recommendByBrandSize(categoryId, brandId, label) {
  const cm = cmFromBrandSize(categoryId, brandId, label);
  if (cm == null) return null;
  return recommendByMeasurement(categoryId, cm);
}

/**
 * あるブランドが選べる印字サイズの一覧（UIのプルダウン用）。
 * @param {string} categoryId
 * @param {string} brandId
 * @returns {string[]}
 */
export function brandSizeOptions(categoryId, brandId) {
  const cat = getCategory(categoryId);
  if (!cat) return [];
  const brand = cat.brands.find((b) => b.id === brandId);
  if (!brand) return [];
  return cat.rows.map((r) => String(r[brand.system]));
}
