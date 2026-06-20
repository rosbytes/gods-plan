import Header from "@/components/Header";
import localFont from "next/font/local";
import "./globals.css";
import { Metadata } from "next";

const apercu = localFont({
  src: "../../public/fonts/apercu_regular_pro.ttf",
  variable: "--font-apercu",
});

const capcut = localFont({
  src: "../../public/fonts/capcut.ttf",
  variable: "--font-capcut",
});

const montagu = localFont({
  src: "../../public/fonts/MontaguSlab.ttf",
  variable: "--font-montagu",
});

const roquen = localFont({
  src: "../../public/fonts/RoquenDEMO.ttf",
  variable: "--font-roquen",
});

export const viewport = {
  width: 1024,
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "ROS - Republic of Sabjiwala",
  description: "Republic of Sabjiwala is world's biggest project.",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.svg",
    apple: "/icons/ROS_maskable_icon_x192.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      className={`${apercu.variable} ${capcut.variable} ${montagu.variable} ${roquen.variable}`}
      lang="en"
    >
      <body>
        <Header />
        <main className="overflow-x-hidden">{children}</main>
      </body>
    </html>
  );
}
