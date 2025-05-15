import e, { Router } from "express";
import jwt from "jsonwebtoken";
import { keycloak } from "../../../middleware/keyclock";
import { prisma } from "../../../client/db";
import { error } from "console";

const router = Router();

router.get("/", keycloak.protect(), async (req: any, res: any) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ error: "Missing or invalid Authorization header" });
    }

    const token = authHeader.split(" ")[1];

    const decoded: any = jwt.decode(token);
    const email = decoded.email;
    console.log(email);

    const users = await prisma.user.findUnique({ where: { email: email } });
    if (!users) {
      return res.status(404).json({ error: "no user found" });
    }
    if (!users?.accessKeyID || !users?.secretAccesskeyId) {
      return res.status(401).json({ error: "Invalid token" });
    }

    return res.status(200).json({
      accessKeyId: users.accessKeyID,
      secretkey: users.secretAccesskeyId,
    });
  } catch (err) {
    console.error("Error fetching keys:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", keycloak.protect(), async (req: any, res: any) => {
  console.log("ssss");
  const authHeader = req.headers.authorization;
  const { accessKeyId, secretAccessKey } = await req.body;
  console.log(accessKeyId, secretAccessKey);

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ error: "Missing or invalid Authorization header" });
  }
  const token = authHeader.split(" ")[1];
  const decoded = jwt.decode(token) as { given_name: string; email: string };
  try {
    const newuser = await prisma.user.create({
      data: {
        email: decoded.email,
        name: decoded.given_name,
        accessKeyID: accessKeyId,
        secretAccesskeyId: secretAccessKey,
      },
    });
    res.status(200).json({ user: newuser });
  } catch (err) {
    res.status(404).json({ error: "not made the new user" });
  }
});

export default router;
