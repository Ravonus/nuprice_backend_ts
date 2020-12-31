/**
 * @author Chad Koslovsky <chad@technomnancy.it>
 * @file Description
 * @desc Created on 2020-05-19 12:24:07 am
 * @copyright TechnomancyIT
 */
import { Sequelize, Model, DataTypes } from "sequelize";
let sequelize: any;
export default sequelize = new Sequelize("SIQES", "nuprice", "q*2>Zj=D", {
  host: "roundflip.com",
  dialect: "mysql",

  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },

  logging: false,
});

sequelize
  .authenticate()
  .then(() => {
    console.log("Connection has been established successfully.");
  })
  .catch((err: any) => {
    console.error("Unable to connect to the database:", err);
  });

sequelize.query("show tables").then(function (rows: any) {});

const MWS_book_feed = sequelize.define(
  "MWS_book_feed",
  {
    asin: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
    },
    sales_rank: {
      type: DataTypes.INTEGER,
    },
    escore: {
      type: DataTypes.INTEGER,
    },
  },
  {
    freezeTableName: true,
    timestamps: false,
  }
);

// MWS_book_feed.findAll({ where: { asin: ['0000000019', '0000000051'] } }).then(
//   (project) => {

//   }
// )

export { MWS_book_feed };
