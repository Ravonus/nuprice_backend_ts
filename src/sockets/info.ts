import { Server, Socket } from "socket.io";
import geoip = require("geoip-lite");
import { connection } from "../database";
import { asyncForEach } from "../modules/asyncForEach";

const { NuPriceClient } = connection().models;

module.exports = (io: Server, client: any) => {
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

    await NuPriceClient.create(nuPriceClient).catch((e) =>
      e.parent.code === "23505"
        ? NuPriceClient.update(nuPriceClient, {
            where: { deviceSerial: device.specs.baseboard.serial },
          }).catch((e) => {})
        : null
    );

    const NuPriceClients: any = await NuPriceClient.findAndCountAll().catch(
      (e) => {
        console.log(e);
      }
    );

    await asyncForEach(NuPriceClients.rows, async (client: any, i: number) => {
      const user = await client.getUser();
      delete user.dataValues.sockets;
      delete client.dataValues.userId;
      client.dataValues.user = user.dataValues;
    });

    client.to("liveStats").emit("app", {
      [client.id]: NuPriceClients,
    });
  });
};
