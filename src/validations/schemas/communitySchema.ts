import { z } from 'zod'

export const communitySchema = z.object({
  title: z
    .string({ required_error: 'กรุณากรอกชื่อ' })
    .min(1, 'กรุณากรอกชื่อ')
    .max(100, 'ชื่อต้องไม่เกิน 100 ตัวอักษร'),
  excerpt: z
    .string()
    .max(300, 'คำอธิบายย่อต้องไม่เกิน 300 ตัวอักษร')
    .optional(),
  category: z
    .string({ required_error: 'กรุณาเลือกหมวดหมู่' })
    .min(1, 'กรุณาเลือกหมวดหมู่'),
  status: z
    .string({ required_error: 'กรุณาเลือกสถานะ' })
    .min(1, 'กรุณาเลือกสถานะ'),
  thumbnail: z.any().optional()
})

export type CommunityFormData = z.infer<typeof communitySchema>

export const communityPartialSchema = communitySchema.partial()
