import { z } from 'zod';
import { PASSWORD_MIN_LENGTH, PASSWORD_MIN_LENGTH_MESSAGE } from '../../shared/constants/index.js';

export const SignupBodySchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  password: z.string().min(PASSWORD_MIN_LENGTH, PASSWORD_MIN_LENGTH_MESSAGE),
  organizationId: z.string().min(1).optional(),
});

export const LoginBodySchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const ForgotPasswordBodySchema = z.object({
  email: z.string().email(),
});

export const ResetPasswordBodySchema = z.object({
  token: z.string().min(1),
  newPassword: z.string().min(PASSWORD_MIN_LENGTH, PASSWORD_MIN_LENGTH_MESSAGE),
});

export const RefreshBodySchema = z.object({
  token: z.string().min(1),
});

export type SignupInput = z.infer<typeof SignupBodySchema>;
export type LoginInput = z.infer<typeof LoginBodySchema>;
export type ForgotPasswordInput = z.infer<typeof ForgotPasswordBodySchema>;
export type ResetPasswordInput = z.infer<typeof ResetPasswordBodySchema>;
export type RefreshInput = z.infer<typeof RefreshBodySchema>;
