import Image from "next/image";

type SocialCardProps = {
  href: string;
  iconPath: string;
  label: string;
  brandColor: string;
  labelColor: string;
};

export const SocialCard: React.FC<SocialCardProps> = ({
  href,
  iconPath,
  label,
  brandColor,
  labelColor,
}) => (
  <a
    href={href}
    target="_blank"
    className="flex h-[240px] w-[200px] flex-col items-center overflow-hidden rounded text-center shadow-lg transition-transform hover:-translate-y-2 hover:scale-105"
    style={{ background: brandColor }}
  >
    <div className="flex w-full flex-1 items-center justify-center">
      <Image
        src={iconPath}
        width={60}
        height={60}
        alt={label + " icon"}
        unoptimized
      />
    </div>
    <div
      className="w-full bg-white py-2 font-medium tracking-wide"
      style={{ color: labelColor }}
    >
      {label} &rarr;
    </div>
  </a>
);
