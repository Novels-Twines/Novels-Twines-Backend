import { Router } from "express";
import { CreatorApplicationStatus } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { authenticate, requireRole } from "../middleware/auth";

const router = Router();

router.post("/applications", authenticate, requireRole("READER"), async (request, response) => {
  const account = request.account!;
  if (account.creatorApplicationStatus === CreatorApplicationStatus.PENDING) {
    response.status(409).json({
      error: { code: "APPLICATION_PENDING", message: "Your creator application is already under review." },
    });
    return;
  }

  const updated = await prisma.user.update({
    where: { id: account.id },
    data: { creatorApplicationStatus: CreatorApplicationStatus.PENDING },
  });

  response.status(202).json({
    application: {
      status: updated.creatorApplicationStatus,
      submittedAt: updated.updatedAt,
    },
  });
});

export default router;
