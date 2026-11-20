import { z } from "zod";
import { sanitizeText, uuidSchema } from "./common";

export const taskStateSchema = z.object({
  taskId: uuidSchema,
  completed: z.boolean(),
});

export const messageSchema = z.object({
  channelId: uuidSchema,
  content: z
    .string()
    .trim()
    .min(1, "Write a message before sending.")
    .max(10_000, "Messages are limited to 10,000 characters.")
    .transform(sanitizeText)
    .refine((value) => value.length > 0, "Write a message before sending."),
});

export const notificationUpdateSchema = z.object({
  ids: z.array(uuidSchema).min(1).max(100),
  read: z.boolean(),
});

export const savedResourceSchema = z.object({
  documentId: uuidSchema,
  save: z.boolean(),
});

export const profileUpdateSchema = z.object({
  fullName: z.string().trim().min(1, "Enter your name.").max(120, "Name is too long.").transform(sanitizeText),
});

export type TaskStateInput = z.infer<typeof taskStateSchema>;
export type MessageInput = z.infer<typeof messageSchema>;
export type NotificationUpdateInput = z.infer<typeof notificationUpdateSchema>;
export type SavedResourceInput = z.infer<typeof savedResourceSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
