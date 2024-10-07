"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

const Menu = () => {
  const [queues, setQueues] = useState([]);

  useEffect(() => {
    const fetchQueues = async () => {
      try {
        const res = await fetch("http://192.168.1.6:3001/queues");
        const data = await res.json();
        setQueues(data);
      } catch (error) {
        console.error("Erreur lors de la récupération des queues:", error);
      }
    };

    fetchQueues();
  }, []);

  return (
    <div>
      {/* Menu au centre de la page */}
      <div className="flex justify-center items-center h-80">
        <div className="text-2xl lg:text-4xl font-bold underline">
          Menu des queues
        </div>
      </div>

      {/* Liste des queues */}
      <div className="flex flex-col items-center">
        {queues.length > 0 ? (
          queues.map((queue, index) => (
            <div key={index} className="mt-2 text-lg">
              <Link
                href={`/queues/${queue}`}
                className="underline text-cyan-600"
              >
                {queue}
              </Link>
            </div>
          ))
        ) : (
          <p>Aucune queue trouvée</p>
        )}
      </div>
    </div>
  );
};

export default Menu;
