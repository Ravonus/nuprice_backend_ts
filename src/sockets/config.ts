import { Server, Socket } from "socket.io";
import { connection } from "../database";
import { asyncForEach } from "../modules/asyncForEach";

const { AddonUsers, user, addon } = connection().models;
const User = user;
const Addon = addon;

module.exports = (io: Server, client: Socket | any) => {
  return client.on("config", async (data: any) => {
    if (client.rooms.has("administrator") || client.rooms.has("moderator")) {

      io.to(data.sid).emit("config", data.config);
    }
  });
};
