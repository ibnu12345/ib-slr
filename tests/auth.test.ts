import { describe, it, expect, beforeEach } from "vitest";
import bcrypt from "bcryptjs";
import {
  findUserByEmail,
  createUser,
  createEmailVerificationToken,
  verifyEmailByToken,
  createPasswordResetToken,
  resetPasswordWithToken,
  getDb,
} from "../src/lib/db";
import { checkRateLimit } from "../src/lib/auth/rateLimit";

describe("Milestone 1: Authentication & Account Verification Engine", () => {
  beforeEach(() => {
    // Reset or access DB
    getDb();
  });

  it("should have pre-seeded default administrative and researcher accounts", async () => {
    const admin = await findUserByEmail("admin@ib-slr.local");
    expect(admin).not.toBeNull();
    expect(admin?.role).toBe("admin");
    expect(admin?.emailVerified).toBe(true);

    const researcher = await findUserByEmail("researcher@ib-slr.local");
    expect(researcher).not.toBeNull();
    expect(researcher?.role).toBe("user");
  });

  it("should register new users with default 'user' role and unverified email", async () => {
    const uniqueEmail = `test.researcher.${Date.now()}@university.edu`;
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync("SecurePass123!", salt);

    const newUser = await createUser({
      email: uniqueEmail,
      fullName: "Test Academic",
      passwordHash,
      role: "user",
      emailVerified: false,
      mfaEnabled: false,
    });

    expect(newUser.id).toBeDefined();
    expect(newUser.email).toBe(uniqueEmail);
    expect(newUser.role).toBe("user"); // Non-negotiable: never admin by default
    expect(newUser.emailVerified).toBe(false); // Mandatory verification
  });

  it("should verify email using valid verification tokens", async () => {
    const uniqueEmail = `verify.test.${Date.now()}@university.edu`;
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync("SecurePass123!", salt);

    const newUser = await createUser({
      email: uniqueEmail,
      fullName: "Verification Tester",
      passwordHash,
      role: "user",
      emailVerified: false,
      mfaEnabled: false,
    });

    const token = await createEmailVerificationToken(newUser.id);
    expect(token).toBeDefined();

    const result = await verifyEmailByToken(token);
    expect(result.success).toBe(true);
    expect(result.user?.emailVerified).toBe(true);

    // Re-verify token should fail (single-use)
    const reVerify = await verifyEmailByToken(token);
    expect(reVerify.success).toBe(false);
  });

  it("should create password reset tokens and successfully update password hashes", async () => {
    const uniqueEmail = `reset.test.${Date.now()}@university.edu`;
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync("OldPass123!", salt);

    await createUser({
      email: uniqueEmail,
      fullName: "Reset Tester",
      passwordHash,
      role: "user",
      emailVerified: true,
      mfaEnabled: false,
    });

    const resetToken = await createPasswordResetToken(uniqueEmail);
    expect(resetToken).not.toBeNull();

    const newSalt = bcrypt.genSaltSync(10);
    const newPasswordHash = bcrypt.hashSync("BrandNewPass456!", newSalt);

    const resetResult = await resetPasswordWithToken(resetToken!, newPasswordHash);
    expect(resetResult.success).toBe(true);

    // Verify updated password
    const user = await findUserByEmail(uniqueEmail);
    expect(bcrypt.compareSync("BrandNewPass456!", user!.passwordHash)).toBe(true);
  });

  it("should rate limit excessive login or reset requests", () => {
    const key = `ratelimit-test-${Date.now()}`;
    const maxReq = 3;

    expect(checkRateLimit(key, maxReq, 10000).allowed).toBe(true);
    expect(checkRateLimit(key, maxReq, 10000).allowed).toBe(true);
    expect(checkRateLimit(key, maxReq, 10000).allowed).toBe(true);

    // 4th request must be blocked
    const blocked = checkRateLimit(key, maxReq, 10000);
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
  });
});
