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
  startDate: z
    .union([z.string(), z.date()])
    .transform((val) => new Date(val))
    .refine((val) => !isNaN(val.getTime()), 'กรุณาเลือกวันเริ่มต้น'),
  endDate: z
    .union([z.string(), z.date()])
    .transform((val) => new Date(val))
    .refine((val) => !isNaN(val.getTime()), 'กรุณาเลือกวันสิ้นสุด'),
  type: z
    .string()
    .min(1, 'กรุณาเลือกประเภท'),
  status: z
    .string()
    .min(1, 'กรุณาเลือกสถานะ'),
  condition: z.string().optional(),
  session: z
    .union([z.string(), z.number()])
    .transform((val) => Number(val))
    .optional(),
  thumbnail: z.any().optional()
}).refine((data) => {
  const start = new Date(data.startDate)
  const end = new Date(data.endDate)

  return end >= start
}, {
  message: 'วันสิ้นสุดต้องมากกว่าหรือเท่ากับวันเริ่มต้น',
  path: ['endDate']
})

export type MissionFormData = z.infer<typeof missionSchema>

// Schema สำหรับ partial validation (edit mode)
export const missionPartialSchema = missionSchema.partial()
