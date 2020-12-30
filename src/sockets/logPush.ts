import { Server, Socket } from "socket.io";

module.exports = (io: Server, client: Socket) => {
  return client.on("logPush", async (data) => {
    io.to(data.id).emit("logPush", {
      data: data.data,
      id: client.id,
      type: data.type,
    });
  });
};
