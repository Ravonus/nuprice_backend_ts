import express from "express";
import path from "path";
import bodyParser from "body-parser";
import session from "express-session";
import passport from "passport";
import cookieParser from "cookie-parser";

import { fp } from "./fingerprint";
import { router } from "./router";
import grabConf from "../config/config";
import { grabModels } from "./database";

const flash = require("req-flash");
const { cookieName } = grabConf();
const app = express();
const port = 1337;
const http = require("http");
const server = http.createServer(app);
const logo: any = {};

let firstRun = true;

export const appGrab = () => app;

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
    resave: false,
    saveUninitialized: false,
  });
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(expressSession);
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
      if (auth) return cb(null, user);
      else return cb(null, false, { message: "Incorrect username" });
    }
  };

  passport.use(strategy);
  passport.serializeUser(User.serializeUser());

  //TODO: fix this so it doees not do lookup a bunch hrrm
  passport.deserializeUser(User.deserializeUser());
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
