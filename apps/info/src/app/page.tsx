import Image from "next/image"
import Link from "next/link"

export default function Home() {
    return (
        <div className="flex min-h-dvh flex-col justify-between bg-black p-7.5 text-white">
            {/* Logo Section */}
            <div className="flex justify-center">
                <div className="logo m-0 flex min-w-75 items-center justify-start p-0">
                    <Image
                        src="/assets/Republic_of_Sabjiwala_logo.svg"
                        alt="Republic of Sabjiwala Logo"
                        width={119}
                        height={24}
                        className="h-[1.524rem] w-[7.438rem]"
                    />
                </div>
            </div>

            {/* Hero Link */}
            <Link
                href="https://info.republicofsabjiwala.com"
                title="Republic of Sabjiwala"
                target="_blank"
                rel="noopener noreferrer"
                className="text-inherit no-underline"
            >
                <div className="flex justify-center">
                    <Image
                        src="/assets/ROS_Got_this.svg"
                        alt="ROS is saying, We got this!"
                        width={166}
                        height={94}
                        className="h-23.5 w-41.5 translate-x-7.5 transform"
                        loading="eager"
                    />
                </div>
            </Link>

            {/* Quick Links Section */}
            <div className="flex min-h-32.5 min-w-[17.438rem] flex-col items-center justify-center px-[0.938rem] pr-1.5">
                <div className="flex w-full max-w-75 flex-col items-center">
                    <Link
                        href="https://forms.gle/wihJFGsdpqRcEbLX9"
                        title="Join Us"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full no-underline"
                    >
                        <div className="flex transform items-center justify-center rounded-full bg-[#E1FFB7] px-8 py-3 text-black shadow-xl transition-all duration-300 hover:scale-[1.02] hover:bg-[#d4f2a3] hover:shadow-[#E1FFB7]/30 active:scale-[0.98]">
                            <span className="text-[1.25rem] font-bold tracking-widest uppercase">
                                Join Us
                            </span>
                        </div>
                    </Link>
                </div>

                {/* Separator */}
                <div className="mt-7.5 flex w-[17.438rem] justify-center">
                    <div className="w-55.5 border-[0.5px] border-solid border-white"></div>
                </div>

                {/* Social Links */}
                <div className="mt-5 flex min-w-67.5 justify-between">
                    <Link
                        href="https://www.instagram.com/sabjiwala.bfs/"
                        title="Instagram"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-inherit no-underline"
                    >
                        <p className="text-[1rem]">Instagram</p>
                    </Link>

                    <Link
                        href="https://www.linkedin.com/company/sabjiwala-bfs"
                        title="LinkedIn"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-inherit no-underline"
                    >
                        <p className="text-[1rem]">LinkedIn</p>
                    </Link>
                </div>
            </div>
        </div>
    )
}
