import React from "react";

const Navbar = () => {
  return (
    <div>
      <nav className="bg-white border-gray-200 px-2 sm:px-4 py-2.5 rounded dark:bg-gray-800">
        <div className="container flex flex-col sm:flex-row sm:justify-between items-center mx-auto">
          <div className="flex items-center mb-2 sm:mb-0">
            <span className="self-center text-center text-lg lg:text-2xl font-semibold whitespace-nowrap dark:text-white">
              Middleware de messagerie - Groupe 5
            </span>
          </div>
          <div className="flex items-center">
            <span className="self-center text-center text-lg lg:text-2xl font-semibold whitespace-nowrap dark:text-white">
              APACHE ActiveMQ
            </span>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
