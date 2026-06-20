import Image from "next/image";
import forThePeople from "@public/For-the-People.svg";
import quoteL from "@public/quote-l.svg";
import quoteR from "@public/quote-r.svg";
const QuoteCard = () => {
  return (
    <div>
      <section className="relative h-[735px] overflow-hidden bg-[#993487] px-6 py-18 text-center">
        <Image
          src={forThePeople}
          alt="for the px`eople "
          className="pointer-events-none absolute inset-0 h-full w-full mix-blend-overlay"
        />

        <div className="relative mx-auto flex max-w-3xl flex-col gap-20">
          <h2 className="custom-roquen mb-4 text-6xl font-bold tracking-tight text-white">
            THE NEW REPUBLIC
          </h2>

          <div className="flex flex-col">
            <blockquote className="custom-montagu relative text-4xl text-white/90 italic">
              <Image src={quoteL} alt="quote left" width={30} height="30" />
              We want to show the world, <br />
              through our actions, how to <br />
              transform an unorganized and exploiting system into a <br />
              flourishing one.”
              <Image
                src={quoteR}
                alt="quote left"
                className="absolute top-0 right-0"
                width={30}
                height="30"
              />
            </blockquote>
            <p className="custom-apercu mt-8 text-2xl font-semibold text-white/70">
              ~ Team R.O.S.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default QuoteCard;
