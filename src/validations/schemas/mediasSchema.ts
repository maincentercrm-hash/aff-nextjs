import { z } from 'zod'

// Allowed file types
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm']
const ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES]

// Max file size (5MB for images, 50MB for videos)
const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024 // 50MB

export const mediasSchema = z.object({
  file: z
    .any()
    .refine((file) => file && file.length > 0, 'กรุณาเลือกไฟล์'),
  thumbnail: z.any().optional()
})

// สำหรับ validate file ก่อน upload
export const fileValidationSchema = z.object({
  name: z.string(),
  size: z.number(),
  type: z.string()
}).refine((file) => ALLOWED_TYPES.includes(file.type), {
  message: 'ประเภทไฟล์ไม่รองรับ (รองรับ: JPG, PNG, GIF, WebP, MP4, WebM)'
}).refine((file) => {
  if (ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return file.size <= MAX_IMAGE_SIZE
  }

  if (ALLOWED_VIDEO_TYPES.includes(file.type)) {
    return file.size <= MAX_VIDEO_SIZE
  }

  return false
}, {
  message: 'ไฟล์มีขนาดใหญ่เกินไป (รูปภาพ: 5MB, วิดีโอ: 50MB)'
})

export type MediasFormData = z.infer<typeof mediasSchema>

export const mediasPartialSchema = mediasSchema.partial()
