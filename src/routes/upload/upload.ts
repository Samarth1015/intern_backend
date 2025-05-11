// routes/upload.ts

import express, { Request, Response } from "express";
import multer from "multer";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import JWTService from "../../../Service/JWTservice/jwtverify";
import { s3ClientPathStyle } from "../../../util/s3client";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/", upload.single("file"), async (req: any, res: any) => {
  try {
    console.log(req.file);
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Missing or invalid token" });
    }

    const token = authHeader.split(" ")[1];
    const { accessKey, secretAccessKey } = JWTService.verifyJWT(token);

    const bucket: string = req.body.bucket;
    const file = req.file;

    console.log("Received bucket:", bucket);
    console.log("Received file:", file?.originalname);

    if (!bucket || !file) {
      return res.status(400).json({ error: "Bucket name or file missing" });
    }

    const s3 = s3ClientPathStyle(accessKey!, secretAccessKey!);

    const command = new PutObjectCommand({
      Bucket: bucket.trim(),
      Key: file.originalname,
      Body: file.buffer,
    });

    await s3.send(command);

    return res.status(200).json({ message: "File uploaded successfully" });
  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({ error: "Failed to upload file" });
  }
});

export default router;
