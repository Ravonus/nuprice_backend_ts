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

  if (key === "Session") {
    mod.belongsTo(models.User);
  }
  if (key === "Group") {
    mod.belongsToMany(models.User, { through: "groupUsers" });
  }

  if (key === "User") {
    mod.hasMany(models.Session);
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
  console.log("AD");
  return sequelize;
}
