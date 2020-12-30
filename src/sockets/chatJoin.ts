import { Server, Socket } from "socket.io";

module.exports = (io: Server, client: Socket) => {
  return client.on("chatJoin", async (data) => {
    console.log("TEST");
    io.to(data.id).emit("chatJoin", data);
  });
};
