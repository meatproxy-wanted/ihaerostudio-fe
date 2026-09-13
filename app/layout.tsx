import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ihaerostudio",
  description: "반디랑",
};

/*
 * Applied before paint so a stored dark theme never flashes light. Mirrors
 * `applyTheme` in components/theme-toggle.tsx.
 */
const themeScript = `(function(){try{var s=localStorage.getItem("ihaerostudio-theme");var d=s==="dark"||(s!=="light"&&window.matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",d);document.documentElement.style.colorScheme=d?"dark":"light";}catch(e){}})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className="h-full" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
