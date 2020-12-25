import path from "path";
import fs from "fs";
import { Router, Response } from "express";
import { isAuthenticated } from "../middleware/express/isAuthenticated";

function route(router: Router) {
  isAuthenticated(router, "/updateCheck"),
    router.route("/updateCheck").get(async (req: any, res: Response) => {
      if (!req.query.v) return res.send("need version");
      if (!req.query.t) return res.send("need type");

      let conf: any = await fs.readFileSync(
        path.join(__dirname, "../../", "config", "main.json"),
        "utf8"
      );
      conf = JSON.parse(conf);
      console.log(conf);
      let version: string;
      if (conf.NuPrice.versions) version = conf.NuPrice.versions[req.query.t];

      if (version !== req.query.v) res.send(`${true}, v:${version}`);
      else res.send(false);
    });
}

module.exports = route;
