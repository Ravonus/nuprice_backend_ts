import { Sequelize, Model, DataTypes } from "sequelize";
import fs from "fs";
import path from "path";

import configGrab from "../config/config";
import { wait } from "./modules/wait";

const { host, db, user, port, pw } = configGrab().database;

const sequelize = new Sequelize(
  `postgres://${user}:${pw}@${host}:${port}/${db}`
);
const modelDirectory = `${__dirname}/models`;
const modelsFileList: string[] = fs.readdirSync(modelDirectory, "utf-8");
const models: any = {};

let loaded = false;

modelsFileList.map((model) => {
  models[model.slice(0, -3)] = require(`${modelDirectory}/${model}`)(sequelize);
});

Object.keys(models).map((key: string) => {
  const mod = models[key];

  // if (key === "Session") {
  //   mod.belongsTo(models.User);
  // }

  if (key === "Device") {
    mod.belongsTo(models.User);
  }

  if (key === "Ticket") {
    mod.belongsTo(models.User);
    mod.belongsToMany(models.User, { through: "ticketUsers" });
  }

  if (key === "Message") {
    mod.belongsTo(models.User);
    mod.belongsToMany(models.User, { through: "MessageUsers" });
  }

  if (key === "Group") {
    mod.belongsToMany(models.User, { through: "groupUsers" });
  }

  if (key === "Payment") {
    mod.belongsTo(models.User);
  }

  if (key === "NuPriceClient") {
    mod.belongsTo(models.User);
    mod.belongsTo(models.Device);
  }

  if (key === "User") {
    // mod.hasMany(models.Session);
    mod.hasMany(models.Payment);
    mod.hasMany(models.Device);
    mod.belongsToMany(models.Ticket, { through: "TicketUsers" });
    mod.belongsToMany(models.Message, { through: "MessageUsers" });
    mod.belongsToMany(models.Group, { through: "groupUsers" });
  }
});
(async () => {
  await sequelize.sync();
  loaded = true;
})();

export async function grabModels() {
  if (!loaded) {
    await wait(100);
    await grabModels();
    return models;
  } else return models;
}

export function connection() {
  return sequelize;
}
