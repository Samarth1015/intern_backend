// E:\intern_backend\src\routes\token\token.ts
import { Router, Request, Response } from "express";
import JWTService from "../../../Service/JWTservice/jwtverify";
import { prisma } from "../../../client/db";

const router = Router();

interface ReqBody {
  googleToken: string;
  accesskey: string;
  secretaccesskey: string;
}

interface DecodePayload {
  given_name: string;
  family_name: string;
  picture: string;
  email: string;
}

interface ErrorPayload {
  error: string;
  error_description: string;
}

router.post("/", async (req: any, res: any) => {
  try {
    console.log("req in verify");
    const { googleToken, accesskey, secretaccesskey } =
      (await req.body) as ReqBody;

    if (!googleToken || !accesskey || !secretaccesskey) {
      res.status(400).json({ message: "Missing required fields" });
      return;
    }

    const result = await JWTService.tokenVerify(googleToken);

    if ("error" in result) {
      const error = result as ErrorPayload;
      res.status(401).json({
        message: "Google token verification failed",
        details: error.error_description,
      });
      return;
    }

    const decodedPayload = result as DecodePayload;
    console.log("Decoded Google User:", decodedPayload);

    const existingUser = await prisma.user.findUnique({
      where: { email: decodedPayload.email },
    });

    if (!existingUser) {
      const newUser = await prisma.user.create({
        data: {
          email: decodedPayload.email,
          name: decodedPayload.given_name,
          accessKeyID: accesskey,
          secretAccesskeyId: secretaccesskey,
        },
      });
      return res
        .status(200)
        .json({ token: await JWTService.generateJWT(newUser.id) });
    }

    res
      .status(200)
      .json({ token: await JWTService.generateJWT(existingUser.id) });
  } catch (err) {
    console.error("Error in /token route:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
