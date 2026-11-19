import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, "Use at least 8 characters.")
  .max(128, "Password is too long.")
  .regex(/[A-Za-z]/, "Include at least one letter.")
  .regex(/[0-9]/, "Include at least one number.");

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
});

export const registerSchema = z
  .object({
    fullName: z.string().trim().min(2, "Enter your full name.").max(120),
    email: z.string().trim().email("Enter a valid email address."),
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Confirm your password."),
    classCode: z.string().trim().min(3, "Enter your class code.").max(40),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
});

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Confirm your password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export const joinClassSchema = z.object({
  classCode: z.string().trim().min(3, "Enter your class code.").max(40),
});

export const onboardingSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name.").max(120),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type JoinClassInput = z.infer<typeof joinClassSchema>;
export type OnboardingInput = z.infer<typeof onboardingSchema>;
