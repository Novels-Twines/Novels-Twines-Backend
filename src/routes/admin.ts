import { CreatorApplicationStatus, UserRole } from "@prisma/client";
import { Router } from "express";
import { prisma } from "../lib/prisma";
import { authenticate, requireRole } from "../middleware/auth";

const router = Router();

router.get("/creator-applications", authenticate, requireRole(UserRole.ADMIN), async (_request, response) => {
  const applications = await prisma.user.findMany({
    where: { creatorApplicationStatus: CreatorApplicationStatus.PENDING },
    select: { id: true, email: true, createdAt: true, updatedAt: true },
    orderBy: { updatedAt: "asc" },
  });

  response.status(200).json({ applications });
});

router.patch("/creator-applications/:userId", authenticate, requireRole(UserRole.ADMIN), async (request, response) => {
  const userId = Array.isArray(request.params.userId) ? request.params.userId[0] : request.params.userId;
  if (!userId) {
    response.status(400).json({
      error: { code: "INVALID_USER_ID", message: "A valid user ID is required." },
    });
    return;
  }

  const decision = request.body?.decision;
  if (decision !== "approve" && decision !== "reject") {
    response.status(400).json({
      error: { code: "INVALID_DECISION", message: "Decision must be approve or reject." },
    });
    return;
  }

  const updated = await prisma.user.updateMany({
    where: {
      id: userId,
      creatorApplicationStatus: CreatorApplicationStatus.PENDING,
    },
    data: {
      creatorApplicationStatus:
        decision === "approve" ? CreatorApplicationStatus.APPROVED : CreatorApplicationStatus.REJECTED,
      role: decision === "approve" ? UserRole.CREATOR : UserRole.READER,
    },
  });

  if (updated.count !== 1) {
    response.status(404).json({
      error: { code: "APPLICATION_NOT_FOUND", message: "No pending creator application was found for that user." },
    });
    return;
  }

  const account = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { id: true, email: true, role: true, creatorApplicationStatus: true },
  });

  response.status(200).json({ user: account });
});

export default router;
