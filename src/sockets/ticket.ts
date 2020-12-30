import { Server, Socket } from "socket.io";

const fs = require("fs"),
  btoa = require("btoa"),
  path = require("path");

let config = require("../../config/main.json");

function randomStr(len: number, arr: string) {
  var ans = "";
  for (var i = len; i > 0; i--) {
    ans += arr[Math.floor(Math.random() * arr.length)];
  }
  return ans;
}

// global.ticket = config.NuPrice.ticket;

export let ticket = config.NuPrice.ticket;

module.exports = (io: Server, client: Socket) => {
  client.on("eventToEmit", function (data, callback) {
    callback("error", "message");
  });

  return client.on("ticket", async (data: any, callback: any) => {
    ticket++;
    config.NuPrice.ticket = ticket;
    fs.writeFileSync(
      path.join(__dirname, "../../", "config", "main.json"),
      JSON.stringify(config, null, 2)
    );

    callback(null, btoa(ticket).replace(/=/g, randomStr(1, "0123456789")));
  });
};
