import type { Metadata, Viewport } from "next";
import IntroOverlay from "@/components/IntroOverlay";
import SkipLink from "@/components/SkipLink";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Peer Space — School 21", template: "%s | Peer Space" },
  description:
    "School 21 pirlari uchun bir joy: fikr almashing, loyihalar yarating va birga o‘sing.",
  icons: {
    icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='14' fill='%23141414'/%3E%3Ctext x='32' y='44' font-size='40' font-family='Arial' font-weight='bold' text-anchor='middle' fill='white'%3E21%3C/text%3E%3C/svg%3E",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

const themeScript = `(function(){try{var t=localStorage.getItem('peer-space-theme');document.documentElement.dataset.theme=t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches)?'dark':'light'}catch(e){}})()`;
const langScript = `(function(){try{var l=localStorage.getItem('peer-space-lang');if(l==='ru'||l==='en'||l==='uz'){document.documentElement.dataset.lang=l;document.documentElement.lang=l}}catch(e){}})()`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="uz" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script dangerouslySetInnerHTML={{ __html: langScript }} />
      </head>
      <body>
        <SkipLink />
        <IntroOverlay />
        {children}
      </body>
    </html>
  );
}
