import { Server, Socket } from "socket.io";

var geoip = require("geoip-lite");

module.exports = (io: Server, client: Socket) => {
  return client.on("configGrab", async (data) => {
    console.log("thats odd", data.sid);
    io.to(data.sid).emit("configGrab", { sid: client.id, config: data.config });
  });
};
