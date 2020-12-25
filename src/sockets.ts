import { Socket, Server } from "socket.io";
import fs from "fs";
import { Join } from "../interfaces/sockets";
import { grabServer } from "./server";
import { debug, logger } from "./modules/logger";

const http = grabServer();

const allowedOrigins = "*";

let server: any;

const io = new Server(http, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    allowedHeaders: ["nuprice"],
  },
});

interface Sockets extends Socket {
  user: {
    _id: string;
  };
}
const mainDir = `${__dirname}/sockets`;
const socketDir = fs.readdirSync(mainDir);

export function startSocketServer() {
  io.on("connection", async function (socket: any) {
    debug.log("info", {
      label: "Notification",
      message: `Socket client connected`,
      extra: ` :on ${socket.id}`,
    });
    socketDir.map((file) => require(`${mainDir}/${file}`)(io, socket));
  });

  return io;
}
