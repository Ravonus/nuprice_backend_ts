import { Router } from "express";

export function isAuthenticated(router: Router, path: string) {
  return router.use(path, function (req: any, res: any, next: any) {
    console.log("wat", req.isAuthenticated());
    if (req.isAuthenticated()) return next("route");
    else return next(true);
  });
}
