/**
 * @author Chad Koslovsky <chad@technomancy.it>
 * @file This is the route that sets up the database and storage for a default setup.
 * @desc Created on 2020-06-26 3:57:19 pm
 * @copyright TechnomancyIT
 */

import { Router } from "express";
import { isAuthenticated } from "../middleware/express/isAuthenticated";

function route(router: Router) {
  isAuthenticated(router, "/me"),
    router.get("/me", async function (req: any, res: any) {
      res.end(JSON.stringify(req.user));
    });
}

module.exports = route;
