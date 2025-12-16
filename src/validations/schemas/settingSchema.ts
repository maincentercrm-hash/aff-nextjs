import { z } from 'zod'

export const settingSchema = z.object({
  key: z
    .string()
    .min(1, 'กรุณากรอก key')
    .max(50, 'key ต้องไม่เกิน 50 ตัวอักษร')
    .regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/, 'key ต้องเป็นตัวอักษรภาษาอังกฤษและ underscore เท่านั้น'),
  value: z
    .string()
    .min(1, 'กรุณากรอก value'),
  point: z
    .union([z.string(), z.number()])
    .transform((val) => Number(val))
    .optional()
})

export type SettingFormData = z.infer<typeof settingSchema>

export const settingPartialSchema = settingSchema.partial()
