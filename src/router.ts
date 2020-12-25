/**
 * @author Chad Koslovsky <chad@technomancy.it>
 * @file Description
 * @desc Created on 2020-06-11 11:43:28 pm
 * @copyright TechnomancyIT
 */
"use strict";

import path from "path";
import fs from "fs";
import { Router } from "express";

export function router(router: Router, app: any) {
  const routesDirectory = `${__dirname}/routes`;
  const routes = fs.readdirSync(routesDirectory, "utf-8");

  routes.map((route) => require(`${routesDirectory}/${route}`)(router));

  router.use(function timeLog(req: any, res: any, next: any) {
    const filename = path.basename(req.url);
    const extension = path.extname(filename);
    const ip = req.clientIp;

    if (!extension && ip !== "::1") {
      // logger.log('info', {
      //   label: 'Express Service',
      //   message: 'Connected',
      //   extra: ip,
      // });
    }
    next();
  });
  app.use("", router);
}
