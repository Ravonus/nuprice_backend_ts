/**
 * @author Chad Koslovsky <chad@technomancy.it>
 * @file This is the route that sets up the database and storage for a default setup.
 * @desc Created on 2020-06-26 3:57:19 pm
 * @copyright TechnomancyIT
 */

import { Router } from "express";
import { isAuthenticated } from "../middleware/express/isAuthenticated";
import { connection } from "../database";

const Group = connection().models.group;
const GroupUsers = connection().models.groupUsers;

console.log(GroupUsers);

function route(router: Router) {
  isAuthenticated(router, "/me"),
    router.get("/me", async function (req: any, res: any) {
      let user = req.user;

      //  const groups = await user.getGroups();

      // const groups = await GroupUsers.findAll({
      //   where: { userId: user.id },
      // }).catch((e) => {
      //   console.log(e);
      // });

      // console.log(groups);

      // const customer = await Group.findOne({
      //   where: { name: "customer" },
      // }).catch((e) => e);

      // if (customer.id) {
      //   const user = await customer.getUser(req.user.id);
      //   console.log(user);
      // }

      res.end(JSON.stringify(req.user));
    });
}

module.exports = route;
