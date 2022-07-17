import AWS from 'aws-sdk';

export const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
  // apiVersion: '2012-10-17',
  signatureVersion: 'v4',
});
