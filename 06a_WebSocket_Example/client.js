import { WebSocket } from "ws";

const websocketClient = new WebSocket("ws://localhost:8080");

websocketClient.on("open", () => {
  websocketClient.send("Sending a client message");

  websocketClient.on("message", (message) => {
    console.log(`Received a message from the server: ${message}`);
  });
});