import Fitter from "./Fitter";

export default function Home() {
  return (
    <>
      <a href="#spread" className="skip-link">
        本文へスキップ
      </a>

      {/* ===== マストヘッド（誌面のロゴ帯・薄い罫線で仕切る） ===== */}
      <header className="masthead">
        <div className="lb">
          <a className="masthead-title" href="/">
            SIZE<span className="masthead-amp">·</span>FITTER
          </a>
          <p className="masthead-strap">
            US · EU · UK · JP — 国際サイズ対応表
          </p>
          <nav className="masthead-nav" aria-label="目次">
            <a href="#spread">採寸</a>
            <a href="#colophon">注記</a>
          </nav>
        </div>
      </header>

      <main>
        {/* ===== カバー（誌面表紙：左に大判タイトル、右にリード）===== */}
        <section className="cover">
          <div className="lb cover-inner">
            <div className="cover-lede">
              <span className="folio">No. 01 — Fitting Guide</span>
              <h1 className="cover-head">
                ひとつの足から、
                <span className="cover-head-em">世界中の表記</span>
                へ。
              </h1>
            </div>
            <div className="cover-deck">
              <p>
                手持ちの靴・服のブランドとサイズ、あるいは実寸（cm）を一つ。
                それだけで、海外主要ブランドの推奨サイズを四つの地域表記で逆引きします。
              </p>
              <ul className="cover-credits" aria-label="特徴">
                <li>ブラウザ内で完結</li>
                <li>登録不要・無料</li>
                <li>送信・追跡なし</li>
              </ul>
            </div>
          </div>
        </section>

        {/* ===== 採寸スプレッド（誌面の見開き：左=操作余白、右=比較プレート）===== */}
        <section id="spread" className="spread">
          <div className="lb">
            <Fitter />
          </div>
        </section>

        {/* ===== コロフォン（奥付：番号付きの段組みノート）===== */}
        <section id="colophon" className="colophon">
          <div className="lb">
            <p className="folio">Colophon — 使い方とデータ</p>
            <div className="colophon-cols">
              <article className="note">
                <span className="note-no" aria-hidden="true">
                  01
                </span>
                <h2>採寸の手順</h2>
                <p>
                  カテゴリを選び、実寸（cm）を入れるか、いま持っているブランドとサイズを指定します。
                  比較プレートに四地域の表記がそろい、各ブランドの推奨サイズが一覧で続きます。
                </p>
              </article>
              <article className="note">
                <span className="note-no" aria-hidden="true">
                  02
                </span>
                <h2>逆引きの読み方</h2>
                <p>
                  比較プレートの目盛りは基準寸法（足長・胸囲）の軸です。四地域の表記は同じ寸法を別の物差しで言い換えたもの。ブランド索引は印字系（US/EU/UK/JP）とフィット傾向の参考を併記します。
                </p>
              </article>
              <article className="note">
                <span className="note-no" aria-hidden="true">
                  03
                </span>
                <h2>データについて</h2>
                <p>
                  標準換算は JIS / Mondopoint
                  など一般的な対応を自社で構造化した目安値です。各ブランド公式チャートの転載ではありません。フィット傾向は一般に言われる参考情報で、最終確認は各公式チャートで行ってください。
                </p>
              </article>
            </div>
          </div>
        </section>
      </main>

      <footer className="lb-footer">
        <div className="lb">
          <p>
            入力内容はブラウザ内にのみ保存され、サーバーには送信されません。外部トラッキングは行っていません。
          </p>
          <p>
            ブランド名は識別目的の事実記述で、各ブランドとの提携・公認関係はありません。
          </p>
        </div>
      </footer>
    </>
  );
}
