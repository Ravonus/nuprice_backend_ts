import { Server, Socket } from "socket.io";
import { connection } from "../database";
import { appClients } from "../sockets";
import sequelize from "sequelize";

const User = connection().models.user;
const NuPriceClient = connection().models.NuPriceClient;

module.exports = (io: Server, client: Socket | any) => {
  return client.on("disconnect", async () => {
    io.in("liveStats").emit("app", { id: client.id, type: "delete" });

    const user: any = await User.findOne({
      where: { id: client.request.user.id },
    }).catch((e) => {
      console.log(e);
    });

    if (!user) return;

    user.sockets = user.sockets.filter(
      (socket: string) => socket !== client.id
    );

    user.save();

    NuPriceClient.destroy({ where: { userId: user.id } });
  });
};
