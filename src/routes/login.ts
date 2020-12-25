/**
 * @author Chad Koslovsky <chad@technomancy.it>
 * @file This is the route that sets up the database and storage for a default setup.
 * @desc Created on 2020-06-26 3:57:19 pm
 * @copyright TechnomancyIT
 */

import { Router } from "express";
import passport from "passport";

function route(router: Router) {
  router.post(
    "/login",
    passport.authenticate("local", { session: true }),

    async function (req: any, res: any) {
      res.setHeader("Content-Type", "application/json");

      res.end(JSON.stringify(req.user));
    }
  );
}

module.exports = route;
