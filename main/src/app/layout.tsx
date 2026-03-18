import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "600"],
  variable: "--font-poppins",
  display: 'swap',
});

const apercuPro = localFont({
  src: [
    {
      path: "./fonts/apercu_regular_pro.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/apercu_bold_pro.otf",
      weight: "700",
      style: "normal",
    },
    {
      path: "./fonts/apercu_medium_pro.otf",
      weight: "500",
      style: "normal",
    },
  ],
  variable: "--font-apercu",
  display: 'swap',
});

export const metadata: Metadata = {
  title: "ROS - Coming Soon",
  description: "Republic of Sabjiwala - Coming Soon",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.svg",
    apple: "/icons/ROS_maskable_icon_x192.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${poppins.variable} ${apercuPro.variable}`}>
      <body className="antialiased bg-black text-white selection:bg-white selection:text-black">
        {children}
      </body>
    </html>
  );
}
