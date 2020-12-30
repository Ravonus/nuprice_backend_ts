import { Socket } from "socket.io";
import geoip = require("geoip-lite");

const addressInfo = {};

module.exports = (client: Socket, noAuth: boolean) => {
  return client.on("info", async (data) => {
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

    client.to("liveStats").emit("app", {
      [client.id]: addressInfo,
    });
  });
};
