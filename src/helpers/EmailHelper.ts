import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import nodemailer from 'nodemailer'
import directTransport from 'nodemailer-direct-transport'
import { EnvironmentBase, IEmailPayload } from '.'
import fs from "fs";
import path from "path";

export class EmailHelper {

  private static getSESClient(): SESClient {
    return new SESClient({ region: "us-east-2" });
  }

  public static async sendTemplatedEmail(from: string, to: string, appName: string, appUrl: string, subject: string, contents: string, emailTemplate: "EmailTemplate.html" | "ChurchEmailTemplate.html" = "EmailTemplate.html") {
    if (!appName) appName = "Chums";
    if (!appUrl) appUrl = "https://chums.org";

    const template = EmailHelper.readTemplate(emailTemplate);
    const emailBody = template
      .replace("{appLink}", "<a target='_blank' rel='noreferrer noopener' href=\"" + appUrl + "/\">" + appName + "</a>")
      .replace("{contents}", contents);
    await EmailHelper.sendEmail({ from, to, subject, body: emailBody });
  }

  public static readTemplate(templateFile?: string) {
    if (!templateFile) templateFile = "EmailTemplate.html";
    const filePath = path.join(__dirname, "../../src/tools/templates/" + templateFile);
    const buffer = fs.readFileSync(filePath);
    const contents = buffer.toString();
    return contents;
  }

  private static async sendSes({ from, to, subject, body }: IEmailPayload) {
    const sesClient = this.getSESClient();
      const sendCommand  = new SendEmailCommand({
        Destination: {
          ToAddresses: [to],
        },
        Message: {
          Body: {
            Html: {
              Charset: 'UTF-8',
              Data: body,
            },
          },
          Subject: {
            Charset: 'UTF-8',
            Data: subject,
          },
        },
        Source: from,

      });
      await sesClient.send(sendCommand);
  }

  public static sendEmail({ from, to, subject, body }: IEmailPayload) {
    return new Promise(async (resolve, reject) => {
      try {
        let transporter: nodemailer.Transporter = nodemailer.createTransport(directTransport({ name: "churchapps.org" }));

        if (EnvironmentBase.mailSystem === 'SES') await this.sendSes({ from, to, subject, body });
        else {
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
        }
        resolve(null);
      } catch (err) {
        reject(err);
      }

    })
  }

}