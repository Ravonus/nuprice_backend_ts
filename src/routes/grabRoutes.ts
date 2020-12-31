/**
 * @author Chad Koslovsky <chad@technomancy.it>
 * @file Description
 * @desc Created on 2020-06-27 1:35:03 pm
 * @copyright TechnomancyIT
 */

import { Router, Request, Response } from "express";
import fs from "fs";
import path from "path";

function route(router: Router) {
  router.route("/grabRoutes").post(async (req: Request, res: Response) => {
    const dir = path.join(
      __dirname,
      "../../",
      "frontend/react/src/frontEndRoutes"
    );
    const dirArr = fs.readdirSync(dir);
    let arr: string[] = [];
    dirArr.map((json: string, i: number) => {
      if (json.slice(json.length - 5) === ".json")
        arr = [...arr, JSON.parse(fs.readFileSync(`${dir}/${json}`, "utf8"))];
    });

    res.end(JSON.stringify(arr));
  });
}

module.exports = route;
