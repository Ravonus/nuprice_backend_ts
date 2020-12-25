/**
 * @author Chad Koslovsky <chad@technomancy.it>
 * @file This is the route that sets up the database and storage for a default setup.
 * @desc Created on 2020-06-26 3:57:19 pm
 * @copyright TechnomancyIT
 */

import { Router } from "express";
import needle from "needle";
import { info } from "winston";
import { isAuthenticated } from "../middleware/express/isAuthenticated";

function route(router: Router) {
  isAuthenticated(router, "/subscription"),
    router.get("/subscription", async function (req: any, res: any) {
      if (req.user.key) {
        const gumroad: any = await needle(
          "post",
          `https://api.gumroad.com/v2/licenses/verify?product_permalink=get-nuprice&license_key=${req.user.key}`,
          { json: true }
        ).catch((e) => {
          console.log(e);
        });
        const info = gumroad.body;
        console.log(info);

        if (info.success && !info.subscription_cancelled_at) {
          return res.end(JSON.stringify({ subscription: true }));
        }
      }

      res.status(402).send("Payment required");

      res.end(JSON.stringify(req.user));
    });
}

module.exports = route;
