import { socials } from "./SocialData";
import { SocialCard } from "./SocialCard";
import { WhatsAppCard } from "./WhatsappCard";

export const ContactOne: React.FC = () => (
  <section className="py-18 text-center">
    <h1 className="custom-roquen mb-18 text-5xl font-extrabold tracking-wide uppercase">
      JOIN US ON OUR SOCIALS
    </h1>
    <div className="flex justify-center gap-20">
      {socials.map((social) => (
        <SocialCard key={social.label} {...social} />
      ))}
    </div>

    <div className="my-20 flex items-center px-20">
      <hr className="flex-1 border-t border-gray-300" />
      <span className="text-black-500 custom-montagu mx-4 text-sm font-semibold uppercase">
        or
      </span>
      <hr className="flex-1 border-t border-gray-300" />
    </div>

    <h2 className="custom-roquen mb-5 text-center text-2xl font-extrabold uppercase">
      REACH OUT TO US
    </h2>

    <WhatsAppCard />
  </section>
);
