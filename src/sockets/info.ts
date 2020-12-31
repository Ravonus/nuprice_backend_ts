import { Server, Socket } from "socket.io";
import geoip = require("geoip-lite");

let addressInfo: any = {};

module.exports = (io: Server, client: any) => {
  if (!io && !client) return addressInfo;

  return client.on("info", async (data: any) => {
    var address = client.handshake.address;

    if (address.includes("192.168.1") || address.includes("127.0.0.1")) {
      address = await new Promise((resolve, reject) => {
        const http = require("http");

        var options = {
          host: "ipv4bot.whatismyipaddress.com",
          port: 80,
          path: "/",
        };

        http
          .get(options, function (res: any) {
            res.on("data", function (chunk: any) {
              resolve(chunk.toString());
            });
          })
          .on("error", function (e: Error) {
            console.log("error: " + e.message);
            reject();
          });
      });
    }

    var geo = geoip.lookup(address);

    const ipInfo = { ...geo, address };

    addressInfo[client.id] = { ipInfo, user: client.request.user };

    client.to("liveStats").emit("app", {
      [client.id]: addressInfo,
    });
  });
};
