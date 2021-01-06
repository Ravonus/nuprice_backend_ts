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
import { grabModels } from "../database";

let Device: any;

(async () => {
  const models = await grabModels();
  Device = models.Device;
})();

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

        if (expired > 0 && !req.body.device) sub = { subscription: false };
        else {


          let newAdd;
          const devices = await Device.findAll({
            where: { userId: req.user.id },
          }).catch((e: any) => e);

          if(devices.length === 0) {
            newAdd = true;
              Device.create({...req.body.device, userId:req.user.id}).catch((e:Error) => {})
          }
          console.log(req.user.dataValues)
          if(req.user.dataValues.addons["Multi-Device"] && !newAdd) {
            let found;
            devices.map((device:any) => {
              if(device.serial === req.body.serial) {  found = true;
                sub = {subscription:true}
              }
            })

            if(!found) Device.create({...req.body.device, main:false, userId:req.user.id}).catch((e:Error) => {});
            sub = {subscription:true}
          } else if(!newAdd) {
            let found;
            devices.map((device:any) => {
                if(device.serial === req.body.serial && device.main) sub = {subscription:true}
            })

          } else {
            sub = {
              error: "Payment required",
              reason: "This device is not authorized. Upgrade to multi user mode",
            };
          }

        }
      }
      req.user.subscription = sub;
      delete req.user.dataValues.gumroad;
      res.end(JSON.stringify({ ...req.user.dataValues, ...sub }));
    }
  );
}

module.exports = route;
