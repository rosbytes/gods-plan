import Image from "next/image";
import vectorleft from "@public/vectorleft.svg";
import vectorright from "@public/vectorright.svg";
const PhaseThree = () => {
  return (
    <div className="relative flex h-[70vh] w-full items-center justify-center px-4 font-sans">
      {/* left vector */}

      <div className="absolute top-0 left-0 z-10 flex h-full items-center">
        <Image src={vectorleft} alt="vector-left" className="h-[70%] w-auto" />
      </div>

      {/* right vector */}
      <div className="absolute top-0 right-0 z-10 flex h-full items-center">
        <Image
          src={vectorright}
          alt="vector-right"
          className="h-[70%] w-auto"
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-row items-center justify-center">
        {/* Center - Phase Grid */}
        <div className="flex w-full flex-col items-center">
          <div className="grid w-full grid-cols-1 gap-x-10 gap-y-16 md:grid-cols-3">
            {/* PHASE 2 */}
            <div className="flex flex-col items-center">
              <span className="text-7xl font-extrabold tracking-wide text-white uppercase opacity-20">
                PHASE
              </span>
              <span className="custom-capcut -mt-[38px] mb-1 text-[36px] font-bold text-white">
                TWO
              </span>
              <span className="custom-apercu text-center text-lg text-white">
                Digitalization of the Indian Vegetable Vendor
              </span>
            </div>
            {/* PHASE 3 */}
            <div className="flex flex-col items-center">
              <span className="text-7xl font-extrabold tracking-wide text-white uppercase opacity-20">
                PHASE
              </span>
              <span className="custom-capcut -mt-[38px] mb-1 text-[36px] font-bold text-white">
                THREE
              </span>
              <span className="custom-apercu text-center text-lg text-white">
                Crop Care Mission
              </span>
            </div>
            {/* PHASE 4 */}
            <div className="flex flex-col items-center">
              <span className="text-7xl font-extrabold tracking-wide text-white uppercase opacity-20">
                PHASE
              </span>
              <span className="custom-capcut -mt-[38px] mb-1 text-[36px] font-bold text-white">
                FOUR
              </span>
              <span className="custom-apercu text-center text-lg text-white">
                Healthy India Mission
              </span>
            </div>
            {/* PHASE 5 */}
            <div className="flex flex-col items-center">
              <span className="text-7xl font-extrabold tracking-wide text-white uppercase opacity-20">
                PHASE
              </span>
              <span className="custom-capcut -mt-[38px] mb-1 text-[36px] font-bold text-white">
                FIVE
              </span>
              <span className="custom-apercu text-center text-lg text-white">
                Highest ROI Business
              </span>
            </div>
            {/* PHASE 6 */}
            <div className="flex flex-col items-center">
              <span className="text-7xl font-extrabold tracking-wide text-white uppercase opacity-20">
                PHASE
              </span>
              <span className="custom-capcut -mt-[38px] mb-1 text-[36px] font-bold text-white">
                SIX
              </span>
              <span className="custom-apercu text-center text-lg text-white">
                World’s Biggest Distribution system
              </span>
            </div>
            {/* PHASE 7 - Highlighted */}
            <div className="relative flex flex-col items-center rounded-lg p-2">
              <span className="text-7xl font-extrabold tracking-wide text-white uppercase opacity-20">
                PHASE
              </span>
              <span className="custom-capcut -mt-[40px] mb-1 text-[36px] font-bold text-white">
                SEVEN
              </span>
              <span className="custom-apercu text-center text-lg text-white">
                The Farmverse
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhaseThree;
