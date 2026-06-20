import { cn } from "@/utils/cn";

interface ShapeType {
  image?: string;
  color?: string;
  size?: number;
  className?: string;
}

export function Shape({ image, color, size = 300, className }: ShapeType) {
  return (
    <div className={cn("flex flex-col items-center")}>
      <svg
        viewBox="0 0 510 430"
        width={size}
        height={(430 / 510) * size}
        className="mb-2"
      >
        <defs>
          <clipPath id="shapeClip">
            <path d="M177.726 0C169.221 0 161.336 4.45049 156.939 11.7325L3.49735 265.851C-1.14741 273.543 -1.16703 283.172 3.44635 290.883L79.6061 418.183C83.9915 425.513 91.904 430 100.444 430H408.908C417.418 430 425.306 425.545 429.702 418.256L506.51 290.895C511.162 283.18 511.164 273.523 506.513 265.806L353.392 11.7496C348.998 4.45786 341.107 0 332.595 0H177.726Z" />
          </clipPath>
        </defs>
        {/* Debug ke liye hexagon outline */}
        <path
          d="M177.726 0C169.221 0 161.336 4.45049 156.939 11.7325L3.49735 265.851C-1.14741 273.543 -1.16703 283.172 3.44635 290.883L79.6061 418.183C83.9915 425.513 91.904 430 100.444 430H408.908C417.418 430 425.306 425.545 429.702 418.256L506.51 290.895C511.162 283.18 511.164 273.523 506.513 265.806L353.392 11.7496C348.998 4.45786 341.107 0 332.595 0H177.726Z"
          fill="#E7E7E7"
          stroke="#E7E7E7"
        />

        {image ? (
          <g clipPath="url(#shapeClip)">
            {/* image ko move/scale yaha transform se control karo */}
            <image
              href={image}
              width="510"
              height="430"
              preserveAspectRatio="xMidYMid slice"
              transform="translate(0,0) scale(1)"
              className={cn("bg-[#E7E7E7]", className)}
            />
          </g>
        ) : (
          <rect
            width="100%"
            height="100%"
            fill={color}
            clipPath="url(#shapeClip)"
          />
        )}
      </svg>
    </div>
  );
}
