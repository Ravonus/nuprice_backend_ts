import fs from "fs";
import { Router, Request } from "express";
import mailer from "../modules/mail";

import { isAuthenticated } from "../middleware/express/isAuthenticated";

function route(router: Router) {
  isAuthenticated(router, "/report"),
    router.route("/report").post(async (req: any, res) => {
      let body, answers, ticket;
      if (req.query.json) {
        body = JSON.parse(req.query.json);
        console.log(body.answers);
        answers = body.answers;
        delete body.answers;
      }

      let replace = {
        server: "TechnomancyIT",
        user: `${req.user.fullName.first} ${req.user.fullName.last}`,
        email: req.user.username,
        userid: req.user.id,
        version: req.query.version,
        type: req.query.type,
        text: !body
          ? "This request has been auto generated. The logs have been attached within a zip file."
          : `This request has been sent from ${answers[0]}. <br>
            Ticket Number: NPT-${body.ticket}
            ${answers[2]} <br>
            System Info: ${JSON.stringify(body)}`,
      };

      console.log(req.files);
      let log = {
        // utf-8 string as an attachment
        filename: req.files.file.name,
        content: req.files.file.data,
        contentType: "application/zip",
      };
      console.log("RANZA", replace);
      mailer(
        {
          subject: !body
            ? `An update error for ${
                answers.length === 3 ? replace.user : answers[0]
              } has been reported`
            : `[Support Ticket# NPT-${body.ticket}] - ${answers[1]} From - ${req.user.fullName.first} ${req.user.fullName.last}}`,
          from: "vendors@technomancy.it",
          to: "chadkoslovsky@gmail.com",
          replyTo: replace.email,
          attachments: [log],
        },
        {
          name: "report",
          replace,
        }
      );

      res.send(JSON.stringify("{}"));
    });
}

module.exports = route;
