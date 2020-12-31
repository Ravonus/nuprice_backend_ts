import { Server, Socket } from "socket.io";

module.exports = (io: Server, client: Socket) => {
  return client.on("join", (obj) => {
    obj = obj.room;

    if (obj.type === "navigation") io.to(client.id).emit("app", {});

    client.join(obj.page);
  });
};
