import { Router, Request, Response } from "express";
import { isAuthenticated } from "../middleware/express/isAuthenticated";
import config from "../../config/main.json";
import { isSubscribed } from "../middleware/express/isSubscribed";

const crypt = require("../modules/crypt");

function route(router: Router) {
  isAuthenticated(router, "/grabProxyCreds"),
    isSubscribed(router, "/grabProxyCreds");
  router.route("/grabProxyCreds").post(async (req: Request, res: Response) => {
    let eProxy = await crypt.encrypt(
      req.cookies.nuprice,
      config.NuPrice.proxyInfo,
      "1d0a8SsI4dja0dhhjdDydhad12Dd944Hdad32DA3SD4er"
    );
    res.send(eProxy);
  });
}

module.exports = route;

//server.use('/', passport.authenticate(['jwt', 'cookie'], { session: false }), router);
