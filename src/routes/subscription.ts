/**
 * @author Chad Koslovsky <chad@technomancy.it>
 * @file This is the route that sets up the database and storage for a default setup.
 * @desc Created on 2020-06-26 3:57:19 pm
 * @copyright TechnomancyIT
 */

import { Router } from "express";
import dayjs from "dayjs";
import needle from "needle";

import { isAuthenticated } from "../middleware/express/isAuthenticated";
import { subscriptionCheck } from "../modules/checkGumroadSub";

function route(router: Router) {
  isAuthenticated(router, "/subscription"),
    router.get("/subscription", async function (req: any, res: any) {
      res.setHeader("Content-Type", "application/json");

      if (req.user.key) {
        return subscriptionCheck(req, res);
      }
      const expired = dayjs().diff(req.user.expirationDate, "ms");

      if (expired > 0)
        res.status(402).send(JSON.stringify({ error: "Payment required" }));

      res.end(JSON.stringify({ subscription: true }));
    });
}

module.exports = route;
