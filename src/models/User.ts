import { Model, DataTypes } from "sequelize";
import bcrypt from "bcrypt";
const saltRounds = 10;

const passportLocalSequelize = require("passport-local-sequelize");

module.exports = (sequelize: any) => {
  class Mod extends Model {
    public authenticate!: any;
  }

  Mod.init(
    {
      username: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      plan: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      type: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "multi",
      },
      api: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      speed: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      gumroad: DataTypes.JSONB,
      fullName: DataTypes.JSONB,
      sockets: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: null,
      },
      expirationDate: DataTypes.DATE,
      key: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "user",
      freezeTableName: true,
    }
  );

  passportLocalSequelize.attachToUser(Mod, {
    usernameField: "username",
    passwordField: "password",
    session: true,
  });

  Mod.prototype.authenticate = async function (
    password: any,
    hash: any,
    cb: any
  ) {
    const result = await bcrypt.compare(password, hash);

    return result;
  };

  Mod.prototype.toJSON = function () {
    var values = Object.assign({}, this.get());

    console.log("VALUES", values.password);

    delete values.password;
    console.log(values);
    return values;
  };

  Mod.beforeCreate((user: any, options) => {
    return bcrypt
      .hash(user.password, 10)
      .then((hash) => {
        user.password = hash;
      })
      .catch((err) => {
        throw new Error();
      });
  });

  //Mod.hasMany(Character);

  return Mod;
};
