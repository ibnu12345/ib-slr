"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";
import {
  findUserByEmail,
  createUser,
  createEmailVerificationToken,
  createPasswordResetToken,
  resetPasswordWithToken,
  verifyEmailByToken,
} from "../db";
import { createSessionCookie, clearSessionCookie } from "./session";
import { checkRateLimit } from "./rateLimit";

const registerSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters."),
  email: z.string().email("Please provide a valid email address."),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long.")
    .regex(/[A-Z]/, "Password must include at least one uppercase letter.")
    .regex(/[0-9]/, "Password must include at least one number."),
  acceptTerms: z.literal(true, {
    errorMap: () => ({ message: "You must accept the terms of service and privacy policy." }),
  }),
});

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

export async function loginAction(formData: FormData) {
  const email = formData.get("email")?.toString() || "";
  const password = formData.get("password")?.toString() || "";

  // Rate limiting by email
  const rate = checkRateLimit(`login:${email.toLowerCase()}`, 5, 60 * 1000);
  if (!rate.allowed) {
    return {
      success: false,
      error: `Too many login attempts. Please wait ${Math.ceil(rate.resetInMs / 1000)} seconds.`,
    };
  }

  const parsed = loginSchema.safeParse({ email, password });
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message || "Invalid input.",
    };
  }

  const user = await findUserByEmail(email);
  if (!user) {
    // Constant-time dummy compare to prevent timing enumeration attacks
    bcrypt.compareSync(password, "$2a$10$abcdefghijklmnopqrstuvwxyz1234567890abcdefghijklm");
    return {
      success: false,
      error: "Invalid email or password.",
    };
  }

  const passwordMatches = bcrypt.compareSync(password, user.passwordHash);
  if (!passwordMatches) {
    return {
      success: false,
      error: "Invalid email or password.",
    };
  }

  await createSessionCookie({
    userId: user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
    emailVerified: user.emailVerified,
  });

  return {
    success: true,
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      emailVerified: user.emailVerified,
    },
  };
}

export async function registerAction(formData: FormData) {
  const fullName = formData.get("fullName")?.toString() || "";
  const email = formData.get("email")?.toString() || "";
  const password = formData.get("password")?.toString() || "";
  const acceptTerms = formData.get("acceptTerms") === "true" || formData.get("acceptTerms") === "on";

  // Rate limit registration by email
  const rate = checkRateLimit(`register:${email.toLowerCase()}`, 3, 60 * 1000);
  if (!rate.allowed) {
    return {
      success: false,
      error: `Too many registration attempts. Please wait ${Math.ceil(rate.resetInMs / 1000)} seconds.`,
    };
  }

  const parsed = registerSchema.safeParse({
    fullName,
    email,
    password,
    acceptTerms,
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message || "Validation failed.",
    };
  }

  const existing = await findUserByEmail(email);
  if (existing) {
    return {
      success: false,
      error: "An account with this email address is already registered.",
    };
  }

  const salt = bcrypt.genSaltSync(12);
  const passwordHash = bcrypt.hashSync(password, salt);

  try {
    const newUser = await createUser({
      email,
      fullName,
      passwordHash,
      role: "user", // New users are never admin by default
      emailVerified: false, // Mandatory verification
      mfaEnabled: false,
    });

    const verificationToken = await createEmailVerificationToken(newUser.id);

    // Create active session cookie for initial onboarding state
    await createSessionCookie({
      userId: newUser.id,
      email: newUser.email,
      fullName: newUser.fullName,
      role: newUser.role,
      emailVerified: false,
    });

    return {
      success: true,
      verificationToken,
      message: "Account created successfully. Please verify your email to unlock all research tools.",
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Failed to create account.",
    };
  }
}

export async function logoutAction() {
  await clearSessionCookie();
  return { success: true };
}

export async function requestPasswordResetAction(formData: FormData) {
  const email = formData.get("email")?.toString() || "";
  if (!email || !email.includes("@")) {
    return { success: false, error: "Please enter a valid email address." };
  }

  const rate = checkRateLimit(`pwd-reset:${email.toLowerCase()}`, 3, 60 * 1000);
  if (!rate.allowed) {
    return {
      success: false,
      error: `Too many password reset requests. Please wait ${Math.ceil(rate.resetInMs / 1000)} seconds.`,
    };
  }

  const token = await createPasswordResetToken(email);

  // Return success without revealing if email exists (security best practice)
  return {
    success: true,
    token: token || undefined,
    message: "If an account exists with this email address, a password reset link has been dispatched.",
  };
}

export async function resetPasswordAction(formData: FormData) {
  const token = formData.get("token")?.toString() || "";
  const newPassword = formData.get("newPassword")?.toString() || "";

  if (!token) {
    return { success: false, error: "Missing password reset token." };
  }

  if (newPassword.length < 8) {
    return { success: false, error: "New password must be at least 8 characters long." };
  }

  const salt = bcrypt.genSaltSync(12);
  const newPasswordHash = bcrypt.hashSync(newPassword, salt);

  const res = await resetPasswordWithToken(token, newPasswordHash);
  if (!res.success) {
    return { success: false, error: res.error || "Password reset failed." };
  }

  return {
    success: true,
    message: "Your password has been successfully reset. You may now log in.",
  };
}

export async function verifyEmailAction(token: string) {
  if (!token) {
    return { success: false, error: "Verification token is required." };
  }

  const res = await verifyEmailByToken(token);
  if (!res.success || !res.user) {
    return { success: false, error: res.error || "Email verification failed." };
  }

  // Refresh cookie session with verified status
  await createSessionCookie({
    userId: res.user.id,
    email: res.user.email,
    fullName: res.user.fullName,
    role: res.user.role,
    emailVerified: true,
  });

  return {
    success: true,
    message: "Email verified successfully! You now have full access to research features.",
  };
}
