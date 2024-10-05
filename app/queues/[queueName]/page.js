"use client";
import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation"; // Hook pour accéder au chemin d'URL actuel

const QueueMessagesPage = () => {
  const pathname = usePathname(); // Récupération du chemin actuel de l'URL
  const [messages, setMessages] = useState([]); // État pour stocker les messages reçus de la queue
  const [error, setError] = useState(null); // État pour gérer les erreurs de connexion
  const [isConnected, setIsConnected] = useState(false); // État pour gérer le statut de la connexion SSE

  // Extraire le nom de la queue à partir de l'URL, ici l'URL est de la forme /queues/<queueName>/messages
  const queueName = pathname.split("/")[2];

  // useEffect pour gérer l'ouverture et la fermeture de la connexion SSE
  useEffect(() => {
    let eventSource; // Variable pour stocker l'instance d'EventSource

    // Vérifier si queueName est défini avant de créer l'EventSource
    if (queueName) {
      console.log(`Création de l'EventSource pour la queue: ${queueName}`);
      // Création de la connexion SSE avec l'URL du serveur
      eventSource = new EventSource(
        `http://localhost:3001/queues/${queueName}/messages`
      );

      // Gérer l'ouverture de la connexion SSE
      eventSource.onopen = () => {
        console.log("Connexion SSE établie");
        setIsConnected(true); // Mettre à jour le statut de connexion à "Connecté"
        setError(null); // Réinitialiser les erreurs
      };

      // Gérer les messages reçus via SSE
      eventSource.onmessage = (event) => {
        console.log("Message SSE reçu:", event.data);
        try {
          // Parser le message reçu (qui est au format JSON)
          const newMessage = JSON.parse(event.data);
          // Ajouter le nouveau message à l'état des messages
          setMessages((prevMessages) => [...prevMessages, newMessage.message]);
        } catch (err) {
          console.error("Erreur lors du parsing du message:", err);
          setError("Erreur lors du traitement du message"); // Mettre à jour l'état d'erreur
        }
      };

      // Gérer les erreurs de la connexion SSE
      eventSource.onerror = (err) => {
        console.error("Erreur SSE:", err);
        setIsConnected(false); // Mettre à jour le statut de connexion à "Déconnecté"
        setError("Erreur de connexion au serveur"); // Afficher un message d'erreur
        eventSource.close(); // Fermer la connexion SSE en cas d'erreur
      };
    }

    // Nettoyer l'effet lors du démontage du composant
    return () => {
      if (eventSource) {
        console.log("Fermeture de la connexion SSE");
        eventSource.close(); // Fermer proprement la connexion SSE lors de la désactivation du composant
      }
    };
  }, [queueName]); // Le useEffect dépend de la valeur de queueName

  return (
    <div className="p-4">
      {/* Affichage du titre avec le nom de la queue */}
      <h1 className="text-2xl font-bold mb-4">
        Messages pour la queue : {queueName}
      </h1>
      {/* Affichage des erreurs éventuelles */}
      {error && <div className="text-red-500 mb-4">{error}</div>}
      {/* Statut de la connexion */}
      <div className="mb-4">
        Statut de connexion :{" "}
        {isConnected ? (
          <span className="text-green-500">Connecté</span> // Indique que la connexion est active
        ) : (
          <span className="text-red-500">Déconnecté</span> // Indique que la connexion est fermée ou en erreur
        )}
      </div>
      {/* Affichage des messages reçus ou d'un message par défaut */}
      <div className="border p-4 rounded-lg">
        {messages.length > 0 ? (
          // Mapper et afficher chaque message reçu
          messages.map((msg, index) => (
            <p key={index} className="mb-2 p-2">
              {msg}
            </p>
          ))
        ) : (
          <p>Aucun message pour cette queue.</p> // Message par défaut si aucun message n'est reçu
        )}
      </div>
    </div>
  );
};

export default QueueMessagesPage; // Exportation du composant pour utilisation dans d'autres parties de l'application
