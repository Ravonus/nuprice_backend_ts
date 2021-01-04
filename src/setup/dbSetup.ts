import { grabModels } from "../database";
import { Error } from "sequelize";

export async function dbSetup() {
  const { User, Group, Addon } = await grabModels();

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
    fullName: { first: "Admin", last: "Admin" },
  }).catch((e: Error) => e);
  if (!user.stack)
    await user.addGroup([admin, mod, customer], {
      through: { selfGranted: false },
    });

  const addonCount = 2;
  const unlocks = {};

  const addons = [
    {
      id: 1,
      name: "Multi-Device",
      description:
        "Enable license key to work for multiple devices. Instead of just one.",
      cost: {
        monthly: 60,
        yearly: 50,
      },
    },
    {
      id: 2,
      name: "Turbo Price Pull",
      description:
        "Enable third fastest price speed. This may require better internet and computer to run well.",
      cost: {
        monthly: 1,
        yearly: 10,
      },
    },
    {
      id: 3,
      name: "Extreme Price Pull",
      description:
        "Enable second fastest price speed. This may require better internet and computer to run well.",
      unlocks: [2],
      cost: {
        monthly: 2,
        yearly: 20,
      },
    },
    {
      id: 4,
      name: "Ludicrous Price Pull",
      description:
        "Enable fastest price pull speed. 50 Prices at once. This requires fast computer and fast network.",
      unlocks: [2, 3],
      cost: {
        monthly: 3,
        yearly: 30,
      },
    },
    {
      id: 5,
      name: "Api",
      description:
        "Enable Amazon API. This gives an API layer to certain features in NuProce.",
      cost: {
        monthly: 0,
        yearly: 0,
      },
    },
  ];

  Addon.bulkCreate(addons).catch((e: Error) => {});
}
