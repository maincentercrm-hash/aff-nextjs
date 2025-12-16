import { z } from 'zod'

export const missionSchema = z.object({
  title: z
    .string()
    .min(1, 'กรุณากรอกชื่อภารกิจ')
    .max(100, 'ชื่อภารกิจต้องไม่เกิน 100 ตัวอักษร'),
  detail: z
    .string()
    .min(1, 'กรุณากรอกรายละเอียด'),
  point: z
    .union([z.string(), z.number()])
    .transform((val) => Number(val))
    .refine((val) => !isNaN(val), 'กรุณากรอกตัวเลข')
    .refine((val) => val > 0, 'คะแนนต้องมากกว่า 0'),
  start_date: z.any().refine((val) => {
    if (!val) return false
    const date = new Date(val)

    return !isNaN(date.getTime())
  }, 'กรุณาเลือกวันเริ่มต้น'),
  end_date: z.any().refine((val) => {
    if (!val) return false
    const date = new Date(val)

    return !isNaN(date.getTime())
  }, 'กรุณาเลือกวันสิ้นสุด'),
  type: z
    .string()
    .min(1, 'กรุณาเลือกประเภท'),
  status: z
    .string()
    .min(1, 'กรุณาเลือกสถานะ'),
  condition: z.string().optional(),
  session: z.string().optional(),
  thumbnail: z.any().optional()
}).refine((data) => {
  const start = new Date(data.start_date)
  const end = new Date(data.end_date)

  return end >= start
}, {
  message: 'วันสิ้นสุดต้องมากกว่าหรือเท่ากับวันเริ่มต้น',
  path: ['end_date']
})

export type MissionFormData = z.infer<typeof missionSchema>

// Schema สำหรับ partial validation (edit mode)
export const missionPartialSchema = missionSchema.partial()
