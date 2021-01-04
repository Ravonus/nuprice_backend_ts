import dayjs from "dayjs";
import { Response } from "express";
import { grabModels } from "../database";
import { Op } from "sequelize";
import needle from "needle";

let Payment: any;
let User: any;
let Device: any;

(async () => {
  const models = await grabModels();
  Payment = models.Payment;
  User = models.User;
  Device = models.Device;
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

export async function subscriptionCheck(
  req: any,
  res: Response,
  returnData?: boolean,
  skipDevice?: boolean
) {
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
      if (returnData) return { subscription: true };
      else {
        if (!req.user.dataValues.addons["Multi-Device"]) {
          if (!req.body.device)
            return res
              .status(500)
              .send(JSON.stringify({ error: "Need device" }));
          const where = {
            userId: req.user.id,
            ...req.body.device,
          };

          const device = await Device.findOne({
            where,
          });

          if (device)
            return res.end(
              JSON.stringify({
                subscription: true,
                addons: Object.keys(req.user.addons).reduce(
                  (obj: any, item: any) => Object.assign(obj, { [item]: true }),
                  {}
                ),
              })
            );
          else
            return res.status(402).send(
              JSON.stringify({
                error: "Payment required",
                reason:
                  "This device is not authorized. Upgrade to multi user mode",
              })
            );
        }

        if (req.user.dataValues.addons["Multi-Device"])
          return res.end(
            JSON.stringify({
              subscription: true,
              addons: Object.keys(req.user.addons).reduce(
                (obj: any, item: any) => Object.assign(obj, { [item]: true }),
                {}
              ),
            })
          );
      }
    } else {
      if (returnData) return { subscription: false };
      else return res.status(500).json({ subscription: false });
    }
  }
}
