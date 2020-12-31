import crypto from "crypto";

const algorithm = "aes-256-cbc";

var key = Buffer.from("tmit1241gs0Sa3df31041s5as451s412", "utf8");
const iv = crypto.randomBytes(16);

async function encrypt(salt: string, text: string, newKey: string) {
  if (newKey) key = Buffer.from(`${newKey.substring(0, 32)}`, "utf8");

  let cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv);
  let encrypted = cipher.update(`${salt}${text}`);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return new Promise((resolve, reject) =>
    resolve({
      iv: iv.toString("hex"),
      encryptedData: encrypted.toString("hex"),
    })
  );
}

async function decrypt(
  salt: string,
  text: { iv: string; encryptedData: string }
) {
  let iv = Buffer.from(text.iv, "hex");
  let encryptedText = Buffer.from(text.encryptedData, "hex");
  let decipher = crypto.createDecipheriv(algorithm, Buffer.from(key), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return new Promise((resolve, reject) => {
    let str = decrypted.toString();

    if (!str.includes(salt)) return reject({ error: "Bad Salt" });

    resolve(decrypted.toString().replace(salt, ""));
  });
}

// Export.
module.exports = { encrypt, decrypt };
