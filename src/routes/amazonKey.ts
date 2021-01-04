/**
 * @author Chad Koslovsky <chad@technomancy.it>
 * @file This is the route that sets up the database and storage for a default setup.
 * @desc Created on 2020-06-26 3:57:19 pm
 * @copyright TechnomancyIT
 */

import { Router } from "express";
import { isAuthenticated } from "../middleware/express/isAuthenticated";
import { encrypt } from "../modules/crypt";
import main from "../../config/main.json";

function route(router: Router) {
  isAuthenticated(router, "/amzGrab"),
    router.post("/amzGrab", async function (req: any, res: any) {
      let eProxy = await encrypt(
        req.authCode,
        main.NuPrice.amazonSecret,
        "1d0a8SsI4dja0dhhjdDydhad12Dd944Hdad32DA3SD4er"
      );

      res.end(JSON.stringify(eProxy));
    });
}

module.exports = route;
