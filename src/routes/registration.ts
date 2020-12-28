/**
 * @author Chad Koslovsky <chad@technomancy.it>
 * @file This is the route that sets up the database and storage for a default setup.
 * @desc Created on 2020-06-26 3:57:19 pm
 * @copyright TechnomancyIT
 */

import { Router, Response, Request } from "express";
import dayjs from "dayjs";
import pls from "passport-local";
import passport from "passport";
import needle from "needle";

import { grabModels } from "../database";
import { subscriptionCheck } from "../modules/checkGumroadSub";

const LocalStrategy = pls.Strategy;

let User: any;
let Payment: any;

(async () => {
  const models = await grabModels();
  User = models.User;
  Payment = models.Payment;
})();

function flashMsg(msg: string, done: any, req: any) {
  return done(msg, false, req.flash("signupMessage", msg));
}

passport.use(
  "local-signup",
  new LocalStrategy(
    {
      // by default, local strategy uses username and password, we will override with email
      usernameField: "username",
      passwordField: "password",

      passReqToCallback: true, // allows us to pass back the entire request to the callback
    },
    async function (req: any, username, password, done) {
      // find a user whose email is the same as the forms email
      // we are checking to see if the user trying to login already exists

      const { name, trial } = req.body;

      if (!name) return flashMsg("Need full name.", done, req);

      const nameArr = req.body.name.split(" ");
      const firstName = nameArr[0];
      const lastName = nameArr[1];

      const user = await User.findOne({ where: { username } }).catch(
        (e: any) => e
      );

      // if there are any errors, return the error

      if (user) return flashMsg("User already created", done, req);

      // check to see if theres already a user with that email
      if (user && user.dataValues) {
        return flashMsg("That email is already taken.", done, req);
      } else {
        var newUser = new User();
        newUser.username = username;
        newUser.password = password;
        newUser.fullName = { first: firstName, last: lastName };

        if (trial) {
          newUser.expirationDate = dayjs().add(2, "week");

          Payment.create({
            type: "trial",
            plan: 1,
            userId: newUser.id,
            price: 0,
            fee: 0,
            paymentDate: dayjs(),
          }).catch((e: any) => console.log(e));
        }

        if (req.body.key) {
          const gumroad: any = await needle(
            "post",
            `https://api.gumroad.com/v2/licenses/verify?product_permalink=get-nuprice&license_key=${req.body.key}`,
            { json: true }
          ).catch((e) => {
            console.log(e);
          });

          if (gumroad.body.error)
            return flashMsg(gumroad.body.error, done, req);

          if (!gumroad.body.success)
            return flashMsg("License Key not found.", done, req);

          if (gumroad.body.success && username !== gumroad.body.purchase.email)
            return flashMsg("Existing email is not the same.", done, req);

          newUser.plan = gumroad.body.purchase.recurrence === "yearly" ? 1 : 2;
          newUser.gumroad = gumroad.body;
          newUser.affiliate = gumroad.body.purchase.affiliate;
          newUser.key = req.body.key;
          req.gumroad = gumroad.body;
        }

        // save the user
        const saved = await newUser.save().catch((e: any) => e);

        if (!saved.dataValues)
          return flashMsg("Issue creating user.", done, req);
        newUser.dataValues.subscription = trial ? true : false;
        return done(null, newUser);
      }
    }
  )
);

function route(router: Router) {
  router.post(
    "/registration",
    passport.authenticate("local-signup", {
      failureFlash: true,
    }),

    async function (req: any, res: Response) {
      res.setHeader("Content-Type", "application/json");

      let sub = await subscriptionCheck(req, res, true);

      console.log("SUB", sub);

      res.end(JSON.stringify({ ...req.user.dataValues, ...sub }));
    }
  );
}

module.exports = route;
