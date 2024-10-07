const express = require("express");
const axios = require("axios");
const cors = require("cors");
const stompit = require("stompit");
const port = 3001;
const os = require("os");

const ACTIVE_MQ_USER = "admin"; // Identifiant de l'utilisateur pour ActiveMQ
const ACTIVE_MQ_PASSWORD = "admin"; // Mot de passe pour ActiveMQ
const ACTIVE_MQ_BROKER_URL = "http://localhost:8161/api/jolokia"; // URL de l'API Jolokia pour accéder à ActiveMQ

const corsOptions = {
  origin: "*", // Autorise les requêtes depuis n'importe quelle origine
  methods: "GET",
  allowedHeaders: ["Content-Type"],
};

const app = express();
app.use(cors(corsOptions)); // Activer CORS avec les options spécifiées

// Route 1 : Récupérer les noms de toutes les queues d'ActiveMQ
app.get("/queues", async (req, res) => {
  try {
    console.log("Récupération de la liste des queues...");
    // Appel à l'API Jolokia pour obtenir les informations sur les queues ActiveMQ
    const response = await axios.get(
      `${ACTIVE_MQ_BROKER_URL}/read/org.apache.activemq:type=Broker,brokerName=localhost,destinationType=Queue,destinationName=*`,
      {
        auth: {
          username: ACTIVE_MQ_USER, // Authentification avec le nom d'utilisateur
          password: ACTIVE_MQ_PASSWORD, // Authentification avec le mot de passe
        },
      }
    );

    const queues = response.data.value; // Extraire les données des queues
    // Extraire les noms des queues à partir des clés renvoyées par l'API
    const queueNames = Object.keys(queues).map(
      (key) =>
        key
          .split(",")
          .find((part) => part.includes("destinationName=")) // Rechercher la partie qui contient "destinationName="
          .split("=")[1] // Extraire le nom de la queue
    );

    console.log("Queues récupérées:", queueNames);
    res.json(queueNames); // Renvoyer les noms des queues en réponse au client
  } catch (error) {
    console.error("Erreur lors de la récupération des queues:", error.message);
    res.status(500).send("Erreur lors de la récupération des queues"); // Envoyer un statut 500 en cas d'erreur
  }
});

// Route 2 : Récupérer les messages d'une queue spécifique via STOMP (Streaming Text Oriented Messaging Protocol)
app.get("/queues/:queueName/messages", (req, res) => {
  const queueName = req.params.queueName; // Récupérer le nom de la queue à partir des paramètres de la requête
  console.log(`Demande de messages pour la queue: ${queueName}`);

  // Définir les headers pour les Server-Sent Events (SSE)
  res.setHeader("Content-Type", "text/event-stream"); // Indiquer que la réponse sera un flux SSE
  res.setHeader("Cache-Control", "no-cache"); // Désactiver la mise en cache
  res.setHeader("Connection", "keep-alive"); // Maintenir la connexion active

  // Connexion à ActiveMQ avec le protocole STOMP
  const connectOptions = {
    host: "localhost", // Adresse du broker ActiveMQ
    port: 61613, // Port par défaut pour les connexions STOMP
    connectHeaders: {
      host: "/", // Hôte cible (par défaut, root)
      login: ACTIVE_MQ_USER, // Nom d'utilisateur pour la connexion
      passcode: ACTIVE_MQ_PASSWORD, // Mot de passe pour la connexion
      "heart-beat": "5000,5000", // Configuration des battements de cœur pour STOMP (client/server)
    },
  };

  // Se connecter à ActiveMQ
  stompit.connect(connectOptions, (error, client) => {
    if (error) {
      console.error("Erreur de connexion à ActiveMQ:", error.message);
      return res.status(500).send("Erreur de connexion à ActiveMQ"); // Renvoyer un statut 500 en cas d'erreur de connexion
    }
    console.log("Connexion à ActiveMQ établie");

    // S'abonner à la queue spécifique pour recevoir les messages
    client.subscribe(
      { destination: `/queue/${queueName}`, ack: "auto" }, // Destination : queue spécifiée, accusé automatique des messages
      (error, message) => {
        if (error) {
          console.error(
            "Erreur lors de la souscription à la queue:",
            error.message
          );
          return res
            .status(500)
            .send("Erreur lors de la souscription à la queue"); // Renvoyer un statut 500 en cas d'erreur de souscription
        }

        console.log(`Souscription réussie à la queue: ${queueName}`);

        // Lire le message reçu au format UTF-8
        message.readString("UTF-8", (error, body) => {
          if (error) {
            console.error(
              "Erreur lors de la lecture du message:",
              error.message
            );
            return res.status(500).send("Erreur lors de la lecture du message"); // Renvoyer un statut 500 en cas d'erreur de lecture
          }

          console.log(`Message reçu pour la file ${queueName}:`, body);

          // Envoyer chaque message sous forme d'événement SSE au client
          res.write(`data: ${JSON.stringify({ message: body })}\n\n`);
        });
      }
    );
  });

  // Gérer la déconnexion du client (optionnel)
  // req.on("close", () => {
  //   console.log(`Client déconnecté de la queue: ${queueName}`);
  //   if (client) {
  //     client.disconnect(); // Fermer la connexion STOMP si le client se déconnecte
  //   }
  // });
});

// Démarrer le serveur Express sur le port spécifié
app.listen(port, "0.0.0.0", () => {
  const interfaces = os.networkInterfaces();
  const addresses = Object.values(interfaces)
    .flat()
    .filter((iface) => iface.family === "IPv4" && !iface.internal)
    .map((iface) => iface.address);

  console.log(`API accessible sur :`);
  addresses.forEach((address) => {
    console.log(`http://${address}:${port}`);
  });
});
