import AWS from 'aws-sdk'
import nodemailer from 'nodemailer'
import directTransport from 'nodemailer-direct-transport'
import { EnvironmentBase, IEmailPayload } from '.'
import fs from "fs";
import path from "path";

export class EmailHelper {

  public static async sendTemplatedEmail(from: string, to: string, appName: string, appUrl: string, subject: string, contents: string, emailTemplate: "EmailTemplate.html" | "ChurchEmailTemplate.html" = "EmailTemplate.html") {
    if (!appName) appName = "Chums";
    if (!appUrl) appUrl = "https://chums.org";

    const template = EmailHelper.readTemplate(emailTemplate);
    const emailBody = template
      .replace("{appLink}", "<a href=\"" + appUrl + "/\">" + appName + "</a>")
      .replace("{contents}", contents);
    await EmailHelper.sendEmail({ from, to, subject, body: emailBody });
  }

  public static readTemplate(templateFile?: string) {
    if (!templateFile) templateFile = "EmailTemplate.html";
    const filePath = path.join(__dirname, "../../templates/" + templateFile);
    const buffer = fs.readFileSync(filePath);
    const contents = buffer.toString();
    return contents;
  }

  public static sendEmail({ from, to, subject, body }: IEmailPayload) {
    return new Promise(async (resolve, reject) => {
      try {
        let transporter: nodemailer.Transporter = nodemailer.createTransport(directTransport({
          name: "churchapps.org"
        }));

        if (EnvironmentBase.mailSystem === 'SES') {
          AWS.config.update({ region: 'us-east-2' });
          const ses = new AWS.SES({ apiVersion: '2010-12-01' });
          transporter = nodemailer.createTransport({ SES: { ses, aws: AWS } })
        }
        if (EnvironmentBase.mailSystem === "SMTP") {
          transporter = nodemailer.createTransport({
            host: EnvironmentBase.smtpHost,
            secure: EnvironmentBase.smtpSecure,
            auth: {
              user: EnvironmentBase.smtpUser,
              pass: EnvironmentBase.smtpPass
            }
          });
        }

        if (EnvironmentBase.mailSystem === "") {
          console.log("****Email server not configured: ");
          console.log(subject)
          console.log(body);
        }
        else await transporter.sendMail({ from, to, subject, html: body });
        resolve(null);
      } catch (err) {
        reject(err);
      }

    })
  }

}