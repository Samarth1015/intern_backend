"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.s3ClientPathStyle = void 0;
// E:\intern_backend\util\s3client.ts
const client_s3_1 = require("@aws-sdk/client-s3");
const endpoint = process.env.ZATA_ENDPOINT;
// const accessKeyId = process.env.ZATA_ACCESS_KEY_ID;
// const secretAccessKey = process.env.ZATA_SECRET_ACCESS_KEY;
const region = process.env.ZATA_REGION || "us-east-1";
const s3ClientPathStyle = (accessKeyId, secretAccessKey) => {
    if (!accessKeyId || !secretAccessKey) {
        throw new Error("Accesskey id is missing");
    }
    console.log(accessKeyId, secretAccessKey);
    return new client_s3_1.S3Client({
        endpoint: `https://${endpoint}`,
        region,
        credentials: {
            accessKeyId: accessKeyId.trim(),
            secretAccessKey: secretAccessKey.trim(),
        },
        forcePathStyle: true,
    });
};
exports.s3ClientPathStyle = s3ClientPathStyle;
// export const s3ClientPathStyle = new S3Client({
//   endpoint: `https://${endpoint}`,
//   region,
//   credentials: {
//     accessKeyId: accessKeyId!,
//     secretAccessKey: secretAccessKey!,
//   },
//   forcePathStyle: true,
// });
// export const s3ClientVirtualHost = new S3Client({
//   endpoint: `https://${endpoint}`,
//   region,
//   credentials: {
//     accessKeyId: accessKeyId!,
//     secretAccessKey: secretAccessKey!,
//   },
//   forcePathStyle: false,
// });
