import express from "express";
import path from "path";
import bodyParser from "body-parser";
import session from "express-session";
import passport from "passport";
import cookieParser from "cookie-parser";
import { fp } from "./fingerprint";
import { router } from "./router";
import grabConf from "../config/config";
import { grabModels, connection } from "./database";
import fileUpload from "express-fileupload";
import { Op } from "sequelize";

const SessionStore = require("./modules/sessionStore/express-session-sequelize.js")(
  session.Store
);
const db = connection();

const sequelizeSessionStore = new SessionStore({
  db,
});

const flash = require("req-flash");
const { cookieName } = grabConf();
const app = express();
const port = 1337;
const http = require("http");
const server = http.createServer(app);
const logo: any = {};

let firstRun = true;

export const appGrab = () => app;

// sequelizeSessionStore.options.db.models.Session.belongsTo(
//   sequelizeSessionStore.options.db.models.User
// );
// sequelizeSessionStore.options.db.models.User.hasMany(
//   sequelizeSessionStore.options.db.models.Session
// );

// {"cookie":{"originalMaxAge":315359996610,"expires":"2030-12-27T03:03:02.591Z","httpOnly":true,"path":"/"},"_flash":{},"expires":"2030-12-27T03:03:02.591Z","passport":{"user":"chadkoslovsky@gmail.com"}}

// const where = {
//   data: {
//     [Op.contains]: {
//       passport: {
//         user: "chadkoslovsky@gmail.com",
//       },
//     },
//   },
// };

// db.models.Session.findAll({ where: where })
//   .then((data) => {

//   })
//   .catch((e) => console.log(e));

async function startExpress() {
  if (!firstRun) {
    return app;
    return;
  }
  firstRun = false;
  const { User } = await grabModels();
  const expressSession = session({
    name: cookieName,
    secret: cookieName,
    store: sequelizeSessionStore,
    cookie: { expires: new Date(Date.now() + 3600 * 1000 * 24 * 365 * 10) },
    saveUninitialized: false,
    resave: true,
  });

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(expressSession);

  app.use(
    fileUpload({
      limits: { fileSize: 50 * 1024 * 1024 },
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());
  fp(app);
  app.use(flash());
  const strategy = User.createStrategy();
  strategy._verify = async function (
    username: string,
    password: string,
    cb: any
  ) {
    let err;
    const user = await User.findOne({ where: { username } }).catch(
      (e: any) => (err = e)
    );

    if (!user) {
      return cb(null, false, { message: "Incorrect username" });
    } else {
      const auth = await user.authenticate(password, user.password);
      const groups = await user.getGroups();

      user.groups = groups;

      if (auth) return cb(null, user);
      else return cb(null, false, { message: "Incorrect username" });
    }
  };

  passport.use(strategy);

  passport.serializeUser(User.serializeUser());

  //TODO: fix this so it doees not do lookup a bunch hrrm
  passport.deserializeUser(async function (username, cb) {
    const user = await User.findOne({ where: { username } }).catch((e: Error) =>
      console.log(e)
    );
    user.dataValues.groups = await user.getGroups();
    cb(null, user);
  });
  app.set("views", path.join(__dirname, "../", "/frontend/views"));
  app.set("view engine", "ejs");
  app.use(express.static(path.join(__dirname, "../", "frontend/public/")));

  app.get("/", (req, res) => {
    res.render(path.join(__dirname, "../", "/frontend/views", "index"));
  });
  const Router = express.Router();
  router(Router, app);

  server.listen(port);
  return app;
}

export function grabServer() {
  return server;
}

export function expressApp() {
  return express;
}
export default startExpress;
