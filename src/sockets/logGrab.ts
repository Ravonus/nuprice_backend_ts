import { Server, Socket } from "socket.io";

var geoip = require("geoip-lite");

module.exports = (io: Server, client: Socket) => {
  return client.on("logGrab", async (data) => {
    console.log(data);
    io.to(data.sid).emit("logGrab", { type: data.type, id: client.id });
  });
};
