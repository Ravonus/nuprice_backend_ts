import { Router } from "express";
import needle from "needle";

export function isAuthenticated(router: Router, path: string) {
  return router.use(path, async function (req: any, res: any, next: any) {
    console.log(req.isAuthenticated());

    if (req.isAuthenticated()) return next("route");

    if (req.query.auth) {
      const info = await needle(
        "post",
        `https://vlogtoblog.website/app/authCheck?auth=${req.query.auth.trim()}`,
        { json: true }
      );

      if (info.body.key) {
        res.setHeader("Content-Type", "application/json");
        return res.status(500).send(JSON.stringify(info.body));
      }
    }

    return next(true);
  });
}
