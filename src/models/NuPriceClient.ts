import { Model, DataTypes } from "sequelize";

module.exports = (sequelize: any) => {
  class Mod extends Model {}

  Mod.init(
    {
      ip: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      socketId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      country: DataTypes.STRING,
      region: DataTypes.STRING,
      timezone: DataTypes.STRING,
      city: DataTypes.STRING,
    },
    {
      indexes: [
        {
          unique: true,
          fields: ["userId", "deviceSerial"],
        },
      ],
      sequelize,
      modelName: "NuPriceClient",
    }
  );

  return Mod;
};
