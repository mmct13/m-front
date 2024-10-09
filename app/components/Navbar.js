import Image from "next/image";
import Link from "next/link";
import React from "react";
import logo from "../logo.png";
const Navbar = () => {
  return (
    <div>
      <nav className="bg-white border-gray-200 px-2 sm:px-4 py-2.5 rounded dark:bg-gray-800">
        <div className="container flex flex-col sm:flex-row sm:justify-between items-center mx-auto">
          <div className="flex items-center mb-2 sm:mb-0">
            <Link
              href="/"
              className="self-center text-center text-lg lg:text-2xl font-semibold whitespace-nowrap dark:text-white"
            >
              Application d'informations - M1 INFO
            </Link>
          </div>
          <div className="flex items-center">
            <span className="self-center text-center text-lg lg:text-2xl font-semibold whitespace-nowrap dark:text-white">
              Développée à l'aide de
              <Image src={logo} width={260} height={40} alt="Logo" />
            </span>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
