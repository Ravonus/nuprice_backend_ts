import { Server, Socket } from "socket.io";
import { connection } from "../database";
import { asyncForEach } from "../modules/asyncForEach";

const { NuPriceClient } = connection().models;

module.exports = (io: Server, client: Socket | any) => {
  return client.on("nuPriceClients", async () => {
    if (client.rooms.has("administrator") || client.rooms.has("moderator")) {
      const clients: any = await NuPriceClient.findAndCountAll().catch(
        (e) => {}
      );

      await asyncForEach(clients.rows, async (client: any, i: number) => {
        const user = await client.getUser();
        delete user.dataValues.sockets;
        delete client.dataValues.userId;
        client.dataValues.user = user.dataValues;
      });

      io.to(client.id).emit("nuPriceClients", clients.rows);
    }
  });
};
