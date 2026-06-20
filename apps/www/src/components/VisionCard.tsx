import Image from "next/image";
import vision from "@public/vision.svg";
import HeroImage from "@public/hero.png";
const VisionCard = () => {
  return (
    <div className="mt-8 flex flex-col items-center justify-center">
      <h1 className="custom-roquen mt-5 mb-10 text-5xl">
        {" "}
        A VISION FOR THE <span className="text-green-500">WORLD</span>
      </h1>
      <div className="relative flex h-[465px] max-w-[1250px] items-center justify-center overflow-hidden md:w-full">
        <Image
          src={HeroImage}
          alt="Hero image"
          fill
          style={{ objectFit: "cover" }}
          className=""
          preload
          //   loading="eager"
          //   fetchPriority="high"
          //   priority
        />
        <Image src={vision} alt="vision" className="relative z-10 w-[600px]" />
      </div>

      <h1 className="custom-apercu mt-10 mb-10 text-center text-xl">
        The State-of-the-Art R.O.S. system streamlines and redefines the
        traditional chains of <br />
        trade from producers to consumers to bring affordable and best quality
        groceries to <br />
        each and every individual while being fair to each link of the chain.
      </h1>
    </div>
  );
};

export default VisionCard;
