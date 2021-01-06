import { Server, Socket } from "socket.io";
import geoip = require("geoip-lite");
import { connection } from "../database";
import { asyncForEach } from "../modules/asyncForEach";

const { NuPriceClient } = connection().models;

module.exports = (io: Server, client: any) => {
  if (!client) console.log("RUNZA", io);



  if (client)
    return client.on("info", async (data: any) => {
      console.log("OH ITS NOT EVEN RUNNING")
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
      const device = JSON.parse(data);

      const nuPriceClient = {
        ip: address,
        city: geo.city,
        country: geo.country,
        region: geo.region,
        timezone: geo.timezone,
        socketId: client.id,
        userId: client.request.user.id,
        deviceSerial: device.specs.baseboard.serial,
      };
      console.log(nuPriceClient)
      const npClient: any = await NuPriceClient.create(nuPriceClient).catch(
        async (e) => {
          console.log(e)
          let client;
          e.parent.code === "23505"
            ? (client = await NuPriceClient.update(nuPriceClient, {
                returning: true,
                where: { deviceSerial: device.specs.baseboard.serial },
              }).catch((e) => {
                console.log(e);
              }))
            : null;

          if (client) return client[1][0];
        }
      );

      npClient.dataValues.user = await npClient.getUser();
      delete npClient.dataValues.userId;
      delete npClient.dataValues.user.sockets;

      npClient.version = device.config.version;
      npClient.download = device.config.NuPrice.download;

      io.in("administrator").emit("notification", {
        notificationType: "add",
        doc: [npClient],
      });
    });
};
