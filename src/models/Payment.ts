import { Model, DataTypes } from "sequelize";

module.exports = (sequelize: any) => {
  class Mod extends Model {}

  Mod.init(
    {
      type: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "stripe",
      },
      price: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      fee: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      refunded: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },

      affiliate: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      disputed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      plan: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      paymentDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      couponCode: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "payment",
    }
  );

  return Mod;
};
