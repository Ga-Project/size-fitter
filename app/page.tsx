import Fitter from "./Fitter";

export default function Home() {
  return (
    <main className="wrap">
      <header className="hero">
        <h1>海外サイズ逆引きフィッター</h1>
        <p className="lede">
          手持ちの靴・服の<strong>ブランド＋サイズ</strong>、または
          <strong>実寸（cm）</strong>から、 主要ブランドの推奨サイズを US / EU /
          UK / JP で逆引きします。 完全ブラウザ内・登録不要・無料。
        </p>
      </header>

      <Fitter />

      <section className="about">
        <h2>使い方</h2>
        <ol>
          <li>カテゴリ（靴／トップス・メンズ／レディース）を選びます。</li>
          <li>
            「実寸から」では足長やバストの cm
            を、「手持ちブランドから」では持っている
            ブランドとサイズを選びます。
          </li>
          <li>各ブランドの推奨サイズとフィット傾向が一覧で表示されます。</li>
        </ol>
        <h2>データについて</h2>
        <p>
          標準換算は JIS / Mondopoint
          など一般的なサイズ対応を自社で構造化した目安値で、
          各ブランドの公式サイズチャートの画像等を転載したものではありません。
          フィット傾向は一般的に言われる傾向の参考情報です。実測・最終確認は各公式チャートで
          行ってください。
        </p>
      </section>

      <footer className="foot">
        <p>
          入力内容はブラウザ内にのみ保存され、サーバーには送信されません。
          外部トラッキングは行っていません。
        </p>
      </footer>
    </main>
  );
}
