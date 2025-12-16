import { z } from 'zod'

export const campaignSchema = z.object({
  title: z
    .string()
    .min(1, 'กรุณากรอกชื่อแคมเปญ')
    .max(100, 'ชื่อต้องไม่เกิน 100 ตัวอักษร'),
  detail: z
    .string()
    .max(500, 'รายละเอียดต้องไม่เกิน 500 ตัวอักษร')
    .optional(),
  target: z
    .string()
    .min(1, 'กรุณาเลือกกลุ่มเป้าหมาย'),
  thumbnail: z.any().optional(),
  volumn: z.number().optional(),
  click: z.number().optional(),
  active: z.number().optional(),
  users: z.array(z.any()).optional()
})

export type CampaignFormData = z.infer<typeof campaignSchema>

export const campaignPartialSchema = campaignSchema.partial()
