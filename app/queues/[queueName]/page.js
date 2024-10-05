"use client";
import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const QueueMessagesPage = () => {
  const pathname = usePathname();
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  // Extraire le nom de la queue à partir de l'URL
  const queueName = pathname.split("/")[2];

  useEffect(() => {
    let eventSource;

    if (queueName) {
      console.log(`Création de l'EventSource pour la queue: ${queueName}`);
      eventSource = new EventSource(
        `http://localhost:3001/queues/${queueName}/messages`
      );

      eventSource.onopen = () => {
        console.log("Connexion SSE établie");
        setIsConnected(true);
        setError(null);
      };

      eventSource.onmessage = (event) => {
        console.log("Message SSE reçu:", event.data);
        try {
          const newMessage = JSON.parse(event.data);
          setMessages((prevMessages) => [...prevMessages, newMessage.message]);
        } catch (err) {
          console.error("Erreur lors du parsing du message:", err);
          setError("Erreur lors du traitement du message");
        }
      };

      eventSource.onerror = (err) => {
        console.error("Erreur SSE:", err);
        setIsConnected(false);
        setError("Erreur de connexion au serveur");
        eventSource.close();
      };
    }

    return () => {
      if (eventSource) {
        console.log("Fermeture de la connexion SSE");
        eventSource.close();
      }
    };
  }, [queueName]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">
        Messages pour la queue : {queueName}
      </h1>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <div className="mb-4">
        Statut de connexion :{" "}
        {isConnected ? (
          <span className="text-green-500">Connecté</span>
        ) : (
          <span className="text-red-500">Déconnecté</span>
        )}
      </div>
      <div className="border p-4 rounded-lg">
        {messages.length > 0 ? (
          messages.map((msg, index) => (
            <p key={index} className="mb-2 p-2">
              {msg}
            </p>
          ))
        ) : (
          <p>Aucun message pour cette queue.</p>
        )}
      </div>
    </div>
  );
};

export default QueueMessagesPage;
