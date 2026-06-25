// size-fitter — 逆引きエンジンのユニットテスト（node:test 標準ランナー）
// 実行: pnpm test (= node --test)
import { test } from "node:test";
import assert from "node:assert/strict";

import { CATEGORIES, REGIONS, getCategory } from "../lib/data.mjs";
import {
  nearestRow,
  recommendByMeasurement,
  cmFromBrandSize,
  recommendByBrandSize,
  brandSizeOptions,
} from "../lib/sizing.mjs";

test("実寸cmから標準表記を返す（メンズ靴 27.0cm = US9 / EU42.5 / UK8.5 / JP27.0）", () => {
  const r = recommendByMeasurement("shoes-men", 27.0);
  assert.ok(r);
  assert.equal(r.standard.us, "9");
  assert.equal(r.standard.eu, "42.5");
  assert.equal(r.standard.uk, "8.5");
  assert.equal(r.standard.jp, "27.0");
  assert.equal(r.exact, true);
  assert.equal(r.clamped, false);
});

test("ブランド逆引き: Nike(US)9 → adidas(US)9 / Dr.Martens(UK)8.5 / JP27.0", () => {
  const r = recommendByBrandSize("shoes-men", "nike", "9");
  assert.ok(r);
  assert.equal(r.inputCm, 27.0);
  const byId = Object.fromEntries(r.brands.map((b) => [b.id, b.label]));
  assert.equal(byId["adidas"], "9"); // US系
  assert.equal(byId["dr-martens"], "8.5"); // UK系は別ラベル
  assert.equal(r.standard.jp, "27.0");
});

test("逆引きで system 差が反映される（UK表記ブランドはUKラベル）", () => {
  const cm = cmFromBrandSize("shoes-men", "dr-martens", "8.5");
  assert.equal(cm, 27.0);
  const r = recommendByBrandSize("shoes-men", "dr-martens", "8.5");
  const nike = r.brands.find((b) => b.id === "nike");
  assert.equal(nike.label, "9"); // 同じ足長でNikeはUS9
});

test("範囲外の実寸は端にクランプされ clamped=true", () => {
  const big = recommendByMeasurement("shoes-men", 40);
  assert.equal(big.clamped, true);
  assert.equal(big.matchedCm, 30.0); // 最大行
  const small = recommendByMeasurement("shoes-men", 10);
  assert.equal(small.clamped, true);
  assert.equal(small.matchedCm, 24.0); // 最小行
});

test("最も近い行に丸める（26.2cm → 26.0cmの行）", () => {
  const row = nearestRow(getCategory("shoes-men"), 26.2);
  assert.equal(row.cm, 26.0);
});

test("不正な入力は null（未知カテゴリ・NaN・未知ブランド/ラベル）", () => {
  assert.equal(recommendByMeasurement("nope", 27), null);
  assert.equal(recommendByMeasurement("shoes-men", NaN), null);
  assert.equal(recommendByMeasurement("shoes-men", "27"), null);
  assert.equal(cmFromBrandSize("shoes-men", "ghost", "9"), null);
  assert.equal(cmFromBrandSize("shoes-men", "nike", "99"), null);
  assert.equal(recommendByBrandSize("shoes-men", "nike", "99"), null);
});

test("brandSizeOptions はそのブランドの system のラベル列を返す", () => {
  const us = brandSizeOptions("shoes-men", "nike");
  assert.ok(us.includes("9"));
  const uk = brandSizeOptions("shoes-men", "dr-martens");
  assert.ok(uk.includes("8.5"));
  assert.notDeepEqual(us, uk);
});

test("実寸cmから標準表記を返す（レディース靴 24.0cm = US7 / EU38 / UK4.5 / JP24.0）", () => {
  const r = recommendByMeasurement("shoes-women", 24.0);
  assert.ok(r);
  assert.equal(r.standard.us, "7");
  assert.equal(r.standard.eu, "38");
  assert.equal(r.standard.uk, "4.5");
  assert.equal(r.standard.jp, "24.0");
  assert.equal(r.exact, true);
});

test("トップス逆引きも機能する（ユニクロ JP は海外より小さめの傾向を内包）", () => {
  const r = recommendByBrandSize("tops-men", "uniqlo", "M");
  assert.ok(r);
  // JP M ≈ 胸囲88 → US S（海外は1段大きい表記）
  assert.equal(r.standard.us, "S");
  assert.equal(r.standard.jp, "M");
});

// --- データ整合性（全カテゴリ） -------------------------------------------
test("データ整合性: rows は cm 昇順・region ラベルは非空・brand.system は有効", () => {
  for (const cat of CATEGORIES) {
    assert.ok(cat.rows.length >= 3, `${cat.id}: rows少なすぎ`);
    for (let i = 1; i < cat.rows.length; i++) {
      assert.ok(cat.rows[i].cm > cat.rows[i - 1].cm, `${cat.id}: cm昇順違反`);
    }
    for (const row of cat.rows) {
      for (const reg of REGIONS) {
        assert.ok(
          typeof row[reg] === "string" && row[reg].length > 0,
          `${cat.id} cm=${row.cm}: ${reg} ラベル不正`,
        );
      }
    }
    assert.ok(cat.brands.length >= 1, `${cat.id}: brand無し`);
    for (const b of cat.brands) {
      assert.ok(REGIONS.includes(b.system), `${cat.id}/${b.id}: system不正`);
      assert.ok(b.note && b.note.length > 0, `${cat.id}/${b.id}: note空`);
    }
  }
});

test("データ整合性: metric の min/max が rows の cm レンジに一致（範囲内 clamp 警告の防止）", () => {
  for (const cat of CATEGORIES) {
    const lo = cat.rows[0].cm;
    const hi = cat.rows[cat.rows.length - 1].cm;
    assert.equal(
      cat.metric.min,
      lo,
      `${cat.id}: metric.min が rows 下端と不一致`,
    );
    assert.equal(
      cat.metric.max,
      hi,
      `${cat.id}: metric.max が rows 上端と不一致`,
    );
  }
});

test("データ整合性: 各カテゴリ各 region 内でラベルが一意（逆引きの曖昧さ防止）", () => {
  for (const cat of CATEGORIES) {
    for (const reg of REGIONS) {
      const labels = cat.rows.map((r) => String(r[reg]));
      assert.equal(
        new Set(labels).size,
        labels.length,
        `${cat.id}/${reg}: ラベル重複（逆引きが一意に定まらない）`,
      );
    }
  }
});
