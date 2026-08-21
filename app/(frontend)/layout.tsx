import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { ArticleAudioProvider } from "@/components/audio/ArticleAudioProvider";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { NavigationLoadingIndicator } from "@/components/layout/NavigationLoadingIndicator";
import { ServiceWorkerRegistration } from "@/components/pwa/ServiceWorkerRegistration";
import { TranslationProgress } from "@/components/ui/TranslationProgress";
import { absoluteUrl, siteDescription, siteName } from "@/lib/site-config";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(absoluteUrl()),
  title: {
    default: siteName,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  applicationName: siteName,
  keywords: [
    "Islam",
    "learn Islam",
    "Islam and Christianity",
    "Quran",
    "religious studies",
    "sincere seekers",
  ],
  openGraph: {
    title: siteName,
    description: siteDescription,
    siteName,
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "The Straight Path logo: a straight road leading toward a golden light",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteName,
    description: siteDescription,
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  formatDetection: {
    telephone: false,
  },
  appleWebApp: {
    capable: true,
    title: siteName,
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7faf9" },
    { media: "(prefers-color-scheme: dark)", color: "#101a17" },
  ],
};

const PRE_PAINT_SCRIPT = `(function(){
var d=document.documentElement;
try{var t=localStorage.getItem('theme');d.classList.remove('light','dark');d.classList.add(t==='dark'?'dark':'light');}
catch(e){d.classList.add('light');}
try{
var l=null;try{l=localStorage.getItem('the-straight-path-language');}catch(e){}
if(l!=='ar'&&l!=='en'){l=document.cookie.indexOf('googtrans=/en/ar')>-1?'ar':'en';}
d.lang=l;d.dir=l==='ar'?'rtl':'ltr';d.setAttribute('data-language',l);
if(l==='ar'&&typeof Node==='function'&&Node.prototype&&!window.__straightPathTranslationGuard){
window.__straightPathTranslationGuard=true;
var rc=Node.prototype.removeChild;
Node.prototype.removeChild=function(c){return c&&c.parentNode!==this?c:rc.apply(this,arguments);};
var ib=Node.prototype.insertBefore;
Node.prototype.insertBefore=function(n,r){return r&&r.parentNode!==this?n:ib.apply(this,arguments);};
}
}catch(e){}
})();`;

type RootLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className="light" suppressHydrationWarning>
      <body suppressHydrationWarning>
        {/*
         * Runs before first paint so the saved theme and the saved reading
         * direction are already in place. Deferring the direction to hydration
         * made every Arabic page load flash left-to-right first.
         *
         * When Arabic is the saved language it also installs the DOM guards up
         * front: the translation widget re-applies itself from its own cookie
         * during hydration, and an unguarded React commit against its rewritten
         * text nodes throws and takes the whole client tree down with it.
         */}
        <script
          dangerouslySetInnerHTML={{
            __html: PRE_PAINT_SCRIPT,
          }}
        />
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-card focus:px-4 focus:py-3 focus:text-sm focus:font-semibold focus:text-foreground focus:shadow-soft focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-accent"
        >
          Skip to content
        </a>
        <ArticleAudioProvider>
          <NavigationLoadingIndicator />
          <TranslationProgress />
          <div className="flex min-h-screen flex-col">
            <ServiceWorkerRegistration />
            <SiteHeader />
            <main id="main-content" className="flex-1" tabIndex={-1}>
              {children}
            </main>
            <SiteFooter />
          </div>
        </ArticleAudioProvider>
      </body>
    </html>
  );
}
