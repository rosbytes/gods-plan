import FooterFORONLYJOINUS from "@/components/FooterFORONLYJOINUS";
import localFont from "next/font/local";
import "../globals.css";

const apercu = localFont({
  src: "../../../public/fonts/apercu_regular_pro.ttf",
  variable: "--font-apercu",
});

const capcut = localFont({
  src: "../../../public/fonts/capcut.ttf",
  variable: "--font-capcut",
});

const montagu = localFont({
  src: "../../../public/fonts/MontaguSlab.ttf",
  variable: "--font-montagu",
});

const roquen = localFont({
  src: "../../../public/fonts/RoquenDEMO.ttf",
  variable: "--font-roquen",
});

export const viewport = {
  width: 1024,
  initialScale: 1,
  maximumScale: 1,
};

export default function PageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* <Header /> */}
      {children}
      <FooterFORONLYJOINUS />
    </>
  );
}
