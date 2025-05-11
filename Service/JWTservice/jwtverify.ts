// E:\intern_backend\Service\JWTservice\jwtverify.ts
import jwt from "jsonwebtoken";
import { prisma } from "../../client/db";

interface TokenDesign {
  id: number | undefined;
  email: string | undefined;
  accessKey: string | undefined;
  secretAccessKey: string | undefined;
}

class JWTService {
  public static async tokenVerify(googleToken: string): Promise<Object> {
    const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${googleToken}` },
      method: "GET",
    });

    const data = await res.json();

    if (!res.ok || data.error) {
      return {
        error: data.error || "invalid_request",
        error_description: data.error_description || "Invalid token",
      };
    }

    return data;
  }

  public static async generateJWT(id: number): Promise<string> {
    const secret = process.env.JWT_SECRET || "defaultsecret";
    const user = await prisma.user.findUnique({ where: { id: id } });

    const payload: TokenDesign = {
      id: user?.id,
      email: user?.email,
      accessKey: user?.accessKeyID,
      secretAccessKey: user?.secretAccesskeyId,
    };

    const token = jwt.sign(payload, secret, {
      expiresIn: "2h",
    });

    return token;
  }

  public static verifyJWT(token: string): TokenDesign {
    const secret = process.env.JWT_SECRET || "defaultsecret";
    try {
      const decoded = jwt.verify(token, secret) as TokenDesign;
      return decoded;
    } catch (err) {
      throw new Error("Invalid or expired token");
    }
  }
}

export default JWTService;
