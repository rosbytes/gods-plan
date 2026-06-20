export default function Line({ lineColor }: { lineColor: string }) {
  return (
    <div
      className={`absolute top-41 -left-0.5 h-0.5 w-12 rotate-60`}
      style={{ background: lineColor }}
    >
      <div
        className={`absolute top-3.25 left-3 h-0.25 w-6 rotate-90`}
        style={{ background: lineColor }}
      >
        <div
          className={`absolute bottom-13.25 -left-1.75 h-0.25 w-30.5 -rotate-60`}
          style={{ background: lineColor }}
        >
          <div
            className={`absolute -top-29.75 left-0.75 h-0.25 w-59.5 -rotate-90`}
            style={{ background: lineColor }}
          >
            <div
              className={`circle top absolute -top-1 -right-1 h-2 w-2`}
              style={{ background: lineColor }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
// import SvgCenter from "../public/svgcenter.svg";
// import SvgRight from "../public/svgright.svg";
// import SvgLeft from "../public/svgleft.svg";
// import Image from "next/image";

// export function LeftLine() {
//   return <Image src={SvgLeft} alt="SvgLeft" width={50} height={50} />;
// }

// export function CenterLine() {
//   return <Image src={SvgCenter} alt="SvgCenter" width={50} height={50} />;
// }
// export function RightLine() {
//   return <Image src={SvgRight} alt="SvgRight" width={50} height={50} />;
// }
