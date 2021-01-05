import { Server, Socket } from "socket.io";
import { connection } from "../database";
import { asyncForEach } from "../modules/asyncForEach";

const { AddonUsers, user, addon } = connection().models;
const User = user;
const Addon = addon;

module.exports = (io: Server, client: Socket | any) => {
  return client.on("addons", async (data: any) => {
    if (client.rooms.has("administrator") || client.rooms.has("moderator")) {
      io.to(client.id).emit("addons", data.value);

      if (data.action === "select-option") {
        AddonUsers.create({ userId: data.id, addonId: data.option.value });
      } else {
        AddonUsers.destroy({
          where: { userId: data.id, addonId: data.removedValue.value },
        });
      }

      const addonIds = data.value.map((obj: any) => obj.value);

      console.log(addonIds);

      let addons = await Addon.findAll({ where: { id: addonIds } });
      addons = addons.reduce(
        (obj: any, item: any) => Object.assign(obj, { [item.name]: true }),
        {}
      );

      console.log(addons, data.sid);

      io.to(data.sid).emit("addons", addons);
    }
  });
};
