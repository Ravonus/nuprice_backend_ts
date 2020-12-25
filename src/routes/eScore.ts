import { Router } from "express";

import passport from "passport";

import { MWS_book_feed } from "../controllers/eScoreMysql";
import { isAuthenticated } from "../middleware/express/isAuthenticated";

function route(router: Router) {
  isAuthenticated(router, "/apiRoutes/eScore"),
    router.route("/apiRoutes/eScore").post(async (req, res) => {
      if (!req.body.asin) return res.end(JSON.stringify({}));

      res.setHeader("Content-Type", "application/json");

      MWS_book_feed.findAll({
        where: { asin: req.body.asin },
        raw: true,
      }).then((project: any) => {
        console.log(project);
        return res.end(JSON.stringify(project, null, 3));
      });
    });
}

module.exports = route;

//server.use('/', passport.authenticate(['jwt', 'cookie'], { session: false }), router);
