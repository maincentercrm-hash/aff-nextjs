import { z } from 'zod'

export const supportSchema = z.object({
  title: z
    .string()
    .min(1, 'กรุณากรอกชื่อ')
    .max(100, 'ชื่อต้องไม่เกิน 100 ตัวอักษร'),
  excerpt: z
    .string()
    .max(300, 'คำอธิบายย่อต้องไม่เกิน 300 ตัวอักษร')
    .optional(),
  detail: z.string().optional(),
  status: z
    .string()
    .min(1, 'กรุณาเลือกสถานะ'),
  thumbnail: z.any().optional()
})

export type SupportFormData = z.infer<typeof supportSchema>

export const supportPartialSchema = supportSchema.partial()
