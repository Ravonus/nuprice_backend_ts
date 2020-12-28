/**
 * @author Chad Koslovsky <chad@technomancy.it>
 * @file This is the route that sets up the database and storage for a default setup.
 * @desc Created on 2020-06-26 3:57:19 pm
 * @copyright TechnomancyIT
 */

import { Router } from "express";
import passport from "passport";
import dayjs from "dayjs";
import { subscriptionCheck } from "../modules/checkGumroadSub";

function route(router: Router) {
  router.post(
    "/login",
    passport.authenticate("local", { session: true }),

    async function (req: any, res: any) {
      res.setHeader("Content-Type", "application/json");
      let sub;
      if (req.user.key) sub = await subscriptionCheck(req, res, true);
      else {
        const expired = dayjs().diff(req.user.expirationDate, "ms");

        if (expired > 0) sub = { subscription: false };
        else sub = { subscription: true };
      }

      delete req.user.dataValues.gumroad;
      res.end(JSON.stringify({ ...req.user.dataValues, ...sub }));
    }
  );
}

module.exports = route;
