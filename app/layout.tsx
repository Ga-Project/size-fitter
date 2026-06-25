import type { ReactNode } from "react";
import "./globals.css";

export const metadata = {
  title: "海外サイズ逆引きフィッター | US/EU/UK/JP サイズ換算",
  description:
    "手持ちのブランド＋サイズ、または実寸(cm)から、Nike・adidas など主要ブランドの推奨サイズを US/EU/UK/JP で逆引き。完全ブラウザ内・無料・登録不要のサイズ換算ツール。",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja">
      <body>
        {/*
          analytics（公開直前に1つ有効化・cookieless・秘密キー不要）:
          有効化時は `import Script from "next/script"` を併せて追加し、以下を render する
          （next/script はハイドレーション安全・@next/next/no-sync-scripts 準拠）:
          (1) GoatCounter（第一候補・GitHub Pages/汎用ホスティングで配信可能）
          <Script data-goatcounter="https://__GC_CODE__.goatcounter.com/count" strategy="afterInteractive" src="https://gc.zgo.at/count.js" />
          (2) Cloudflare Web Analytics（副次）
          <Script strategy="afterInteractive" src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token":"__CF_BEACON_TOKEN__"}' />
        */}
        {children}
      </body>
    </html>
  );
}
