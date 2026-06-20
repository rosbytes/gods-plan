import Image from "next/image";

export interface Image {
  src: string; // Image source (svg, png, jpg, etc.)
  width?: number | string; // width of the image (px or %)
  height?: number | string; // height of the image
  x?: number; // x position
  y?: number; // y position
  className?: string; // Tailwind classes (limited for SVG)
}

export interface Gradient {
  from: string;
  to: string;
  opacity?: number; // optional opacity for gradient overlay
}

export interface LayeredShapeProps {
  size?: number; // overall shape size
  color?: string; // base color
  image?: Image; // single image (use Image[] for multiple)
  gradient?: Gradient;
}

export default function LayeredShape({
  size = 300,
  color = "gray",
  image,
  gradient,
}: LayeredShapeProps) {
  const clipPath =
    "polygon( 34.848% 0%,34.848% 0%,34.352% 0.031%,33.867% 0.121%,33.395% 0.269%,32.941% 0.473%,32.508% 0.729%,32.099% 1.036%,31.718% 1.392%,31.367% 1.794%,31.051% 2.241%,30.772% 2.729%,0.686% 61.826%,0.686% 61.826%,0.44% 62.375%,0.248% 62.946%,0.111% 63.533%,0.028% 64.131%,0% 64.735%,0.026% 65.339%,0.107% 65.937%,0.242% 66.525%,0.432% 67.097%,0.676% 67.647%,15.609% 97.252%,15.609% 97.252%,15.887% 97.743%,16.203% 98.192%,16.554% 98.597%,16.936% 98.956%,17.346% 99.265%,17.781% 99.524%,18.236% 99.729%,18.71% 99.878%,19.197% 99.969%,19.695% 100%,80.178% 100%,80.178% 100%,80.674% 99.969%,81.16% 99.879%,81.632% 99.73%,82.086% 99.527%,82.519% 99.27%,82.928% 98.963%,83.31% 98.606%,83.66% 98.204%,83.977% 97.757%,84.255% 97.269%,99.316% 67.65%,99.316% 67.65%,99.562% 67.099%,99.754% 66.526%,99.89% 65.938%,99.973% 65.338%,100% 64.733%,99.973% 64.128%,99.891% 63.528%,99.754% 62.939%,99.562% 62.366%,99.316% 61.815%,69.293% 2.732%,69.293% 2.732%,69.014% 2.244%,68.698% 1.797%,68.347% 1.394%,67.966% 1.038%,67.556% 0.73%,67.123% 0.473%,66.669% 0.27%,66.197% 0.121%,65.711% 0.031%,65.215% 0%,34.848% 0% )";
  return (
    <div
      style={{
        width: size,
        height: (430 / 510) * size, // preserve aspect ratio
        backgroundColor: color,
        WebkitClipPath: clipPath, // for Safari
        overflow: "hidden",
      }}
      className="relative flex items-center justify-center"
    >
      {/* Image layer */}
      {image && (
        <Image
          width={80}
          height={80}
          src={image.src}
          alt=""
          style={{
            width: image.width || "100%",
            height: image.height || "100%",
            objectFit: "cover",
          }}
          className={image.className}
        />
      )}

      {/* Gradient overlay */}
      {gradient && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(to bottom, ${gradient.from}, ${gradient.to})`,
            opacity: gradient.opacity ?? 1,
          }}
        />
      )}
    </div>
  );
}

// interface ShapeType {
//   color?: string;
//   image?: string;
//   size: number;
//   gradient?: { from: string; to: string }; // 👈 new prop
// }

// export function Shape({ color, image, size = 300, gradient }: ShapeType) {
//   const gradientId = `hexGradient-${Math.random()}`; // unique id to avoid conflicts

//   return (
//     <svg
//       viewBox="0 0 510 430"
//       width={size}
//       height={(430 / 510) * size}
//     >
//       <defs>
//         <clipPath id="shapeClip">
//           <path d="M177.726 0C169.221 0 161.336 4.45049 156.939 11.7325L3.49735 265.851C-1.14741 273.543 -1.16703 283.172 3.44635 290.883L79.6061 418.183C83.9915 425.513 91.904 430 100.444 430H408.908C417.418 430 425.306 425.545 429.702 418.256L506.51 290.895C511.162 283.18 511.164 273.523 506.513 265.806L353.392 11.7496C348.998 4.45786 341.107 0 332.595 0H177.726Z" />
//         </clipPath>

//         {gradient && (
//           <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
//             <stop offset="0%" stopColor={gradient.from} />
//             <stop offset="100%" stopColor={gradient.to} />
//           </linearGradient>
//         )}
//       </defs>

//       {image ? (
//         <>
//           <image
//             href={image}
//             width="100%"
//             height="100%"
//             preserveAspectRatio="xMidYMid slice"
//             clipPath="url(#shapeClip)"
//           />
//           {gradient && (
//             <rect
//               width="100%"
//               height="100%"
//               clipPath="url(#shapeClip)"
//               fill={`url(#${gradientId})`}
//             />
//           )}
//         </>
//       ) : (
//         <rect
//           width="100%"
//           height="100%"
//           fill={color || "gray"}
//           clipPath="url(#shapeClip)"
//         />
//       )}
//     </svg>
//   );
// }
