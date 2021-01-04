import { Model, DataTypes } from "sequelize";

module.exports = (sequelize: any) => {
  class Mod extends Model {}

  Mod.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      cost: {
        type: DataTypes.JSONB,
        allowNull: false,
      },
      unlocks: DataTypes.JSONB,
    },
    {
      sequelize,
      modelName: "addon",
    }
  );

  return Mod;
};
