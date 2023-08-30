import { AwsHelper } from "./AwsHelper";

export class EnvironmentBase {
  static appEnv: string;
  static appName: string;
  static s3Bucket: string;
  static connectionString: string;
  static contentRoot: string;
  static encryptionKey: string;
  static fileStore: string;
  static jwtSecret: string;

  static mailSystem: string;
  static smtpHost: string;
  static smtpPass: string;
  static smtpSecure: boolean;
  static smtpUser: string;


  static async populateBase(jsonData: any, appName:string, appEnv: string) {
    EnvironmentBase.appName = jsonData.appName;
    EnvironmentBase.appEnv = jsonData.appEnv;
    EnvironmentBase.connectionString = process.env.CONNECTION_STRING || await AwsHelper.readParameter(`/${appEnv}/${appName}/connectionString`);
    EnvironmentBase.contentRoot = jsonData.contentRoot;
    EnvironmentBase.encryptionKey = process.env.ENCRYPTION_KEY || await AwsHelper.readParameter(`/${appEnv}/encryptionKey`);
    EnvironmentBase.fileStore = jsonData.fileStore;
    EnvironmentBase.jwtSecret = process.env.JWT_SECRET || await AwsHelper.readParameter(`/${appEnv}/jwtSecret`);
    EnvironmentBase.mailSystem = jsonData.mailSystem;
    EnvironmentBase.s3Bucket = jsonData.s3Bucket;
    EnvironmentBase.smtpHost = process.env.SMTP_HOST;
    EnvironmentBase.smtpPass = process.env.SMTP_PASS;
    EnvironmentBase.smtpSecure = process.env.SMTP_SECURE === "true";
    EnvironmentBase.smtpUser = process.env.SMTP_USER;
  }

}