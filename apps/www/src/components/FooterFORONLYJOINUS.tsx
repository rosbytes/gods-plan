import Image from "next/image";
import Link from "next/link";
import headerRos from "@public/headerRos.svg"; // assuming we use the same or a white version of ROS logo if available
import { socialLinks } from "@/constant";

export default function Footer() {
  return (
    <footer className="h-[50vh] w-full bg-[#0E4A34] py-12 text-white">
      <div className="container mx-auto flex flex-col items-center px-4 lg:px-20">
        <div className="mb-8 flex w-full flex-col items-center justify-between gap-8 md:flex-row">
          {/* Logo Section */}
          <div className="flex items-center gap-3">
            <Image
              src={headerRos}
              alt="ROS LOGO"
              className="h-10 w-10 brightness-0 invert"
              width={40}
              height={40}
            />
            <h2 className="text-xl leading-tight font-bold tracking-widest uppercase">
              Republic of
              <br />
              Sabjiwala
            </h2>
          </div>

          {/* Quick Links */}
          <div className="flex items-center gap-6 md:gap-10">
            <Link
              href="/about"
              className="font-medium transition-colors hover:text-green-300"
            >
              About
            </Link>
            <Link
              href="/join-us"
              className="font-medium transition-colors hover:text-green-300"
            >
              Join Us
            </Link>
            <Link
              href="/contact"
              className="font-medium transition-colors hover:text-green-300"
            >
              Contact Us
            </Link>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-5">
            <Link
              href={socialLinks.instagram}
              aria-label="Instagram"
              className="transition-opacity hover:opacity-80"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
              </svg>
            </Link>
            <Link
              href={socialLinks.linkedin}
              aria-label="LinkedIn"
              className="transition-opacity hover:opacity-80"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                <rect width="4" height="12" x="2" y="9" />
                <circle cx="4" cy="4" r="2" />
              </svg>
            </Link>
            <Link
              href={socialLinks.twitter}
              aria-label="X (Twitter)"
              className="transition-opacity hover:opacity-80"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
                <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
              </svg>
            </Link>
            <Link
              href={socialLinks.facebook}
              aria-label="Facebook"
              className="transition-opacity hover:opacity-80"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Divider */}
        <hr className="w-full border-t border-gray-300/40" />

        {/* Legal & Support */}
        <div className="mt-6 flex w-full flex-col items-center justify-center gap-4 text-sm text-gray-200 md:flex-row md:gap-8">
          <span>&copy; 2026 ROS. All rights reserved.</span>
          <div className="flex items-center gap-4 md:gap-8">
            <Link
              href="/privacy-policy"
              className="transition-colors hover:text-green-300"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="transition-colors hover:text-green-300"
            >
              Terms of Service
            </Link>
            <button className="transition-colors hover:text-green-300">
              Cookies Settings
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
