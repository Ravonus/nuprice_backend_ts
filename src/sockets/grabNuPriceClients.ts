import { Server, Socket } from "socket.io";

const grabNuPriceSocketClients = require("./info");

module.exports = (io: Server, client: Socket | any) => {
  return client.on("nuPriceClients", async () => {
    if (client.rooms.has("administrator") || client.rooms.has("moderator")) {
      console.log("RAN", grabNuPriceSocketClients());

      io.to(client.id).emit("nuPriceClients", grabNuPriceSocketClients());
    }
  });
};
