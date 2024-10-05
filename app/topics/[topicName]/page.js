"use client";
import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import axios from "axios";

const TopicMessagesPage = () => {
  const pathname = usePathname(); // Récupère l'URL actuelle
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ws, setWs] = useState(null); // Pour stocker la connexion WebSocket

  // Extraire le nom du topic à partir de l'URL
  const topicName = pathname.split("/")[2]; // Assure-toi que cela correspond à ta structure de chemin d'URL

  // Fonction pour initialiser la connexion WebSocket
  const connectWebSocket = () => {
    const socket = new WebSocket("ws://localhost:3001"); // URL de ton serveur WebSocket

    socket.onopen = () => {
      console.log(`Connexion WebSocket établie pour le topic ${topicName}`);
      // Envoie le nom du topic pour s'abonner
      socket.send(JSON.stringify({ topicName }));
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log(`Message reçu pour le topic ${topicName}:`, data);

      // Mise à jour des messages à chaque nouveau message reçu
      setMessages((prevMessages) => [...prevMessages, data.message]);
    };

    socket.onerror = (error) => {
      console.error("Erreur WebSocket:", error);
      setError("Erreur WebSocket");
    };

    // socket.onclose = () => {
    //   console.log("Connexion WebSocket fermée");
    // };

    // Sauvegarde de la connexion WebSocket dans l'état
    setWs(socket);
  };

  // Fermer la connexion WebSocket lorsque le composant est démonté
  // useEffect(() => {
  //   return () => {
  //     if (ws) {
  //       ws.close();
  //     }
  //   };
  // }, [ws]);

  // Lancer la connexion WebSocket lorsque le topicName est disponible
  useEffect(() => {
    if (topicName) {
      setLoading(true);
      connectWebSocket();
      setLoading(false);
    }
  }, [topicName]);

  if (loading) return <div>Chargement des messages...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h1>Messages pour le topic : {topicName}</h1>
      <ul>
        {messages.length > 0 ? (
          messages.map((message, index) => (
            <li key={index}>
              <p>
                <strong>Message {index + 1} :</strong> {JSON.stringify(message)}
              </p>
            </li>
          ))
        ) : (
          <p>Aucun message à afficher pour ce topic.</p>
        )}
      </ul>
    </div>
  );
};

export default TopicMessagesPage;
