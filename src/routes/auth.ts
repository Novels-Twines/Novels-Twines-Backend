import { Router } from "express";
import { authenticate } from "../middleware/auth";

const router = Router();

router.get("/me", authenticate, (request, response) => {
  const account = request.account!;
  response.status(200).json({
    user: {
      id: account.id,
      email: account.email,
      role: account.role,
      creatorApplicationStatus: account.creatorApplicationStatus,
      emailVerifiedAt: account.emailVerifiedAt,
    },
  });
});

export default router;
