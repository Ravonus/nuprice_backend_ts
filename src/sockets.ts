import { Socket, Server } from "socket.io";
import fs from "fs";
import { Join } from "../interfaces/sockets";
import { grabServer } from "./server";
import { debug, logger } from "./modules/logger";
import { connection, grabModels } from "./database";
import sequelize from "sequelize";

// import cookieParserSocket from "./modules/socketAuth";
const cookieParser = require("socket.io-cookie-parser");
const http = grabServer();

const allowedOrigins = "*";

let server: any;

export let appClients = { keys: {} };

const io = new Server(http, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
  },
});

let Session: any;

interface Sockets extends Socket {
  user: {
    _id: string;
  };
}
const mainDir = `${__dirname}/sockets`;
const socketDir = fs.readdirSync(mainDir);
const db = connection();
const User = db.models.user;

async function authorization(socket: any, next: any) {
  if (!socket.request.cookies.nuprice) return socket.disconnect();

  const session_id = socket.request.cookies.nuprice.substring(2).split(".")[0];

  let session: any = await db.models.Session.findOne({
    where: { session_id },
  }).catch((e) => {
    e;
  });

  if (!session) return socket.disconnect();

  const username = session.dataValues.data.passport.user;

  console.log("USERNA<ME", username);

  let user: any = await db.models.user
    .findOne({ where: { username } })
    .catch((e) => {
      console.log(e);
    });

  socket.request.user = user.dataValues;

  if (!user) return socket.disconnect();

  console.log(user.sockets, socket.id, "TERD");

  if (user.sockets) {
    user.sockets = sequelize.fn(
      "array_append",
      sequelize.col("sockets"),
      socket.id
    );
  } else user.sockets = [socket.id];

  user.save();

  next();
}

export function startSocketServer() {
  io.use(cookieParser());
  io.use(authorization);
  // io.use(require("../controllers/socketAuth"));

  io.on("connection", async function (socket: any) {
    debug.log("info", {
      label: "Notification",
      message: `Socket client connected`,
      extra: ` :on ${socket.id}`,
    });
    socketDir.map((file) => {
      if (file !== "chatfiles") require(`${mainDir}/${file}`)(io, socket);
    });
  });

  return io;
}
