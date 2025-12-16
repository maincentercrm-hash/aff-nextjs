import { z } from 'zod'

export const marketingSchema = z.object({
  title: z
    .string({ required_error: 'กรุณากรอกชื่อ' })
    .min(1, 'กรุณากรอกชื่อ')
    .max(100, 'ชื่อต้องไม่เกิน 100 ตัวอักษร'),
  description: z
    .string()
    .max(500, 'รายละเอียดต้องไม่เกิน 500 ตัวอักษร')
    .optional(),
  status: z
    .string({ required_error: 'กรุณาเลือกสถานะ' })
    .min(1, 'กรุณาเลือกสถานะ'),
  thumbnail: z.any().optional()
})

export type MarketingFormData = z.infer<typeof marketingSchema>

export const marketingPartialSchema = marketingSchema.partial()
