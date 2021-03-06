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
        primaryKey: true,
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
          fields: ["deviceSerial"],
        },
      ],
      sequelize,
      modelName: "NuPriceClient",
    }
  );

  return Mod;
};
