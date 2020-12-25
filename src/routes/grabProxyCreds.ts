import { Router, Request, Response } from "express";
import { isAuthenticated } from "../middleware/express/isAuthenticated";
import config from "../../config/main.json";

const crypt = require("../modules/crypt");

function route(router: Router) {
  isAuthenticated(router, "/apiRoutes/grabProxyCreds"),
    router
      .route("/apiRoutes/grabProxyCreds")
      .post(async (req: Request, res: Response) => {
        console.log(req.cookies.nuprice);
        let eProxy = await crypt.encrypt(
          req.cookies.nuprice,
          config.NuPrice.proxyInfo,
          "1d0a8SsI4dja0dhhjdDydhad12Dd944Hdad32DA3SD4er"
        );
        res.send(JSON.stringify(eProxy));
      });
}

module.exports = route;

//server.use('/', passport.authenticate(['jwt', 'cookie'], { session: false }), router);
