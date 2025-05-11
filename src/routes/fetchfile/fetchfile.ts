// File: E:/intern_backend/src/routes/fetchfile/fetchfile.ts

import express from "express";
import {
  S3Client,
  ListObjectsV2Command,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import JWTService from "../../../Service/JWTservice/jwtverify";
import { s3ClientPathStyle } from "../../../util/s3client";
interface reqBod {
  bucket: string;
}
const router = express.Router();
router.post("/", async (req: any, res: any) => {
  try {
    // Log the body to check if it's parsed
    const bucket: reqBod = req.body;
    console.log("bucket name:", bucket);

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Missing or invalid token" });
    }

    const token = authHeader.split(" ")[1];
    try {
      const { accessKey, secretAccessKey } = JWTService.verifyJWT(token);

      if (!bucket || !accessKey || !secretAccessKey) {
        return res
          .status(400)
          .json({ error: "Missing bucket name or token credentials" });
      }

      const s3 = s3ClientPathStyle(accessKey, secretAccessKey);
      const command = new ListObjectsV2Command({
        Bucket: bucket.bucket.trim(),
      });

      const response = await s3.send(command);

      const files: {
        key: string;
        pathStyleUrl: string;
        virtualHostUrl?: string;
      }[] = [];

      if (response.Contents) {
        for (const item of response.Contents) {
          if (item.Key) {
            const presignedUrl = await getSignedUrl(
              s3,
              new GetObjectCommand({
                Bucket: bucket.bucket.trim(),
                Key: item.Key,
              }),
              { expiresIn: 3600 }
            );

            files.push({
              key: item.Key,
              pathStyleUrl: presignedUrl,
              virtualHostUrl: undefined,
            });
          }
        }
      }

      return res.json(files);
    } catch (error: any) {
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({
          error: "Token expired",
          code: "TOKEN_EXPIRED",
        });
      }
      throw error;
    }
  } catch (error) {
    console.error("Error listing files:", error);
    return res.status(500).json({ error: "Failed to list files" });
  }
});

export default router;
