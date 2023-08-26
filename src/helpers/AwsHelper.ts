import AWS from "aws-sdk"
import { ByteBuffer } from "aws-sdk/clients/cloudtrail";
import { EnvironmentBase } from "./EnvironmentBase";

export class AwsHelper {

  private static S3() {
    return new AWS.S3({ apiVersion: "2006-03-01" });
  }

  static S3PresignedUrl(key: string): Promise<any> {
    if (key.indexOf("/") === 0) key = key.substring(1, key.length);
    return new Promise((resolve, reject) => {
      const params: AWS.S3.PresignedPost.Params = { Bucket: EnvironmentBase.s3Bucket }

      params.Conditions = [
        { acl: "public-read" },
        { bucket: EnvironmentBase.s3Bucket },
        { key },
        ["starts-with", "$Content-Type", ""],
      ];

      params.Expires = 1200;
      this.S3().createPresignedPost(params, (error: Error, data: any) => {
        if (error) reject(error);
        else {
          data.key = key;
          resolve(data);
        }
      });
    });
  }

  static S3Upload(key: string, contentType: string, contents: ByteBuffer): Promise<void> {
    if (key.indexOf("/") === 0) key = key.substring(1, key.length);
    return new Promise((resolve, reject) => {
      const params: AWS.S3.PutObjectRequest = { Bucket: EnvironmentBase.s3Bucket, Key: key, Body: contents, ACL: "public-read", ContentType: contentType }
      this.S3().upload(params, (error: Error, data: AWS.S3.ManagedUpload.SendData) => {
        if (error) reject(error);
        else resolve();
      });
    });
  }

  static S3Move(oldKey: string, newKey: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const params: AWS.S3.CopyObjectRequest = { Bucket: EnvironmentBase.s3Bucket, Key: newKey, CopySource: EnvironmentBase.s3Bucket + "/" + oldKey }
      this.S3().copyObject(params, (error: Error, data: AWS.S3.DeleteObjectOutput) => {
        if (error) reject(error);
        else {
          this.S3Remove(oldKey).then(() => {
            resolve();
          })
        }
      });
    });
  }

  static S3Remove(key: string): Promise<void> {
    if (key.indexOf("/") === 0) key = key.substring(1, key.length - 1);
    return new Promise((resolve, reject) => {
      const params: AWS.S3.PutObjectRequest = { Bucket: EnvironmentBase.s3Bucket, Key: key }
      this.S3().deleteObject(params, (error: Error, data: AWS.S3.DeleteObjectOutput) => {
        if (error) reject(error);
        else resolve();
      });
    });
  }

  static async S3Rename(oldKey: string, newKey: string): Promise<void> {
    await this.S3Copy(oldKey, newKey);
    await this.S3Remove(oldKey);
  }

  static S3Copy(oldKey: string, newKey: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const source = "/" + EnvironmentBase.s3Bucket + "/" + oldKey;
      const params: AWS.S3.CopyObjectRequest = { Bucket: EnvironmentBase.s3Bucket, Key: newKey, CopySource: source, ACL: "public-read" }
      this.S3().copyObject(params, (error: Error, data: AWS.S3.DeleteObjectOutput) => {
        if (error) reject(error);
        else resolve();
      });
    });
  }

  static async S3List(path: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
      this.S3().listObjectsV2({ Bucket: EnvironmentBase.s3Bucket, Prefix: path, MaxKeys: 100000 }, (error: Error, data: AWS.S3.ListObjectsV2Output) => {
        if (error) reject(error);
        else {
          const result: string[] = [];
          data.Contents.forEach(v => { result.push(v.Key) });
          resolve(result)
        }
      });
    });
  }

  static async S3Read(key: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.S3().getObject({ Bucket: EnvironmentBase.s3Bucket, Key: key }, (error: Error, data: AWS.S3.GetObjectOutput) => {
        if (error) resolve(null);
        else resolve(data.Body.toString());
      });
    });
  }

}