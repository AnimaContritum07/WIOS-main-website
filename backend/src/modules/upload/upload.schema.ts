import { z } from "zod";

export const deleteImageInputSchema = z.object({
  key: z.string().min(1, "File key is required"),
  eventId: z.string().optional(),
});

export type DeleteImageInput = z.infer<typeof deleteImageInputSchema>;

export const uploadedImageSchema = z.object({
  url: z.string().url(),
  key: z.string().min(1),
  name: z.string().optional(),
  size: z.number().optional(),
  alt: z.string().optional().default(""),
  uploadedAt: z.string().optional().default(() => new Date().toISOString()),
});

export type UploadedImage = z.infer<typeof uploadedImageSchema>;
