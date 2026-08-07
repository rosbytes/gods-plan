// use only next/link and next/router in next revision, in short keep is server side component
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import headerRos from "@public/headerRos.svg";
const navLinks = [
  {
    name: "Home",
    path: "/",
  },
  {
    name: "About R.O.S",
    path: "/about",
  },
  { name: "Join Us", path: "/join-us" },
  {
    name: "Contact Us",
    path: "/contact",
  },
];

import CountdownBanner from "./CountdownBanner";

const Header = () => {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white">
      <CountdownBanner />
      <nav className="flex items-center justify-center py-4">
        <div className="flex items-center gap-20">
          {navLinks.slice(0, 2).map((nav) => (
            <Link
              key={nav.path}
              href={nav.path}
              className={`border-b-2 pb-1 font-medium transition-colors duration-200 ${
                pathname === nav.path
                  ? ""
                  : "border-transparent text-gray-900 hover:text-purple-700"
              }${
                pathname === nav.path ? "border-[#993487] text-[#993487]" : ""
              }`}
            >
              {nav.name}
            </Link>
          ))}
          <Link href="/">
            <Image
              src={headerRos}
              alt="ROS LOGO"
              className="h-15 w-15"
              width={40}
              height={40}
            />
          </Link>

          {navLinks.slice(2).map((nav) => (
            <Link
              key={nav.path}
              href={nav.path}
              className={`pb-1 font-medium transition-colors duration-200 ${
                pathname === nav.path
                  ? "border-b-2"
                  : "text-gray-900 hover:text-purple-700"
              }`}
              style={
                pathname === nav.path
                  ? { color: "#993487", borderColor: "#993487" }
                  : {}
              }
            >
              {nav.name}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
};

export default Header;
