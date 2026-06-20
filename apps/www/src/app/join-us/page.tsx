"use client";

import Image from "next/image";
import JoinCard from "@/components/JoinCard";
import { CardData } from "@/components/JoinPageData";

type CardProps = {
  title: string;
  role: string;
  description: string;
  button: string;
  gradient: string;
  slogan: string;
  formLink: string;
};

export default function Page() {
  return (
    <div className="relative flex h-[916px] items-center justify-center overflow-x-hidden overflow-y-hidden">
      {/* left vector */}
      <Image
        src="/JoinUs/leftVector.svg"
        alt="left vector"
        width={320}
        height={820}
        className="absolute top-0 bottom-0 left-0 z-0 my-auto h-[90%] w-auto"
      />

      <div className="relative z-10 flex w-[50%] max-w-6xl flex-col items-center">
        <h1 className="custom-roquen mb-2 text-center text-5xl font-black text-black uppercase">
          JOIN THE REPUBLIC
        </h1>
        <h2 className="custom-apercu mb-7 px-6 py-2 text-center text-xl font-semibold text-black">
          Join R.O.S. as a <span className="font-bold">Vendor</span> or an{" "}
          <span className="font-bold">Investor</span>.
        </h2>
        <div className="grid w-full max-w-3xl grid-cols-1 gap-10 md:grid-cols-2">
          {(CardData as CardProps[]).map((card, i) => (
            <JoinCard key={i} {...card} />
          ))}
        </div>
      </div>
      {/*r vector */}
      <Image
        src="/JoinUs/rightVector.svg"
        alt="right vector"
        width={320}
        height={820}
        className="absolute top-0 right-0 bottom-0 z-0 my-auto h-[90%] w-auto"
      />
    </div>
  );
}
