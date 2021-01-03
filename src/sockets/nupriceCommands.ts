import { Server, Socket } from "socket.io";

module.exports = (io: Server, client: any) => {
  return client.on("npCommand", (data: any) => {
    const user = client.request.user;
    const groups = user.groups;

    if (groups.includes("administrator")) {
      console.log("RUN ADMIN");

      if (data.type === "ban") {
        io.to(data.sid).emit("socketSend", { type: data.type });
      }
    }

    if (groups.includes("moderator")) {
      console.log(data);
      if (data.type === "quit" || data.type === "kick") {
        console.log(data.sid);
        io.to(data.sid).emit("socketSend", { type: data.type });
      }

      console.log("RUN MODERATOR");
    }

    if (groups.includes("customer")) {
      console.log("RUN CUSTOMER");
    }
  });
};
