"use client";

import { socialLinks } from "@/constant";
import Image from "next/image";
import { useEffect, useState } from "react";

export const WhatsAppCard: React.FC = () => {
  const [url, setUrl] = useState(
    `https://wa.me/${socialLinks.phone}?text=Hello%2C%20I%20have%20a%20question%20about%20Republic%20of%20Sabjiwala.`
  );

  useEffect(() => {
    setUrl(
      `https://wa.me/${socialLinks.phone}?text=Hello%2C%20I%20have%20a%20question%20about%20Republic%20of%20Sabjiwala.%20And%20I%20came%20from%20${encodeURIComponent(window.location.href)}.`
    );
  }, []);

  return (
    <div className="flex flex-col items-center">
      <div className="flex w-full max-w-xl items-center rounded-2xl bg-[#25D366] px-8 py-8">
        <div className="custom-apercu w-full flex-1">
          <p className="mb-3 text-left text-3xl font-medium text-white">
            Chat with us directly
            <br />
            via <span className="font-bold">WhatsApp</span>
          </p>
          <p className="mb-4 text-left text-xl text-white">
            Our Support Team is here for you. Reach out to us in case of any
            doubts/feedbacks.
          </p>
          <a
            href={url}
            target="_blank"
            className="block rounded bg-white px-6 py-2 text-center text-base font-medium text-[#25D366] transition hover:bg-gray-100 md:mx-0"
            style={{ width: "fit-content" }}
          >
            Message on WhatsApp
          </a>
        </div>
        <div className="ml-8">
          <Image
            src="/contact/wp.svg"
            alt="WhatsApp"
            width={120}
            height={120}
            className="h-40 w-40 md:h-42 md:w-42"
          />
        </div>
      </div>
    </div>
  );
};
