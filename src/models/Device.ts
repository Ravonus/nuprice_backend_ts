import { Model, DataTypes } from "sequelize";

module.exports = (sequelize: any) => {
  class Mod extends Model {}

  Mod.init(
    {
      serial: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
        primaryKey: true,
      },
      model: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      manufacturer: {
        type: DataTypes.STRING,
      },
      main:{
        type: DataTypes.BOOLEAN,
        defaultValue:true
      },
      type: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "Desktop",
      },
      lastLogon: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "device",
    }
  );

  return Mod;
};
