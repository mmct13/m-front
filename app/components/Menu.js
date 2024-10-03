"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
const Menu = () => {
  const [topics, setTopics] = useState([]);

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const res = await fetch("http://localhost:3001/topics");
        const data = await res.json();
        setTopics(data);
      } catch (error) {
        console.error("Erreur lors de la récupération des topics:", error);
      }
    };

    fetchTopics();
  }, []);

  return (
    <div>
      {/* Menu au centre de la page */}
      <div className="flex justify-center items-center h-80">
        <div className="text-2xl lg:text-4xl font-bold underline">
          Menu des topics
        </div>
      </div>

      {/* Liste des topics */}
      <div className="flex flex-col items-center">
        {topics.length > 0 ? (
          topics.map((topic, index) => (
            <div key={index} className="mt-2 text-lg">
              <Link href={`/topics/${topic}`} className="underline text-cyan-600">
                {topic}
              </Link>
            </div>
          ))
        ) : (
          <p>Aucun topic trouvé</p>
        )}
      </div>
    </div>
  );
};

export default Menu;
