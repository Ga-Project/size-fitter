# size-fitter — 海外サイズ逆引きフィッター

手持ちの靴・服の「ブランド＋サイズ」または実寸(cm)から、主要ブランドの推奨サイズを
US / EU / UK / JP で逆引きする、完全クライアントサイドの静的 Web ツール。

Next.js 14 (App Router) で構築した web プロダクト。
static export（`out/` に静的書き出し）で、サーバランタイム不要・静的ホスティングで配信する。

## プロダクト構成

```
size-fitter/
├─ app/
│  ├─ page.tsx        # ランディング + <Fitter /> 埋め込み（サーバコンポーネント）
│  ├─ Fitter.tsx      # "use client" メインUI（カテゴリ/モード/入力/結果）
│  ├─ layout.tsx      # metadata + 公開直前に有効化するアナリティクススロット
│  └─ globals.css     # スタイル
├─ lib/
│  ├─ data.mjs        # curated サイズデータ（標準換算表 + ブランド一覧・自前再構成）
│  └─ sizing.mjs      # 逆引きエンジン（純関数・副作用なし）
└─ test/
   ├─ sizing.test.mjs # エンジン + データ整合性のユニットテスト（node:test）
   └─ smoke.test.mjs  # 雛形 smoke テスト
```

ロジックとデータは `.mjs`（ESM）で実装し、UI(`.tsx`)と `node --test` の双方から
追加の変換ツールなしで読み込む。

## データと免責

- 標準換算は JIS / Mondopoint 等の一般的なサイズ対応を**自前で構造化した目安値**。
  各ブランドの公式サイズチャートの画像・表を転載したものではない。
- 数値推奨は標準換算（検証可能な目安）に固定し、ブランド固有の曖昧なフィット差は
  定性 note（参考情報）として表示する。誤った精度を出さない。
- ブランド名は**識別目的の事実記述**であり、提携・公認関係を示すものではない。
- すべて「目安」。UI 上で明示し、公式チャート確認を誘導する。個人情報は取得せず
  入力は localStorage のみに保存する。

## セットアップ & 開発

```bash
./setup.sh                 # pnpm install
pnpm dev                   # http://localhost:3000（ホットリロード）
```

## ビルド（static export）

```bash
pnpm build                 # next build → out/ に静的 HTML/CSS/JS を生成
ls out/index.html          # 生成物の確認

./run.sh serve             # out/ をビルドしてローカル配信（http://localhost:3000）
```

`out/` がそのまま配信物。`next start`（サーバ常駐）は使わない。

## テスト

```bash
pnpm test                  # node --test（標準ランナー）
```

## デプロイ

- 第一候補: **GitHub Pages**（無料枠で配信可能）
- 副次候補: Cloudflare Pages

手順の詳細は [`deploy.md`](./deploy.md) を参照。

## 構成

```
size-fitter/
├─ app/
│  ├─ page.tsx              # トップページ
│  └─ layout.tsx            # 公開アナリティクスのスロットをコメントで用意（公開直前に有効化）
├─ public/                  # 静的アセット置き場
├─ test/
│  └─ smoke.test.mjs        # node:test の smoke テスト
├─ next.config.mjs          # output: "export"（static export 設定）
├─ tsconfig.json            # TypeScript 設定
├─ deploy.md                # デプロイ手順（GitHub Pages 主・Cloudflare Pages 副）
└─ public/                  # 静的アセット置き場
```

## アナリティクス（任意・公開直前に有効化）

`app/layout.tsx` に cookieless のアナリティクススロットをコメントで用意してある。
公開直前に GoatCounter（第一候補）か Cloudflare Web Analytics（副次）のどちらか 1 つを有効化する。
公開タグは秘密ではないのでコード直書きで構わない（実トークンはコミットしてよい公開コード）。
