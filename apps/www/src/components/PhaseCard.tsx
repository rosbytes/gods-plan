import PhaseTwo from "./PhaseTwo";
import PhaseThree from "./PhaseThree";

export default function PhaseCard() {
  return (
    <div className="flex max-h-[2096px] w-full flex-col items-center bg-[#2DB15A] pt-8 pb-20">
      <div className="custom-montagu mb-2 font-serif text-2xl text-white">
        The Phases of R.O.S.
      </div>
      <div className="relative mx-auto w-fit">
        <h1 className="custom-roquen mt-10 text-9xl font-extrabold tracking-wide text-white opacity-20 select-none">
          PHASE
        </h1>
        <span
          className="absolute bottom-[-15px] left-1/2 -translate-x-1/2 text-[60px] font-bold text-white"
          style={{ fontFamily: "var(--font-capcut)" }}
        >
          ONE
        </span>
      </div>

      <div className="custom-roquen mt-4 mb-10 text-2xl font-extrabold tracking-wider text-white">
        THE BIGGEST BUYER
      </div>

      <PhaseTwo />
      <PhaseThree />
    </div>
  );
}
