import { z } from 'zod'

export const settingSchema = z.object({
  title: z
    .string()
    .min(1, 'กรุณากรอกชื่อ')
    .max(100, 'ชื่อต้องไม่เกิน 100 ตัวอักษร'),
  point: z
    .union([z.string(), z.number()])
    .transform((val) => Number(val))
    .optional()
})

export type SettingFormData = z.infer<typeof settingSchema>

export const settingPartialSchema = settingSchema.partial()
