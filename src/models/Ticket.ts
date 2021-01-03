import { Model, DataTypes } from "sequelize";

module.exports = (sequelize: any) => {
  class Mod extends Model {}

  Mod.init(
    {
      type: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "support",
      },
      urgency: {
        type: DataTypes.NUMBER,
        allowNull: false,
        defaultValue: 0,
      },
      category: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: ["default"],
      },
    },
    {
      sequelize,
      modelName: "message",
    }
  );

  return Mod;
};
