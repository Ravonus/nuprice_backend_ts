/**
 * @author Chad Koslovsky <chad@technomancy.it>
 * @file This is the route that sets up the database and storage for a default setup.
 * @desc Created on 2020-06-26 3:57:19 pm
 * @copyright TechnomancyIT
 */

import { Router, Response, Request } from "express";
import { grabModels } from "../database";
import pls from "passport-local";
import passport from "passport";
import needle from "needle";

const LocalStrategy = pls.Strategy;

let User: any;

(async () => {
  const models = await grabModels();
  User = models.User;
})();

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

      const { name } = req.body.name;

      if (!name) return done("Need name");

      const nameArr = req.body.name.split(" ");
      const firstName = nameArr[0];
      const lastName = nameArr[1];

      const user = await User.findOne({ where: { username } }).catch(
        (e: any) => e
      );

      // if there are any errors, return the error
      if (user) return done(user);

      // check to see if theres already a user with that email
      if (user && user.dataValues) {
        return done(
          null,
          false,
          req.flash("signupMessage", "That email is already taken.")
        );
      } else {
        // if there is no user with that email
        // create the user
        var newUser = new User();

        // set the user's local credentials
        newUser.username = username;
        newUser.password = password;
        newUser.fullName = { first: firstName, last: lastName };

        if (req.body.key) {
          const gumroad: any = await needle(
            "post",
            `https://api.gumroad.com/v2/licenses/verify?product_permalink=get-nuprice&license_key=${req.body.key}`,
            { json: true }
          ).catch((e) => {
            console.log(e);
          });

          if (gumroad.body.error) return done(gumroad.body.error);

          if (!gumroad.body.success) return done("Key not found");

          if (gumroad.body.success && username !== gumroad.body.purchase.email)
            return done("Email does not match");

          console.log(gumroad.body);

          newUser.plan = gumroad.body.purchase.recurrence === "yearly" ? 1 : 0;
          newUser.gumroad = gumroad.body;
          newUser.affiliate = gumroad.body.purchase.affiliate;
          newUser.key = req.body.key;
        }

        // save the user
        const saved = await newUser.save().catch((e: any) => e);

        if (!saved.dataValues) return done(saved);

        return done(null, newUser);
      }
    }
  )
);

function route(router: Router) {
  router.post(
    "/registration",
    passport.authenticate("local-signup", {
      successRedirect: "http://localhost:3000/admin/dashboard",
      failureRedirect: "/auth/registration",
      failureFlash: true,
    }),

    async function (req: Request, res: Response) {
      console.log("TAz");
      res.setHeader("Content-Type", "application/json");

      res.end(JSON.stringify(req.user));
    }
  );
}

module.exports = route;
