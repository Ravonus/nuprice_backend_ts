/**
 * @author Chad Koslovsky <chad@technomancy.it>
 * @file Logging system - Will send logs to file JSON or plain text. It also consoles the log file. It supports labels so pluggins can let themselves known. It also strips on color code out before writing to logs. Meaning you can send and overwrite any default colors.
 * @param {string} level - log level.
 * @param {object} options - message,label,extra.
 * @desc Created on 2020-04-29 3:09:56 pm
 * @copyright TechnomancyIT
 */

const fs = require("fs");
const { createLogger, format, transports } = require("winston");
const { combine, timestamp, printf } = format;
const path = require("path");
const strip = require("strip-ansi");
const colors = require("colors");

const exist = fs.existsSync("./logs");
if (!exist) fs.mkdirSync("./logs");

const myFormat = printf(
  ({ level, message, label, timestamp, json, extra }: any) => {
    message = strip(message);
    extra = strip(extra);

    let str;
    if (json) {
      str = `{"timestamp":"${timestamp}", ${
        label ? `"label":["${label}"],` : ""
      } "level":"${level}", "message":"${message}"}`;
    } else {
      str = `${timestamp} ${
        label ? `[${label}]` : ""
      } ${level}: ${message} ${extra}`;
    }
    return str;
  }
);

colors.setTheme({
  silly: "rainbow",
  input: "grey",
  verbose: "cyan",
  prompt: "grey",
  info: "cyan",
  data: "grey",
  help: "brightGreen",
  warn: "yellow",
  debug: "blue",
  error: "red",
});

const formatObject = ({ level, message, label, extra, verbose }: any) => {
  return `${
    label
      ? `${colors.yellow("[")}${
          level === "debug"
            ? colors.bgWhite.blue(label)
            : colors.brightWhite(label)
        }${colors.yellow("]")} `
      : ""
  }${colors[level](message)}${
    (verbose && verbose === "false") || (!verbose && !process.env.verbose)
      ? ""
      : extra
      ? `${colors.magenta("::")}${
          level !== "error" ? colors.brightGreen(extra) : colors.yellow(extra)
        }`
      : ""
  }`;
};

const cmdFormat = printf(formatObject);

const logger = createLogger(
  {
    level: "info",
    format: combine(timestamp(), myFormat),
    transports: [
      //
      // - Write to all logs with level `info` and below to `combined.log`
      // - Write all logs error (and below) to `error.log`.
      //
      new transports.File({
        filename: path.join(__dirname, "../", "logs/", "error.log"),
        level: "error",
      }),
      new transports.File({
        filename: path.join(__dirname, "../", "logs/", "combined.log"),
      }),
    ],
  },
  {
    level: "debug",
    format: combine(timestamp(), myFormat),
  }
);

const debug = createLogger({
  level: "debug",
  format: combine(timestamp(), cmdFormat),
  transports: [
    new transports.Console({
      level: "debug",
    }),
  ],
});

logger.debug = (msg: string, options: any) => {
  if (!options) options = {};
  debug.log("debug", {
    label: options.label ? options.label : "DEBUG",
    message: msg,
  });
};

//
// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
//
if (!process.env.noTerminal === true && process.env.NODE_ENV !== "test") {
  logger.add(
    new transports.Console({
      format: cmdFormat,
    })
  );
}

if (process.env.NODE_ENV === "production" || process.env.NODE_ENV === "test") {
  logger.debug = () => {};
}
export { logger, debug };
