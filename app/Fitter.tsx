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

  return (
    <div className="card">
      {/* カテゴリ */}
      <div className="field">
        <label className="field-label">カテゴリ</label>
        <div className="seg" role="tablist" aria-label="カテゴリ">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              type="button"
              role="tab"
              aria-selected={c.id === categoryId}
              className={"seg-btn" + (c.id === categoryId ? " is-active" : "")}
              onClick={() => setCategoryId(c.id)}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* モード */}
      <div className="field">
        <label className="field-label">入力方法</label>
        <div className="seg seg-2">
          <button
            type="button"
            className={"seg-btn" + (mode === "measure" ? " is-active" : "")}
            onClick={() => setMode("measure")}
          >
            実寸（{metric.label}）から
          </button>
          <button
            type="button"
            className={"seg-btn" + (mode === "brand" ? " is-active" : "")}
            onClick={() => setMode("brand")}
          >
            手持ちブランドから
          </button>
        </div>
      </div>

      {/* 入力本体 */}
      {mode === "measure" ? (
        <div className="field">
          <label className="field-label" htmlFor="cm">
            {metric.label}（{metric.unit}）
          </label>
          <div className="cm-row">
            <input
              id="cm"
              type="number"
              inputMode="decimal"
              className="cm-input"
              placeholder={`${metric.label}を入力`}
              min={metric.min}
              max={metric.max}
              step={metric.step}
              value={cmInput}
              onChange={(e) => setCmInput(e.target.value)}
            />
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
          </div>
          <p className="help">{metric.help}</p>
        </div>
      ) : (
        <div className="field grid-2">
          <div>
            <label className="field-label" htmlFor="brand">
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
          </div>
          <div>
            <label className="field-label" htmlFor="size">
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
        </div>
      )}

      {/* 結果 */}
      {result ? (
        <div className="result">
          {result.clamped && (
            <p className="warn">
              対応範囲（{metric.min}〜{metric.max}
              {metric.unit}
              ）の外です。最も近いサイズを目安として表示しています。
            </p>
          )}
          <div className="std">
            <span className="std-cap">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="m21 16-4 4-4-4" />
                <path d="M17 20V4" />
                <path d="m3 8 4-4 4 4" />
                <path d="M7 4v16" />
              </svg>
              標準サイズ表記（目安）
            </span>
            <div className="std-grid">
              {(["jp", "us", "eu", "uk"] as const).map((reg) => (
                <div className="std-cell" key={reg}>
                  <span className="std-region">{REGION_LABELS[reg]}</span>
                  <span className="std-value">{result.standard[reg]}</span>
                </div>
              ))}
            </div>
            <span className="std-cm">
              基準 {metric.label}: 約{" "}
              <strong>
                {result.matchedCm}
                {metric.unit}
              </strong>
            </span>
          </div>

          <p className="brands-cap">ブランド別の推奨サイズ</p>
          <table className="brands">
            <thead>
              <tr>
                <th>ブランド</th>
                <th>推奨サイズ</th>
                <th>フィット傾向（目安）</th>
              </tr>
            </thead>
            <tbody>
              {result.brands.map((b) => (
                <tr key={b.id}>
                  <td className="b-name">{b.name}</td>
                  <td className="b-size">
                    {b.label}
                    <span className="b-sys">{REGION_LABELS[b.system]}</span>
                  </td>
                  <td className="b-note">{b.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty">
          <span className="empty-icon" aria-hidden="true">
            <svg
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21.3 8.7 8.7 21.3a1 1 0 0 1-1.4 0l-4.6-4.6a1 1 0 0 1 0-1.4L15.3 2.7a1 1 0 0 1 1.4 0l4.6 4.6a1 1 0 0 1 0 1.4Z" />
              <path d="m7.5 10.5 2 2" />
              <path d="m10.5 7.5 2 2" />
              <path d="m13.5 4.5 2 2" />
              <path d="m4.5 13.5 2 2" />
            </svg>
          </span>
          <p>
            {mode === "measure"
              ? `${metric.label}を入力すると、各ブランドの推奨サイズが一覧で表示されます。`
              : "手持ちのブランドとサイズを選ぶと、他ブランドの推奨サイズに逆引きします。"}
          </p>
        </div>
      )}

      <div className="disclaimer">
        <p>
          ※ サイズはあくまで<strong>目安</strong>
          です。同じブランドでもモデルにより異なります。 最終的に各ブランドの
          <strong>公式サイズチャート</strong>を必ずご確認ください。
        </p>
        <p>
          ※ 本サイトは各ブランドと<strong>提携・公認関係はありません</strong>。
          ブランド名は識別目的の事実記述です。
        </p>
      </div>
    </div>
  );
}
