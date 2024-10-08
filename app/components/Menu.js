"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

const Menu = () => {
  const [queues, setQueues] = useState([]);

  useEffect(() => {
    const fetchQueues = async () => {
      try {
        const res = await fetch("http://192.168.1.3:3001/queues");
        const data = await res.json();
        setQueues(data);
      } catch (error) {
        console.error("Erreur lors de la récupération des queues:", error);
      }
    };

    fetchQueues();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center">
      {/* Menu au centre de la page */}
      <div className="flex justify-center items-center h-80">
        <div className="text-3xl lg:text-5xl font-bold bg-clip-text text-transparent text-red-400">
          Menu des files
        </div>
      </div>

      {/* Liste des queues */}
      <div className="flex flex-wrap justify-center gap-4 px-4">
        {queues.length > 0 ? (
          queues.map((queue, index) => (
            <div
              key={index}
              className="bg-white shadow-lg hover:shadow-xl transition duration-300 ease-in-out rounded-lg p-6 text-center"
            >
              <Link
                href={`/queues/${queue}`}
                className="text-xl font-semibold text-purple-600 hover:text-cyan-800"
              >
                {queue}
              </Link>
            </div>
          ))
        ) : (
          <p className="text-gray-600">Aucune queue trouvée</p>
        )}
      </div>
    </div>
  );
};

export default Menu;
