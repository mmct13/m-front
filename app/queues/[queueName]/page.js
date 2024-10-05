"use client";
import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import axios from "axios";

const QueueMessagesPage = () => {
  const pathname = usePathname(); // Récupère l'URL actuelle
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Extraire le nom de la queue à partir de l'URL
  const queueName = pathname.split("/")[2]; // Assure-toi que cela correspond à ta structure de chemin d'URL

  // Fonction pour récupérer les messages de la queue
  const fetchMessages = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:3001/queues/${queueName}/messages`
      );
      setMessage(response.data.message); // Met à jour l'état avec le message reçu
      setLoading(false);
    } catch (error) {
      setError("Erreur lors de la récupération des messages");
      setLoading(false);
    }
  };

  // Appeler fetchMessages lors du chargement initial du composant
  useEffect(() => {
    if (queueName) {
      fetchMessages();
    }
  }, [queueName]);

  return (
    <div>
      <h1>Message pour la queue : {queueName}</h1>
      <button
        onClick={fetchMessages}
        className="mb-4 p-2 bg-blue-500 text-white rounded"
      >
        Actualiser le message
      </button>
      {loading && <div>Chargement du message...</div>}
      {error && <div>{error}</div>}
      {message ? (
        <p>{message}</p>
      ) : (
        <p>Aucun message à afficher pour cette queue.</p>
      )}
    </div>
  );
};

export default QueueMessagesPage;
