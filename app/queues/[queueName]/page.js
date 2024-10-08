"use client";
import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation"; // Hook pour accéder au chemin d'URL actuel
import { FiRefreshCw } from "react-icons/fi"; // Icone de réactualisation

const QueueMessagesPage = () => {
  const pathname = usePathname();
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true); // Nouveau état pour gérer l'indicateur de connexion en cours

  const queueName = pathname.split("/")[2];

  useEffect(() => {
    let eventSource;

    if (queueName) {
      console.log(`Création de l'EventSource pour la queue: ${queueName}`);
      setIsConnecting(true); // Activer l'indicateur de connexion
      eventSource = new EventSource(
        `http://192.168.1.3:3001/queues/${queueName}/messages`
      );

      eventSource.onopen = () => {
        console.log("Connexion SSE établie");
        setIsConnected(true);
        setError(null);
        setIsConnecting(false); // Désactiver l'indicateur de connexion
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
        setIsConnecting(false); // Désactiver l'indicateur de connexion
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
        Messages pour la file : {queueName}
      </h1>
      {error && (
        <div className="text-red-500 mb-4 flex items-center gap-2">
          {error}{" "}
          <button
            onClick={() => window.location.reload()} // Bouton de réessai
            className="text-blue-500 hover:text-blue-700"
          >
            <FiRefreshCw />
          </button>
        </div>
      )}
      <div className="mb-4">
        Statut de connexion :{" "}
        {isConnecting ? (
          <span className="text-yellow-500">Connexion en cours...</span>
        ) : isConnected ? (
          <span className="text-green-500">Connecté</span>
        ) : (
          <span className="text-red-500">Déconnecté</span>
        )}
      </div>
      <div className="border p-4 rounded-lg h-64 overflow-y-auto">
        {messages.length > 0 ? (
          messages.map((msg, index) => (
            <p
              key={index}
              className="mb-2 p-2 bg-gray-100 rounded-lg animate-fade-in dark:bg-gray-800"
            >
              {msg}
            </p>
          ))
        ) : (
          <p className="text-gray-500">Aucun message pour cette file.</p>
        )}
      </div>
    </div>
  );
};

export default QueueMessagesPage;
