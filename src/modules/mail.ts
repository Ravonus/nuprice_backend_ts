/**
 * @author Chad Koslovsky <chad@technomancy.it>
 * @file Description
 * @desc Created on 2020-08-20 12:01:48 am
 * @copyright TechnomancyIT
 */
/* eslint-disable indent */
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

import nodemailer from "nodemailer";
import { obj } from "../../interfaces/mail";
import { asyncForEach } from "../modules/asyncForEach";

const fs = require("fs");
const path = require("path");
const Crypt = require("@5no/crypt");

let config: any;

config = {
  mail: require("../../config/mail.json"),
};

const decrypt = Crypt(config.mail.password, "1337").decrypt();
config.mail.password = decrypt;

async function waitForConfig(resolve?: any) {
  if (!resolve) {
    return new Promise((resolve) => {
      if (!config) {
        setTimeout(() => {
          waitForConfig(resolve);
        }, 50);
      } else {
        resolve(config);
      }
    });
  } else {
    if (!config) {
      setTimeout(() => {
        waitForConfig(resolve);
      }, 50);
    } else {
      resolve(config);
    }
  }
}

class MailOptions {
  public from: string;
  public to: string;
  public subject: string;
  public text: string;
  public html: string;
  public ratelimit?: number;
  public sendSeperate?: any;
  public attachments: { filename: string; path: string; cid: string } | string;

  constructor(obj: obj) {
    this.ratelimit = obj.ratelimit;
    this.sendSeperate = obj.sendSeperate;
    this.from = obj.from;
    this.to = obj.to;
    this.subject = obj.subject;
    this.text = obj.text;
    this.html = obj.html;
    this.attachments = obj.attachments;
  }

  async sendMail(transporter: nodemailer.Transporter, obj?: any) {
    let object: any = this;

    if (obj) object = obj;

    const info = await transporter.sendMail(object).catch((e) => e);

    if (info.messageId) console.log("Message sent: %s", info.messageId);
  }
}

async function templateBuild(
  templateName: string,
  template: { replace: string } | string,
  count?: number
) {
  if (!count) count = 0;
  const attachments: { filename: string; path: string; cid: string }[] = [];

  const templateDirectory = path.join(
    __dirname,
    "../",
    "templates",
    templateName,
    "template.html"
  );

  let contents: any = await fs.readFileSync(templateDirectory, "utf8");
  const regEx: any = [];
  const replaceValues: any = {};
  if (typeof template === "object") {
    await asyncForEach(Object.keys(template.replace), (key: any) => {
      const obj: any = { [key]: [template.replace[key]] };
      regEx.push(`{{${Object.keys(obj)}}}`);
      const keyName: any = Object.keys(obj);
      if (!Array.isArray(obj[keyName])) obj[keyName] = [obj[keyName]];
      const countKey: any = count;

      replaceValues[`{{${Object.keys(obj)}}}`] = obj[keyName][countKey];
    });
  }
  contents = await contents.replace(
    new RegExp(regEx.join("|"), "g"),
    (matched: any) => {
      return replaceValues[matched];
    }
  );

  // Grab img tags and convert into base64. Plan to eventually check base64 variable and let people decide between hosting and or base64. (This way will send much more data via email.);
  const imgs = contents.match(/(<img \S([^>]+)>)/g);
  const matches: {
    tag: string;
    filename: string;
    path: string;
    src: string;
    cid?: string;
  }[] = [];

  if (Array.isArray(imgs)) {
    await asyncForEach(imgs, async (img: string) => {
      let src: any = await img.match(
        /src=[\"|\'](?!https?:\/\/)([^\/].+?)[\"|\']/
      );
      if (!src) return;

      src = src[0];
      src = src.substring(5, src.length - 1);
      const filename = src;
      const pathDir = path.join(
        __dirname,
        "../",
        "templates",
        templateName,
        src
      );

      matches.push({
        tag: img,
        filename,
        path: pathDir,
        src,
      });
    });
    const array: string[] | any = [];
    await asyncForEach(matches, async (img: { tag: string }, index: number) => {
      matches[index].cid = img.tag.replace(
        /src=[\"|\'](?!https?:\/\/)([^\/].+?)[\"|\']/,
        `src="cid:email-${index}"`
      );
      attachments.push({
        filename: matches[index].filename,
        path: matches[index].path,
        cid: `email-${index}`,
      });

      array.push(matches[index].cid);
    });

    const mapObj: any = {};
    const mapArr = contents.match(/(<img \S([^>]+)>)/g);

    await asyncForEach(array, (value: string, index: number) => {
      mapObj[mapArr[index]] = value;
    });

    const newContent = contents.replace(
      /(<img \S([^>]+)>)/g,
      (matched: any) => {
        return mapObj[matched];
      }
    );

    const newTemplate = newContent;

    return {
      template: newTemplate,
      attachments,
    };
  }
}

export async function send(options: any, template: any, pushConfig?: any) {
  let templateName: any;
  if (!pushConfig) config = await waitForConfig();
  else config = pushConfig;

  let count = 0;

  if (template && typeof template === "string") {
    templateName = template;
  } else if (typeof template === "object") {
    templateName = template.name;
  }

  const ratelimit = options.ratelimit ? options.ratelimit : 60;
  let contents;
  const attachments = [];

  // create reusable transporter object using the default SMTP transport
  let auth;
  if (config.mail.user || config.mail.email) {
    auth = {
      user: config.mail.user || config.mail.email,
      pass: config.mail.pass || config.mail.password,
    };
  }

  const transporter = nodemailer.createTransport({
    host: config.mail.host,
    port: config.mail.port,
    ignoreTLS: config.mail.ignoreTLS,
    secure: config.mail.secure, // true for 465, false for other ports
    auth,
  });

  let mailOptions: any;

  const newTemplate: any = await templateBuild(templateName, template);

  options = Object.assign(options, {
    html: newTemplate.template ? newTemplate.template : contents,
    attachments: newTemplate.attachments,
  });

  if (options.sendSeperate) {
    const object: any = options;

    let timeout = 0;
    if (typeof object.to === "string") object.to = [object.to];

    await asyncForEach(object.to, async (to: any) => {
      const newObj: any = await templateBuild(templateName, template, count);
      count++;
      object.html = newObj.template;
      object.attachments = newObj.attachments;

      object.to = to;

      mailOptions = new MailOptions(object);

      // setup email data with unicode symbols
      timeout += 1000 / (ratelimit / 60);

      // mailOptions.sendMail(transporter);
      setTimeout(mailOptions.sendMail, timeout, transporter, mailOptions);
      return "done";
    });
  } else {
    mailOptions = new MailOptions(options);
    const info = await transporter.sendMail(mailOptions);
    return info;
  }

  // let mailOptions = {
  //   from: options.from, // sender address
  //   to: options.to, // list of receivers
  //   subject: options.from, // Subject line
  //   text: options.text,
  //   html: newTemplate ? newTemplate : contents, // html body
  //   attachments
  // };

  // send mail with defined transport object
  // let info = await transporter.sendMail(mailOptions)

  // console.log("Message sent: %s", info.messageId);
  // Preview only available when sending through an Ethereal account
  // console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
  // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
}

function changeConfig(newConfig: any) {
  config = newConfig;
}
