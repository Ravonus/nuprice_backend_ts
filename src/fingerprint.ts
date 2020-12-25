import { application } from "express";

const fingerprint = require("express-fingerprint");

export function fp(app: typeof application) {
  app.use(
    fingerprint({
      parameters: [
        // Defaults
        fingerprint.useragent,
        fingerprint.acceptHeaders,
        fingerprint.geoip,

        // Additional parameters
        // function (next: any) {
        //   // ...do something...
        //   next(null, {
        //     param1: "value1",
        //   });
        // }
      ],
    })
  );
}
