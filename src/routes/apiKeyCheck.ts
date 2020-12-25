import { Router } from "express";
import passport from "passport";

const crypt = require("../modules/crypt");

let pathSet = "/apiKeyCheck";

function route(router: Router) {
  router.post(
    pathSet,
    passport.authenticate("local", { session: true }),

    async function (req: any, res: any) {
      res.setHeader("Content-Type", "application/json");

      if (req.useragent.source !== "NuPrice Desktop Client")
        return res.sendStatus(500);

      let body = req.body;

      // if (body.setKey) {

      //   return res.end(
      //     JSON.stringify({
      //       ...eKey,
      //       ...{
      //         name: doc.fullName,
      //         email: doc.email,
      //         speeds: doc.speeds,
      //         API: doc.API,
      //         apiSet: true,
      //       },
      //     })
      //   );
      // }

      res.end(JSON.stringify(req.user));
    }
  );
}

module.exports = route;

//server.use('/', passport.authenticate(['jwt', 'cookie'], { session: false }), router);
