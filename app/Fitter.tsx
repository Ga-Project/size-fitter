"use client";

import { useEffect, useMemo, useState } from "react";
import { CATEGORIES, REGION_LABELS, getCategory } from "../lib/data.mjs";
import {
  recommendByMeasurement,
  recommendByBrandSize,
  brandSizeOptions,
} from "../lib/sizing.mjs";

type Mode = "measure" | "brand";

const STORAGE_KEY = "size-fitter:v1";

function loadSaved(): { categoryId?: string; mode?: Mode } {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export default function Fitter() {
  const [categoryId, setCategoryId] = useState<string>("shoes-men");
  const [mode, setMode] = useState<Mode>("measure");
  const [cmInput, setCmInput] = useState<string>("");
  // 既定カテゴリ(shoes-men)の先頭ブランド・中央サイズで初期化し、初期描画/モード
  // 切替時の空フラッシュを避ける。カテゴリ変更時は下の effect が値を整える。
  const [brandId, setBrandId] = useState<string>("nike");
  const [sizeLabel, setSizeLabel] = useState<string>("9");
  const [hydrated, setHydrated] = useState(false);

  const cat = useMemo(() => getCategory(categoryId), [categoryId]);

  // 復元（localStorage のみ・個人情報なし）
  useEffect(() => {
    const saved = loadSaved();
    if (saved.categoryId && getCategory(saved.categoryId))
      setCategoryId(saved.categoryId);
    if (saved.mode === "brand" || saved.mode === "measure") setMode(saved.mode);
    setHydrated(true);
  }, []);

  // カテゴリ変更時にブランド/サイズの既定値を整える
  useEffect(() => {
    if (!cat) return;
    setBrandId((prev) =>
      cat.brands.some((b) => b.id === prev) ? prev : (cat.brands[0]?.id ?? ""),
    );
  }, [cat]);

  // ブランドに合わせてサイズ候補を整える
  const sizeOptions = useMemo(
    () => (brandId ? brandSizeOptions(categoryId, brandId) : []),
    [categoryId, brandId],
  );
  useEffect(() => {
    if (sizeOptions.length === 0) return;
    setSizeLabel((prev) =>
      sizeOptions.includes(prev)
        ? prev
        : (sizeOptions[Math.floor(sizeOptions.length / 2)] ?? prev),
    );
  }, [sizeOptions]);

  // 永続化
  useEffect(() => {
    if (!hydrated || typeof window === "undefined") return;
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ categoryId, mode }),
      );
    } catch {
      /* localStorage 不可環境では何もしない */
    }
  }, [hydrated, categoryId, mode]);

  const result = useMemo(() => {
    if (mode === "measure") {
      const cm = parseFloat(cmInput);
      if (!Number.isFinite(cm)) return null;
      return recommendByMeasurement(categoryId, cm);
    }
    // カテゴリ変更直後に旧カテゴリの brandId が残っていても誤結果を出さない
    // ガード（effect が値を整えるまで一過性に null）。
    if (!cat || !cat.brands.some((b) => b.id === brandId)) return null;
    if (!sizeLabel) return null;
    return recommendByBrandSize(categoryId, brandId, sizeLabel);
  }, [mode, cmInput, categoryId, brandId, sizeLabel, cat]);

  if (!cat) return null;
  const metric = cat.metric;

  // 比較プレートの目盛り位置（基準寸法の最小〜最大を 0〜100% に写像）。
  // matchedCm の位置にアンカーを立て、誌面の「サイズ・スケール」を描く。
  const lo = cat.rows[0]?.cm ?? metric.min;
  const hi = cat.rows[cat.rows.length - 1]?.cm ?? metric.max;
  const span = hi - lo || 1;
  const pct = (cm: number) => ((cm - lo) / span) * 100;
  const anchorPct = result ? Math.max(0, Math.min(100, pct(result.matchedCm))) : null;

  return (
    <div className="fit">
      {/* ===== 左：操作の余白（誌面サイドバー：縦罫で本体と仕切る） ===== */}
      <aside className="fit-margin" aria-label="採寸の指定">
        <p className="fit-margin-folio">採寸条件</p>

        {/* カテゴリ：縦並びの目次風リスト */}
        <fieldset className="picklist">
          <legend>カテゴリ</legend>
          <div role="tablist" aria-label="カテゴリ" className="picklist-items">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                type="button"
                role="tab"
                aria-selected={c.id === categoryId}
                className={"pick" + (c.id === categoryId ? " is-active" : "")}
                onClick={() => setCategoryId(c.id)}
              >
                <span className="pick-rule" aria-hidden="true" />
                <span className="pick-label">{c.label}</span>
              </button>
            ))}
          </div>
        </fieldset>

        {/* モード切替 */}
        <fieldset className="picklist">
          <legend>入力方法</legend>
          <div className="mode-switch" role="group" aria-label="入力方法">
            <button
              type="button"
              aria-pressed={mode === "measure"}
              className={"mode-btn" + (mode === "measure" ? " is-active" : "")}
              onClick={() => setMode("measure")}
            >
              実寸（{metric.label}）
            </button>
            <button
              type="button"
              aria-pressed={mode === "brand"}
              className={"mode-btn" + (mode === "brand" ? " is-active" : "")}
              onClick={() => setMode("brand")}
            >
              手持ちブランド
            </button>
          </div>
        </fieldset>

        {/* 入力本体 */}
        {mode === "measure" ? (
          <div className="entry">
            <label className="entry-label" htmlFor="cm">
              {metric.label}（{metric.unit}）
            </label>
            <div className="entry-num">
              <input
                id="cm"
                type="number"
                inputMode="decimal"
                className="cm-input"
                placeholder="00.0"
                min={metric.min}
                max={metric.max}
                step={metric.step}
                value={cmInput}
                onChange={(e) => setCmInput(e.target.value)}
              />
              <span className="entry-unit" aria-hidden="true">
                {metric.unit}
              </span>
            </div>
            <input
              type="range"
              className="cm-range"
              aria-label={`${metric.label}スライダー`}
              min={metric.min}
              max={metric.max}
              step={metric.step}
              value={Math.max(
                metric.min,
                Math.min(
                  metric.max,
                  Number.isFinite(parseFloat(cmInput))
                    ? parseFloat(cmInput)
                    : metric.min,
                ),
              )}
              onChange={(e) => setCmInput(e.target.value)}
            />
            <p className="entry-help">{metric.help}</p>
          </div>
        ) : (
          <div className="entry">
            <label className="entry-label" htmlFor="brand">
              ブランド
            </label>
            <select
              id="brand"
              className="select"
              value={brandId}
              onChange={(e) => setBrandId(e.target.value)}
            >
              {cat.brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}（{REGION_LABELS[b.system]}）
                </option>
              ))}
            </select>
            <label
              className="entry-label"
              htmlFor="size"
              style={{ marginTop: "var(--sp-4)" }}
            >
              手持ちのサイズ
            </label>
            <select
              id="size"
              className="select"
              value={sizeLabel}
              onChange={(e) => setSizeLabel(e.target.value)}
            >
              {sizeOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        )}
      </aside>

      {/* ===== 右：比較プレート（誌面の主役・サイズの見開き） ===== */}
      <div className="plate" aria-live="polite">
        {result ? (
          <>
            {result.clamped && (
              <p className="plate-warn">
                対応範囲（{metric.min}〜{metric.max}
                {metric.unit}）の外です。最も近いサイズを目安として表示しています。
              </p>
            )}

            {/* 比較スケール：基準寸法の物差しに沿って matchedCm を立てる */}
            <div className="scale">
              <div className="scale-head">
                <span className="scale-cap">サイズ・スケール</span>
                <span className="scale-anchor tabular">
                  {result.matchedCm}
                  {metric.unit}
                </span>
              </div>
              <div
                className="scale-track"
                role="img"
                aria-label={`基準${metric.label}は約${result.matchedCm}${metric.unit}。範囲${metric.min}から${metric.max}${metric.unit}。`}
              >
                <div className="scale-line" aria-hidden="true" />
                {cat.rows.map((r) => (
                  <span
                    key={r.cm}
                    className="scale-tick"
                    style={{ left: `${pct(r.cm)}%` }}
                    aria-hidden="true"
                  />
                ))}
                {anchorPct != null && (
                  <span
                    className="scale-pin"
                    style={{ left: `${anchorPct}%` }}
                    aria-hidden="true"
                  >
                    <span className="scale-pin-dot" />
                  </span>
                )}
              </div>
              <div className="scale-ends" aria-hidden="true">
                <span className="tabular">
                  {lo}
                  {metric.unit}
                </span>
                <span className="tabular">
                  {hi}
                  {metric.unit}
                </span>
              </div>
            </div>

            {/* 四地域の表記を見開きの大判で並べる（誌面プレート） */}
            <dl className="regions">
              {(["jp", "us", "eu", "uk"] as const).map((reg) => (
                <div className="region" key={reg}>
                  <dt className="region-tag">{REGION_LABELS[reg]}</dt>
                  <dd className="region-val">{result.standard[reg]}</dd>
                </div>
              ))}
            </dl>

            {/* ブランド逆引きを誌面の「索引」として段組みリストで */}
            <div className="index">
              <p className="index-cap">ブランド別 推奨サイズ — Index</p>
              <ul className="index-list">
                {result.brands.map((b) => (
                  <li className="index-row" key={b.id}>
                    <span className="index-name">{b.name}</span>
                    <span className="index-dots" aria-hidden="true" />
                    <span className="index-size tabular">
                      {b.label}
                      <span className="index-sys">{REGION_LABELS[b.system]}</span>
                    </span>
                    <span className="index-note">{b.note}</span>
                  </li>
                ))}
              </ul>
            </div>
          </>
        ) : (
          <div className="plate-empty">
            <span className="plate-empty-rule" aria-hidden="true" />
            <p>
              {mode === "measure"
                ? `${metric.label}を入力すると、基準寸法に合わせた四地域の表記とブランド別の推奨サイズが、ここに見開きで広がります。`
                : "手持ちのブランドとサイズを指定すると、同じ寸法を四地域の表記とほかのブランドへ逆引きします。"}
            </p>
          </div>
        )}

        <div className="plate-foot">
          <p>
            ※ サイズはあくまで<strong>目安</strong>
            です。同じブランドでもモデルにより異なります。最終的に各ブランドの
            <strong>公式サイズチャート</strong>を必ずご確認ください。
          </p>
          <p>
            ※ 本サイトは各ブランドと<strong>提携・公認関係はありません</strong>。
            ブランド名は識別目的の事実記述です。
          </p>
        </div>
      </div>
    </div>
  );
}
