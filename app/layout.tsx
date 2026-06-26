import type { ReactNode } from "react";
import Script from "next/script";
import "./globals.css";
import "./theme.css";

export const metadata = {
  title: "海外サイズ逆引きフィッター | US/EU/UK/JP サイズ換算",
  description:
    "手持ちのブランド＋サイズ、または実寸(cm)から、Nike・adidas など主要ブランドの推奨サイズを US/EU/UK/JP で逆引き。完全ブラウザ内・無料・登録不要のサイズ換算ツール。",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja">
      <body>
        {children}
        {/* analytics: GoatCounter（cookieless・秘密キー不要・公開タグ）。next/script で afterInteractive 注入。 */}
        <Script
          data-goatcounter="https://ga-size-fitter.goatcounter.com/count"
          src="https://gc.zgo.at/count.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
