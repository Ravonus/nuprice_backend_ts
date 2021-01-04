/**
 * @author Chad Koslovsky <chad@technomnancy.it>
 * @file Description
 * @desc Created on 2020-10-08 10:32:39 pm
 * @copyright TechnomancyIT
 */
import { Socket, Server } from "socket.io";
import { connection } from "../database";

const Message = connection().models.message;

module.exports = async (io: Server, client: any) => {
  return client.on("chat", async (data: any) => {
    if (data.firstRequest) {
      const messages = await Message.findAll({
        where: { ticketId: data.ticket },
      }).catch((e) => {});
      console.log(messages);
    }

    data.fullName = client.request.user.fullName;
    data.room = data.room || client.request.user.username;

    client.to(data.id).emit("chat", data);
  });
};
