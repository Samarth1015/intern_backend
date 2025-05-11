import { Router, Request, Response, RequestHandler } from "express";
import { ListBucketsCommand } from "@aws-sdk/client-s3";
import jwt from "jsonwebtoken";
import JWTService from "../../../Service/JWTservice/jwtverify";
import { s3ClientPathStyle } from "../../../util/s3client";

const router = Router();

router.get("/", (async (req: Request, res: Response) => {
  console.log("hitting fetch bucket");
  try {
    // Get the JWT token from the Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        error: "No token provided",
      });
    }

    const token = authHeader.split(" ")[1];

    // Get refresh token from request header
    const refreshToken = req.headers["x-refresh-token"] as string;
    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        error: "No refresh token provided",
      });
    }

    let decoded;
    let accessToken = token;

    try {
      // First attempt with current access token
      decoded = JWTService.verifyJWT(token) as {
        accessKey: string;
        secretAccessKey: string;
      };
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        try {
          // If token expired, try to refresh it
          accessToken = await JWTService.refreshAccessToken(refreshToken);
          decoded = JWTService.verifyJWT(accessToken) as {
            accessKey: string;
            secretAccessKey: string;
          };
        } catch (refreshError) {
          return res.status(401).json({
            success: false,
            error: "Token refresh failed",
          });
        }
      } else {
        return res.status(401).json({
          success: false,
          error: "Invalid token",
        });
      }
    }

    if (!decoded.accessKey || !decoded.secretAccessKey) {
      return res.status(400).json({
        success: false,
        error: "Invalid token: missing AWS credentials",
      });
    }

    // Create S3 client using the utility function
    const s3Client = s3ClientPathStyle(
      decoded.accessKey,
      decoded.secretAccessKey
    );

    // Fetch buckets
    const command = new ListBucketsCommand({});
    const response = await s3Client.send(command);
    console.log("---->", response);

    const buckets =
      response.Buckets?.map((bucket) => ({
        name: bucket.Name,
        creationDate: bucket.CreationDate,
      })) || [];

    res.status(200).json({
      success: true,
      data: buckets,
      accessToken, // Send new access token if it was refreshed
    });
  } catch (error) {
    console.error("Error fetching buckets:", error);
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        success: false,
        error: "Invalid token",
      });
    }
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch buckets",
    });
  }
}) as RequestHandler);

export default router;
