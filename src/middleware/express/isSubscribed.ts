import dayjs from "dayjs";
import { Router } from "express";
import { subscriptionCheck } from "../../modules/checkGumroadSub";

export function isSubscribed(router: Router, path: string) {
  return router.use(path, async function (req: any, res: any, next: any) {
    let gumroad: any;
    if (req.user.key) gumroad = await subscriptionCheck(req, res, true, true);
    else {
      const expired = dayjs().diff(req.user.expirationDate, "ms");
      if (expired > 0)
        return res.status(402).send(
          JSON.stringify({
            error: "Payment required",
            reason: "This request requires active subscription.",
          })
        );
      else return next("route");
    }

    if (gumroad && gumroad.subscription) return next("route");
  });
}
