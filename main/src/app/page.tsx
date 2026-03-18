import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div
      className="min-h-dvh flex flex-col justify-between p-7.5 bg-black text-white"
    >
      {/* Logo Section */}
      <div className="flex justify-center">
        <div
          className="logo flex justify-start items-center min-w-75 p-0 m-0"
        >
          <Image
            src="/assets/Republic_of_Sabjiwala_logo.svg"
            alt="Republic of Sabjiwala Logo"
            width={119}
            height={24}
            className="w-[7.438rem] h-[1.524rem]"
          />
        </div>
      </div>

      {/* Hero Link */}
      <Link
        href="https://info.republicofsabjiwala.com"
        title="Republic of Sabjiwala"
        target="_blank"
        rel="noopener noreferrer"
        className="no-underline text-inherit"
      >
        <div className="flex justify-center">
          <Image
            src="/assets/ROS_Got_this.svg"
            alt="ROS is saying, We got this!"
            width={166}
            height={94}
            className="h-23.5 w-41.5 transform translate-x-7.5"
          loading="eager"
          />
        </div>
      </Link>

      {/* Quick Links Section */}
      <div
        className="flex flex-col justify-center items-center px-[0.938rem] pr-1.5 min-w-[17.438rem] min-h-32.5"
      >
        <div className="flex flex-col items-center w-full max-w-75">
          <Link
            href="https://forms.gle/wihJFGsdpqRcEbLX9"
            title="Join Us"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full no-underline"
          >
            <div
              className="flex justify-center items-center py-3 px-8 bg-[#E1FFB7] hover:bg-[#d4f2a3] text-black rounded-full transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-xl hover:shadow-[#E1FFB7]/30"
            >
              <span className="text-[1.25rem] font-bold uppercase tracking-widest">
                Join Us
              </span>
            </div>
          </Link>
        </div>

        {/* Separator */}
        <div
          className="mt-7.5 w-[17.438rem] flex justify-center"
        >
          <div className="border-[0.5px] border-solid border-white w-55.5"></div>
        </div>

        {/* Social Links */}
        <div
          className="mt-5 flex justify-between min-w-67.5"
        >
          <Link
            href="https://www.instagram.com/sabjiwala.bfs/"
            title="Instagram"
            target="_blank"
            rel="noopener noreferrer"
            className="no-underline text-inherit"
          >
            <p className="text-[1rem]">
              Instagram
            </p>
          </Link>

          <Link
            href="https://www.linkedin.com/company/sabjiwala-bfs"
            title="LinkedIn"
            target="_blank"
            rel="noopener noreferrer"
            className="no-underline text-inherit"
          >
            <p className="text-[1rem]">
              LinkedIn
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
