import express from "express";
import path from "path";
import geckos from "@geckos.io/server";

const io = geckos();
const app = express();
const port = 420;
const http = require("http");
const server = http.createServer(app);

function startExpress() {
  app.set("views", path.join(__dirname, "../", "/frontend/views"));
  app.set("view engine", "ejs");
  app.use(
    "/public",
    express.static(path.join(__dirname, "../", "frontend/public/"))
  );

  app.get("/", (req, res) => {
    res.render(path.join(__dirname, "../", "/frontend/views", "index"));
  });

  app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
  });

  io.onConnection((channel) => {
    channel.onDisconnect(() => {
      console.log(`${channel.id} got disconnected`);
    });

    channel.on("chat message", (data) => {
      console.log(`got ${data} from "chat message"`);
      // emit the "chat message" data to all channels in the same room
      io.room(channel.roomId).emit("chat message", data);
    });
  });
}

export const grabExpress = () => express;
export default startExpress;
