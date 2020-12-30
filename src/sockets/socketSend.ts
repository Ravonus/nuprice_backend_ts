import { Server, Socket } from "socket.io";

module.exports = (io: Server, client: Socket) => {
  return client.on("socketSend", (obj) => {
    let type = obj.type;
    let id = obj.data;

    if (type === "chatRequest") client.join(id);

    io.to(id).emit("socketSend", { type, name: obj.name });
  });
};
