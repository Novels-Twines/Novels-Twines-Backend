import type { User } from "@prisma/client";
import type { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { getSupabaseAdmin } from "../lib/supabase";

declare global {
  namespace Express {
    interface Request {
      account?: User;
    }
  }
}

function sendAuthError(response: Response, status: number, code: string, message: string) {
  response.status(status).json({ error: { code, message } });
}

export async function authenticate(request: Request, response: Response, next: NextFunction) {
  const authorization = request.header("authorization");
  if (!authorization?.startsWith("Bearer ")) {
    sendAuthError(response, 401, "AUTH_REQUIRED", "A valid sign-in session is required.");
    return;
  }

  const accessToken = authorization.slice("Bearer ".length).trim();
  if (!accessToken) {
    sendAuthError(response, 401, "AUTH_REQUIRED", "A valid sign-in session is required.");
    return;
  }

  try {
    const { data, error } = await getSupabaseAdmin().auth.getUser(accessToken);
    if (error || !data.user) {
      sendAuthError(response, 401, "INVALID_SESSION", "Your sign-in session is invalid or expired.");
      return;
    }

    const email = data.user.email;
    if (!email || !data.user.email_confirmed_at) {
      sendAuthError(response, 403, "EMAIL_VERIFICATION_REQUIRED", "Confirm your email address before using Novels-Twines.");
      return;
    }

    request.account = await prisma.user.upsert({
      where: { supabaseUserId: data.user.id },
      create: {
        supabaseUserId: data.user.id,
        email,
        emailVerifiedAt: new Date(data.user.email_confirmed_at),
      },
      update: {
        email,
        emailVerifiedAt: data.user.email_confirmed_at
          ? new Date(data.user.email_confirmed_at)
          : null,
      },
    });

    next();
  } catch (error) {
    if (error instanceof Error && error.message === "SUPABASE_NOT_CONFIGURED") {
      sendAuthError(response, 503, "AUTH_NOT_CONFIGURED", "Authentication is not configured on this server.");
      return;
    }
    next(error);
  }
}

export function requireRole(...roles: User["role"][]) {
  return (request: Request, response: Response, next: NextFunction) => {
    if (!request.account) {
      sendAuthError(response, 401, "AUTH_REQUIRED", "A valid sign-in session is required.");
      return;
    }
    if (!roles.includes(request.account.role)) {
      sendAuthError(response, 403, "FORBIDDEN", "You do not have permission to perform this action.");
      return;
    }
    next();
  };
}
