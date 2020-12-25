/**
 * @author Chad Koslovsky <chad@technomancy.it>
 * @file This is the route that sets up the database and storage for a default setup.
 * @desc Created on 2020-06-26 3:57:19 pm
 * @copyright TechnomancyIT
 */

import { Router } from "express";
import needle from "needle";
import dayjs from "dayjs";
import { isAuthenticated } from "../middleware/express/isAuthenticated";
import { grabModels } from "../database";
import { Op } from "sequelize";

let Payment: any;
let User: any;

(async () => {
  const models = await grabModels();
  Payment = models.Payment;
  User = models.User;
})();

async function invoice(info: any, userId: string, where: any, jsdate: any) {
  const payment = await Payment.findOne({ where }).catch((e: any) => e);

  if (!payment) {
    Payment.create({
      type: "gumroad",
      plan: 1,
      userId,
      affiliate: info.purchase?.affilate,
      price: info.purchase.price,
      fee: info.purchase.gumroad_fee,
      disputed: info.purchase?.disputed,
      paymentDate:
        info.purchase.recurrence === "yearly"
          ? jsdate.subtract(1, "year")
          : jsdate.subtract(1, "month"),
      refunded: info.purchase?.refunded,
    }).catch((e: any) => console.log(e));
    User.update(
      { expirationDate: jsdate.toISOString() },
      { where: { id: userId } }
    ).catch((e: any) => console.log(e));
  }
}

function route(router: Router) {
  isAuthenticated(router, "/subscription"),
    router.get("/subscription", async function (req: any, res: any) {
      if (req.user.key) {
        const gumroad: any = await needle(
          "post",
          `https://api.gumroad.com/v2/licenses/verify?product_permalink=get-nuprice&license_key=${req.user.key}`,
          { json: true }
        ).catch((e) => {
          console.log(e);
        });
        const info = gumroad.body;

        if (info.success && !info.subscription_cancelled_at) {
          let salesDate = dayjs(info.purchase.sale_timestamp);

          if (info.purchase.recurrence === "yearly") {
            let oneYear = salesDate.add(1, "year");
            salesDate = salesDate.year(dayjs().year());
            oneYear = salesDate.add(1, "year");

            const where = {
              userId: req.user.id,
              type: "gumroad",
              plan: 1,
              createdAt: {
                [Op.between]: [salesDate.toISOString(), oneYear.toISOString()],
              },
            };

            invoice(info, req.user.id, where, oneYear);
          } else {
            salesDate = salesDate.month(dayjs().month());
            salesDate = salesDate.year(dayjs().year());
            const oneMonth = salesDate.add(1, "month");
            const where = {
              userId: req.user.id,
              type: "gumroad",
              plan: 1,
              createdAt: {
                [Op.between]: [salesDate.toISOString(), oneMonth.toISOString()],
              },
            };

            invoice(info, req.user.id, where, oneMonth);
          }

          return res.end(JSON.stringify({ subscription: true }));
        }
      }

      res.status(402).send("Payment required");

      res.end(JSON.stringify(req.user));
    });
}

module.exports = route;
