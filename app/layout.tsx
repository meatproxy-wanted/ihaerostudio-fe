import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: {
    default: "이해로 스튜디오",
    template: "%s · 이해로 스튜디오",
  },
  description: "판결문을 원문과 대조하며 쉬운 설명자료로 완성하는 제작 도구",
};

/*
 * Applied before paint so a stored dark theme never flashes light. Mirrors
 * `applyTheme` in components/theme-toggle.tsx. Reader and print pages are
 * paper for everyone, so they always stay light.
 */
const themeScript = `(function(){try{var p=location.pathname;var paper=p.indexOf("/read/")===0||p.indexOf("/print/")===0;var s=localStorage.getItem("ihaerostudio-theme");var d=!paper&&(s==="dark"||(s!=="light"&&window.matchMedia("(prefers-color-scheme: dark)").matches));document.documentElement.classList.toggle("dark",d);document.documentElement.style.colorScheme=d?"dark":"light";}catch(e){}})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className="h-full" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex min-h-full flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
