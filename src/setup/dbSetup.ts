import { grabModels } from "../database";
import { Error } from "sequelize";

export async function dbSetup() {
  const { User, Group } = await grabModels();

  const admin = await Group.create({
    name: "administrator",
    permissions: 7,
    userId: 1,
  }).catch((e: Error) => e);
  const mod = await Group.create({
    name: "moderator",
    userId: 1,
    permissions: 6,
  }).catch((e: Error) => e);
  const customer = await Group.create({
    name: "customer",
    permissions: 4,
    userId: 1,
  }).catch((e: Error) => e);

  const user = await User.create({
    username: "admin",
    password: "password",
  }).catch((e: Error) => e);
  if (!user.stack)
    await user.addGroup([admin, mod, customer], {
      through: { selfGranted: false },
    });
  // else {
  //   const result = await User.findOne({
  //     where: { username: "admin" },
  //     include: Group,
  //   });
  //   console.log(result);
  // }
}
