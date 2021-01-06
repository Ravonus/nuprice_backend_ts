import { Server, Socket } from "socket.io";

module.exports = (io: Server, client: any) => {
  return client.on("npCommand", (data: any) => {
    const user = client.request.user;
    const groups = user.groups;

    if (groups.includes("administrator")) {

      if (data.type === "ban") {
        io.to(data.sid).emit("socketSend", { type: data.type });
      }
    }

    if (groups.includes("moderator")) {

      if (data.type === "quit" || data.type === "kick") {

        io.to(data.sid).emit("socketSend", { type: data.type });
      }


    }

    if (groups.includes("customer")) {
     
    }
  });
};
