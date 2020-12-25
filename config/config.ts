import config from "./setup.json";

export default function setup() {
  if (!process.env.NODE_ENV) process.env.NODE_ENV = config.env || "production";

  config.database.host =
    process.env.np_host || config.database.host || "localhost";

  config.database.port =
    Number(process.env.np_port) || config.database.port || 5432;

  config.database.pw = process.env.np_pw || config.database.pw || "";
  config.database.db = process.env.np_db || config.database.db || "database";
  config.database.user = process.env.np_user || process.env.np_db || config.database.user || config.database.db

  return config;
}
