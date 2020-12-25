import { Model, DataTypes } from "sequelize";

module.exports = (sequelize: any) => {
  class Mod extends Model {
    public authenticate!: any;
  }

  Mod.init(
    {
      sessionId: DataTypes.STRING,
      browserHash: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "session",
    }
  );

  return Mod;
};
