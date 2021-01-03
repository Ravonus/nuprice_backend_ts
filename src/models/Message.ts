import { Model, DataTypes } from "sequelize";

module.exports = (sequelize: any) => {
  class Mod extends Model {}

  Mod.init(
    {
      type: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "ticket",
      },
      text: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "message",
    }
  );

  return Mod;
};
