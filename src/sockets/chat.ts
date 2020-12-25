/**
 * @author Chad Koslovsky <chad@technomnancy.it>
 * @file Description
 * @desc Created on 2020-10-08 10:32:39 pm
 * @copyright TechnomancyIT
 */
import { Socket, Server } from "socket.io";

module.exports = async (io: Server, client: Socket) => {
  return client.on("chat", async (data) => {
    client.to(data.id).emit("chat", data);
  });
};
