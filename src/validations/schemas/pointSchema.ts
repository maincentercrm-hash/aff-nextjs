import { z } from 'zod'

export const pointSchema = z.object({
  title: z
    .string({ required_error: 'กรุณากรอกชื่อรางวัล' })
    .min(1, 'กรุณากรอกชื่อรางวัล'),
  point: z
    .union([z.string(), z.number()])
    .transform((val) => Number(val))
    .refine((val) => !isNaN(val), 'กรุณากรอกตัวเลข')
    .refine((val) => val > 0, 'คะแนนต้องมากกว่า 0'),
  type: z
    .string({ required_error: 'กรุณาเลือกประเภท' })
    .min(1, 'กรุณาเลือกประเภท'),
  reward: z.string().optional(),
  status: z
    .string({ required_error: 'กรุณาเลือกสถานะ' })
    .min(1, 'กรุณาเลือกสถานะ'),
  thumbnail: z.any().optional()
}).refine((data) => {
  // ถ้า type เป็น credit ต้องกรอก reward
  if (data.type === 'credit') {
    return data.reward && data.reward.length > 0
  }
  return true
}, {
  message: 'กรุณากรอก reward เมื่อเลือกประเภท credit',
  path: ['reward']
})

export type PointFormData = z.infer<typeof pointSchema>

export const pointPartialSchema = pointSchema.partial()
