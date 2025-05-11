// E:\intern_backend\src\routes\isCredGiven\isCregGive.ts
import { Router, Request, Response } from "express";
import JWTService from "../../../Service/JWTservice/jwtverify";
import { prisma } from "../../../client/db";

const router = Router();

router.post("/", async (req: any, res: any) => {
  const email = await req.body.email;
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid token" });
  }

  const token = authHeader.split(" ")[1];

  const user = await prisma.user.findUnique({ where: { id: id } });
  if (user) {
    const token = await JWTService.generateJWT(user.id);
    return res.status(200).json({ present: true, token: token });
  }
  return res.status(200).json({ present: false });
});

export default router;
