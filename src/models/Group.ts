import { Model, DataTypes } from "sequelize";

module.exports = (sequelize: any) => {
  class Mod extends Model {
    public authenticate!: any;
  }

  Mod.init(
    {
      name: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
      },
      permissions: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "group",
      freezeTableName: true,
    }
  );

  //Mod.hasMany(Character);

  return Mod;
};
