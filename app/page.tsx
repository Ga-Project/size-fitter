import Fitter from "./Fitter";

export default function Home() {
  return (
    <>
      <a href="#tool" className="skip-link">
        本文へスキップ
      </a>

      <header className="site-header">
        <div className="page">
          <a className="brand" href="/">
            <span className="brand-mark" aria-hidden="true">
              ⇄
            </span>
            <span>SizeFitter</span>
          </a>
          <a className="btn btn-ghost" href="#about">
            使い方
          </a>
        </div>
      </header>

      <main>
        {/* ===== hero ===== */}
        <section className="hero">
          <div className="page">
            <span className="eyebrow">US · EU · UK · JP サイズ換算</span>
            <h1>
              手持ちの一足から、
              <br />
              <span className="accent-text">世界基準</span>のサイズへ。
            </h1>
            <p className="hero-lead">
              いつもの靴・服のブランドとサイズ、または実寸（cm）を入れるだけ。
              海外主要ブランドの推奨サイズを、4 つの地域表記でなめらかに逆引きします。
            </p>

            <div className="hero-chips" aria-hidden="true">
              <span className="hero-chip">
                <span className="hero-chip-region">JP</span>
                <span className="hero-chip-value tabular">27.0</span>
              </span>
              <span className="hero-chip">
                <span className="hero-chip-region">US</span>
                <span className="hero-chip-value tabular">9</span>
              </span>
              <span className="hero-chip">
                <span className="hero-chip-region">EU</span>
                <span className="hero-chip-value tabular">42.5</span>
              </span>
              <span className="hero-chip">
                <span className="hero-chip-region">UK</span>
                <span className="hero-chip-value tabular">8.5</span>
              </span>
            </div>

            <div className="hero-trust">
              <span>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                完全ブラウザ内で完結
              </span>
              <span>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                登録不要・無料
              </span>
              <span>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                送信・トラッキングなし
              </span>
            </div>
          </div>
        </section>

        {/* ===== tool ===== */}
        <section className="page section" id="tool" style={{ paddingTop: 0 }}>
          <div className="tool">
            <Fitter />
          </div>
        </section>

        {/* ===== about ===== */}
        <section className="page about" id="about">
          <div className="tool">
            <span className="eyebrow">使い方</span>
            <h2>3 ステップで逆引き完了</h2>
            <div className="card-grid">
              <div className="card">
                <span className="step-num tabular" aria-hidden="true">
                  1
                </span>
                <h3>カテゴリを選ぶ</h3>
                <p>
                  靴（メンズ／レディース）やトップスなど、調べたいカテゴリを切り替えます。
                </p>
              </div>
              <div className="card">
                <span className="step-num tabular" aria-hidden="true">
                  2
                </span>
                <h3>実寸 or 手持ちを入力</h3>
                <p>
                  足長やバストの cm を入れるか、いま持っているブランドとサイズを選びます。
                </p>
              </div>
              <div className="card">
                <span className="step-num tabular" aria-hidden="true">
                  3
                </span>
                <h3>推奨サイズを一覧で</h3>
                <p>
                  各ブランドの推奨サイズと、大きめ・小さめのフィット傾向がそろって表示されます。
                </p>
              </div>
            </div>

            <h2>データについて</h2>
            <p className="hero-lead" style={{ maxWidth: "60ch" }}>
              標準換算は JIS / Mondopoint
              など一般的なサイズ対応を自社で構造化した目安値で、各ブランドの公式サイズチャートの画像等を転載したものではありません。
              フィット傾向は一般的に言われる傾向の参考情報です。実測・最終確認は各公式チャートで行ってください。
            </p>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="page">
          <p>
            入力内容はブラウザ内にのみ保存され、サーバーには送信されません。外部トラッキングは行っていません。
          </p>
          <p style={{ marginTop: "var(--sp-2)" }}>
            ブランド名は識別目的の事実記述で、各ブランドとの提携・公認関係はありません。
          </p>
        </div>
      </footer>
    </>
  );
}
