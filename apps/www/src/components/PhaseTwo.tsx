import LayeredShape from "./Hexagon";
import Image from "next/image";

import MandiSvg from "@public/mandivendorline.svg";
export default function PhaseTwo() {
  return (
    <>
      <div className="relative flex w-full max-w-[850px] flex-row items-center justify-center">
        {/* MANDI HEXAGON */}
        <div className="relative mr-[-20px] flex flex-col items-center">
          <LayeredShape
            image={{ src: "/mandi.jpg" }}
            size={300}
            gradient={{ from: "rgba(10, 84, 69, 0)", to: "#0A5445" }}
          />

          <span className="absolute bottom-5 rounded-md px-6 py-2 text-4xl font-extrabold text-white">
            MANDI
          </span>
        </div>

        <Image
          src={MandiSvg}
          alt="MandiSvg"
          width={350}
          height={130}
          priority
          className="z-10"
        />

        {/* VENDOR HEXAGON */}
        <div className="relative ml-[-27px] flex flex-col items-center">
          <LayeredShape
            image={{ src: "/vendor.jpg" }}
            size={300}
            gradient={{ from: "rgba(214, 126, 58, 0)", to: "#D67E3A" }}
          />
          <span className="absolute bottom-5 rounded-md px-6 py-2 text-4xl font-extrabold tracking-wide text-white">
            VENDOR
          </span>
        </div>
      </div>

      {/* Subtitle */}
      <div className="mt-20 max-w-2xl text-center text-4xl font-medium text-white">
        Establishing R.O.S. as the biggest buyer <br /> in central Mandis
      </div>

      <div className="mx-auto mt-20 grid max-w-6xl gap-12 px-6 text-white md:grid-cols-3">
        <div className="text-left text-xl leading-relaxed">
          Organizing the Mandi-
          <br />
          Vendor network by <br />
          onboarding Vendors as one <br />
          unified ROS entity and driving down <br />
          the cost of <br />
          groceries.
        </div>
        <div className="text-left text-xl leading-relaxed">
          The involvement of ROS into <br />
          the system delivers <br />
          adequate monitoring of <br />
          grocery sales and enhanced <br /> management while <br /> promising
          growth to each <br />
          associated vendor.
        </div>
        <div className="text-left text-xl leading-relaxed">
          The network further <br />
          establishes stability in the <br />
          rather unstable market and <br />
          drastically cuts the amount of wastage and uneven <br /> prices.
        </div>
      </div>
      <div className="mt-20 text-3xl font-medium whitespace-nowrap text-white">
        Revealing Soon...
      </div>
    </>
  );
}

// import { Shape } from "./Hexagon";
// import Image from "next/image";

// import MandiSvg from "../public/mandivendorline.svg";
// export default function PhaseTwo() {
//   return (
//     <>
//       <div className="relative flex w-full max-w-[850px] flex-row items-center justify-center">
//         {/* MANDI HEXAGON */}
//         <div className="relative mr-[-20px] flex flex-col items-center">
//           <Shape
//             image="/mandi.jpg"
//             size={300}
//             gradient={{ from: "rgba(10, 84, 69, 0)", to: "#0A5445" }}
//           />

//           <span className="absolute bottom-5 rounded-md custom-roquen px-6 py-2 text-4xl font-extrabold text-white">
//             MANDI
//           </span>
//         </div>

//         <Image
//           src={MandiSvg}
//           alt="MandiSvg"
//           width={350}
//           height={130}
//           priority
//           className="z-10"
//         />

//         {/* VENDOR HEXAGON */}
//         <div className="relative ml-[-27px] flex flex-col items-center">
//           <Shape
//             image="/vendor.jpg"
//             size={300}
//             gradient={{ from: "rgba(214, 126, 58, 0)", to: "#D67E3A" }}
//           />
//           <span className="absolute custom-roquen bottom-5 rounded-md px-6 py-2 text-4xl font-extrabold tracking-wide text-white">
//             VENDOR
//           </span>
//         </div>
//       </div>

//       {/* Subtitle */}
//       <div className="mt-20 max-w-4xl custom-apercu text-center text-5xl font-medium text-white">
//         Establishing R.O.S. as the biggest buyer <br /> in central Mandis
//       </div>

//       <div className="mx-auto mt-20 grid max-w-6xl gap-12 custom-apercu px-6 text-white md:grid-cols-3">
//         <div className="text-left text-xl leading-relaxed">
//           Organizing the Mandi-
//           <br />
//           Vendor network by <br />
//           onboarding Vendors as one <br />
//           unified ROS entity and driving down <br />
//           the cost of <br />
//           groceries.
//         </div>
//         <div className="text-left text-xl leading-relaxed">
//           The involvement of ROS into <br />
//           the system delivers <br />
//           adequate monitoring of <br />
//           grocery sales and enhanced <br /> management while <br /> promising
//           growth to each <br />
//           associated vendor.
//         </div>
//         <div className="text-left text-xl leading-relaxed">
//           The network further <br />
//           establishes stability in the <br />
//           rather unstable market and <br />
//           drastically cuts the amount of wastage and uneven <br /> prices.
//         </div>
//       </div>
//       <div className="mt-45 text-3xl font-medium custom-montagu whitespace-nowrap text-white">
//         Revealing Soon...
//       </div>
//     </>
//   );
// }
