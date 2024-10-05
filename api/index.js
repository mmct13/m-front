const express = require("express");
const axios = require("axios");
const cors = require("cors");
const stompit = require("stompit");
const port = 3001;

const ACTIVE_MQ_USER = "admin";
const ACTIVE_MQ_PASSWORD = "admin";
const ACTIVE_MQ_BROKER_URL = "http://localhost:8161/api/jolokia";

const corsOptions = {
  origin: "http://localhost:3000",
  methods: "GET",
  allowedHeaders: ["Content-Type"],
};

const app = express();
app.use(cors(corsOptions));

// Route 1 : Récupérer les noms de toutes les queues
app.get("/queues", async (req, res) => {
  try {
    console.log("Récupération de la liste des queues...");
    const response = await axios.get(
      `${ACTIVE_MQ_BROKER_URL}/read/org.apache.activemq:type=Broker,brokerName=localhost,destinationType=Queue,destinationName=*`,
      {
        auth: {
          username: ACTIVE_MQ_USER,
          password: ACTIVE_MQ_PASSWORD,
        },
      }
    );

    const queues = response.data.value;
    const queueNames = Object.keys(queues).map(
      (key) =>
        key
          .split(",")
          .find((part) => part.includes("destinationName="))
          .split("=")[1]
    );

    console.log("Queues récupérées:", queueNames);
    res.json(queueNames);
  } catch (error) {
    console.error("Erreur lors de la récupération des queues:", error.message);
    res.status(500).send("Erreur lors de la récupération des queues");
  }
});

// Route 2 : Récupérer les messages d'une queue spécifique via STOMP
app.get("/queues/:queueName/messages", (req, res) => {
  const queueName = req.params.queueName;
  console.log(`Demande de messages pour la queue: ${queueName}`);

  // Définir les headers pour SSE
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  // Connexion à ActiveMQ avec STOMP
  const connectOptions = {
    host: "localhost",
    port: 61613, // Port par défaut pour STOMP
    connectHeaders: {
      host: "/",
      login: ACTIVE_MQ_USER,
      passcode: ACTIVE_MQ_PASSWORD,
      "heart-beat": "5000,5000",
    },
  };

  stompit.connect(connectOptions, (error, client) => {
    if (error) {
      console.error("Erreur de connexion à ActiveMQ:", error.message);
      return res.status(500).send("Erreur de connexion à ActiveMQ");
    }
    console.log("Connexion à ActiveMQ établie");

    // S'abonner à la queue spécifique
    client.subscribe(
      { destination: `/queue/${queueName}`, ack: "auto" },
      (error, message) => {
        if (error) {
          console.error(
            "Erreur lors de la souscription à la queue:",
            error.message
          );
          return res
            .status(500)
            .send("Erreur lors de la souscription à la queue");
        }

        console.log(`Souscription réussie à la queue: ${queueName}`);

        message.readString("UTF-8", (error, body) => {
          if (error) {
            console.error(
              "Erreur lors de la lecture du message:",
              error.message
            );
            return res.status(500).send("Erreur lors de la lecture du message");
          }

          console.log(`Message reçu pour la file ${queueName}:`, body);

          // Envoyer chaque message en tant qu'événement SSE
          res.write(`data: ${JSON.stringify({ message: body })}\n\n`);
        });
      }
    );
  });

  // Gérer la déconnexion du client
  // req.on("close", () => {
  //   console.log(`Client déconnecté de la queue: ${queueName}`);
  //   if (client) {
  //     client.disconnect();
  //   }
  // });
});

app.listen(port, () => {
  console.log(`API en écoute sur http://localhost:${port}`);
});