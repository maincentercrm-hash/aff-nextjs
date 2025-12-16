# Validation Implementation Plan

## หลักการ: ไม่กระทบการทำงานเดิม

แผนนี้ออกแบบมาให้:
- เพิ่ม validation layer แยกต่างหาก
- ไม่แก้ไข logic การทำงานเดิม
- ค่อยๆ เพิ่มทีละส่วน (Incremental)
- สามารถ rollback ได้ง่าย

---

## Phase 1: Setup Foundation (ไม่กระทบระบบเดิม)

### 1.1 ติดตั้ง Dependencies
```bash
npm install zod react-hook-form @hookform/resolvers
```

### 1.2 สร้างโฟลเดอร์ใหม่
```
src/
├── validations/           # NEW - validation schemas
│   ├── schemas/
│   │   ├── missionSchema.ts
│   │   ├── campaignSchema.ts
│   │   ├── pointSchema.ts
│   │   ├── communitySchema.ts
│   │   ├── marketingSchema.ts
│   │   ├── supportSchema.ts
│   │   ├── settingSchema.ts
│   │   ├── mediasSchema.ts
│   │   ├── authSchema.ts
│   │   └── index.ts
│   ├── api/
│   │   └── tableWhitelist.ts
│   └── index.ts
```

---

## Phase 2: สร้าง Validation Schemas

### 2.1 Mission Schema
**File:** `src/validations/schemas/missionSchema.ts`
```typescript
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
    .number({ invalid_type_error: 'กรุณากรอกตัวเลข' })
    .positive('คะแนนต้องมากกว่า 0'),
  startDate: z
    .date({ required_error: 'กรุณาเลือกวันเริ่มต้น' }),
  endDate: z
    .date({ required_error: 'กรุณาเลือกวันสิ้นสุด' }),
  type: z
    .string()
    .min(1, 'กรุณาเลือกประเภท'),
  status: z
    .string()
    .min(1, 'กรุณาเลือกสถานะ'),
  condition: z.string().optional(),
  session: z.number().optional(),
  thumbnail: z.any().optional()
}).refine((data) => data.endDate > data.startDate, {
  message: 'วันสิ้นสุดต้องมากกว่าวันเริ่มต้น',
  path: ['endDate']
})

export type MissionFormData = z.infer<typeof missionSchema>
```

### 2.2 Campaign Schema
**File:** `src/validations/schemas/campaignSchema.ts`
```typescript
import { z } from 'zod'

export const campaignSchema = z.object({
  title: z
    .string()
    .min(1, 'กรุณากรอกชื่อแคมเปญ')
    .max(100, 'ชื่อต้องไม่เกิน 100 ตัวอักษร'),
  description: z
    .string()
    .max(500, 'รายละเอียดต้องไม่เกิน 500 ตัวอักษร')
    .optional(),
  target: z
    .string()
    .min(1, 'กรุณาเลือกกลุ่มเป้าหมาย'),
  thumbnail: z.any().optional()
})

export type CampaignFormData = z.infer<typeof campaignSchema>
```

### 2.3 Point Schema
**File:** `src/validations/schemas/pointSchema.ts`
```typescript
import { z } from 'zod'

export const pointSchema = z.object({
  title: z
    .string()
    .min(1, 'กรุณากรอกชื่อรางวัล'),
  point: z
    .number({ invalid_type_error: 'กรุณากรอกตัวเลข' })
    .positive('คะแนนต้องมากกว่า 0'),
  type: z
    .enum(['default', 'credit'], {
      required_error: 'กรุณาเลือกประเภท'
    }),
  reward: z.string().optional(),
  status: z
    .string()
    .min(1, 'กรุณาเลือกสถานะ'),
  thumbnail: z.any().optional()
}).refine((data) => {
  if (data.type === 'credit') {
    return data.reward && data.reward.length > 0
  }
  return true
}, {
  message: 'กรุณากรอก reward เมื่อเลือกประเภท credit',
  path: ['reward']
})

export type PointFormData = z.infer<typeof pointSchema>
```

### 2.4 Auth Schema
**File:** `src/validations/schemas/authSchema.ts`
```typescript
import { z } from 'zod'

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'กรุณากรอกอีเมล')
    .email('รูปแบบอีเมลไม่ถูกต้อง'),
  password: z
    .string()
    .min(1, 'กรุณากรอกรหัสผ่าน')
})

export const registerSchema = z.object({
  email: z
    .string()
    .min(1, 'กรุณากรอกอีเมล')
    .email('รูปแบบอีเมลไม่ถูกต้อง'),
  password: z
    .string()
    .min(8, 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร')
    .regex(/[A-Z]/, 'ต้องมีตัวพิมพ์ใหญ่อย่างน้อย 1 ตัว')
    .regex(/[0-9]/, 'ต้องมีตัวเลขอย่างน้อย 1 ตัว')
})

export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
```

### 2.5 Community, Marketing, Support, Setting, Medias Schemas
**File:** `src/validations/schemas/index.ts`
```typescript
export * from './missionSchema'
export * from './campaignSchema'
export * from './pointSchema'
export * from './authSchema'
export * from './communitySchema'
export * from './marketingSchema'
export * from './supportSchema'
export * from './settingSchema'
export * from './mediasSchema'
```

---

## Phase 3: สร้าง Validation Hook (ไม่กระทบระบบเดิม)

### 3.1 Custom Validation Hook
**File:** `src/validations/useFormValidation.ts`
```typescript
import { useState, useCallback } from 'react'
import { z } from 'zod'

interface ValidationResult {
  isValid: boolean
  errors: Record<string, string>
}

export function useFormValidation<T extends z.ZodObject<any>>(schema: T) {
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = useCallback((data: unknown): ValidationResult => {
    const result = schema.safeParse(data)

    if (result.success) {
      setErrors({})
      return { isValid: true, errors: {} }
    }

    const newErrors: Record<string, string> = {}
    result.error.errors.forEach((err) => {
      const path = err.path.join('.')
      newErrors[path] = err.message
    })

    setErrors(newErrors)
    return { isValid: false, errors: newErrors }
  }, [schema])

  const clearErrors = useCallback(() => {
    setErrors({})
  }, [])

  const getError = useCallback((field: string) => {
    return errors[field] || ''
  }, [errors])

  return {
    validate,
    errors,
    getError,
    clearErrors,
    hasErrors: Object.keys(errors).length > 0
  }
}
```

---

## Phase 4: สร้าง API Whitelist (Security Fix)

### 4.1 Table Whitelist
**File:** `src/validations/api/tableWhitelist.ts`
```typescript
// Allowed table names for CRUD operations
export const ALLOWED_TABLES = [
  'tbl_mission',
  'tbl_campaign',
  'tbl_community',
  'tbl_point',
  'tbl_online_marketings',
  'tbl_medias',
  'tbl_support',
  'tbl_setting',
  'tbl_client',
  'tbl_pointlog'
] as const

export type AllowedTable = typeof ALLOWED_TABLES[number]

export function isValidTable(table: string): table is AllowedTable {
  return ALLOWED_TABLES.includes(table as AllowedTable)
}
```

### 4.2 อัปเดต API Create (เพิ่ม whitelist check)
**File:** `src/app/api/create/route.ts` - เพิ่มบรรทัดเดียว
```typescript
// เพิ่มที่บรรทัดแรกของ function
import { isValidTable } from '@/validations/api/tableWhitelist'

// เพิ่มหลัง const { table, data } = await req.json();
if (!isValidTable(table)) {
  return NextResponse.json({
    message: 'Invalid table name',
    type: 'error'
  }, { status: 400 })
}
```

---

## Phase 5: Integration Strategy (ค่อยๆ เพิ่ม)

### วิธีที่ 1: Wrapper Component (แนะนำ)
สร้าง wrapper component ใหม่ที่ห่อ component เดิม

**File:** `src/components/dashboard/mission/DialogCreateValidated.tsx`
```typescript
'use client'

import { useState } from 'react'
import { useFormValidation } from '@/validations/useFormValidation'
import { missionSchema } from '@/validations/schemas'
import DialogCreate from './DialogCreate' // component เดิม

// Export wrapper ที่มี validation
export default function DialogCreateValidated(props: any) {
  const { validate, getError, hasErrors } = useFormValidation(missionSchema)

  // ใช้ DialogCreate เดิม แต่เพิ่ม validation layer
  const handleBeforeCreate = (data: any) => {
    const { isValid } = validate(data)
    return isValid
  }

  return (
    <DialogCreate
      {...props}
      onBeforeCreate={handleBeforeCreate}
      getError={getError}
    />
  )
}
```

### วิธีที่ 2: เพิ่ม Validation ใน handleCreate (Minimal Change)
เพิ่มโค้ดเพียง 5 บรรทัดในแต่ละ DialogCreate

```typescript
// เพิ่ม import
import { useFormValidation } from '@/validations/useFormValidation'
import { missionSchema } from '@/validations/schemas'

// เพิ่มใน component
const { validate, getError } = useFormValidation(missionSchema)

// แก้ไข handleCreate
const handleCreate = async () => {
  const { isValid } = validate(data)  // เพิ่มบรรทัดนี้
  if (!isValid) return                 // เพิ่มบรรทัดนี้

  await actionCreate('tbl_mission', data)
  // ... โค้ดเดิม
}
```

---

## Phase 6: Error Display Component

### 6.1 สร้าง Error Text Component
**File:** `src/components/common/FieldError.tsx`
```typescript
import Typography from '@mui/material/Typography'

interface FieldErrorProps {
  error?: string
}

export default function FieldError({ error }: FieldErrorProps) {
  if (!error) return null

  return (
    <Typography
      variant="caption"
      color="error"
      sx={{ mt: 0.5, display: 'block' }}
    >
      {error}
    </Typography>
  )
}
```

### 6.2 การใช้งานกับ CustomTextField
```typescript
<CustomTextField
  id="title"
  label="ชื่อภารกิจ"
  error={!!getError('title')}
  helperText={getError('title')}
  onChange={handleChangeData}
/>
```

---

## Implementation Order (ลำดับการทำ)

### Week 1: Foundation
| Task | Priority | Impact |
|------|----------|--------|
| ติดตั้ง zod | HIGH | None |
| สร้าง schemas ทั้งหมด | HIGH | None |
| สร้าง useFormValidation hook | HIGH | None |
| สร้าง API whitelist | CRITICAL | Security Fix |

### Week 2: Critical Forms
| Task | Priority | Impact |
|------|----------|--------|
| Mission DialogCreate | HIGH | Minimal |
| Point DialogCreate | HIGH | Minimal |
| Campaign DialogCreate | HIGH | Minimal |

### Week 3: Auth & Others
| Task | Priority | Impact |
|------|----------|--------|
| Login Form | MEDIUM | Minimal |
| Register Form | MEDIUM | Minimal |
| Community, Marketing, Support | LOW | Minimal |

---

## Rollback Strategy

หากมีปัญหา สามารถ rollback ได้ง่าย:

1. **ลบ validation check ออก** - เพียงลบ 2 บรรทัดที่เพิ่มใน handleCreate
2. **ใช้ component เดิม** - ถ้าใช้ wrapper approach
3. **Schema files** - ไม่กระทบระบบ สามารถลบได้เลย

---

## Testing Checklist

### สำหรับแต่ละ Form
- [ ] สามารถสร้างข้อมูลที่ถูกต้องได้
- [ ] แสดง error เมื่อข้อมูลไม่ครบ
- [ ] แสดง error เมื่อข้อมูลผิด format
- [ ] error หายไปเมื่อแก้ไขแล้ว
- [ ] ไม่มี regression กับ feature เดิม

---

## Files to Create (Summary)

```
src/validations/
├── schemas/
│   ├── missionSchema.ts      # NEW
│   ├── campaignSchema.ts     # NEW
│   ├── pointSchema.ts        # NEW
│   ├── communitySchema.ts    # NEW
│   ├── marketingSchema.ts    # NEW
│   ├── supportSchema.ts      # NEW
│   ├── settingSchema.ts      # NEW
│   ├── mediasSchema.ts       # NEW
│   ├── authSchema.ts         # NEW
│   └── index.ts              # NEW
├── api/
│   └── tableWhitelist.ts     # NEW (Security)
├── useFormValidation.ts      # NEW
└── index.ts                  # NEW

src/components/common/
└── FieldError.tsx            # NEW
```

## Files to Modify (Minimal Changes)

```
src/app/api/create/route.ts          # +5 lines (whitelist)
src/app/api/update/route.ts          # +5 lines (whitelist)
src/components/dashboard/*/DialogCreate.tsx  # +5 lines each
```

---

## Conclusion

แผนนี้ออกแบบมาให้:
1. **ไม่กระทบระบบเดิม** - สร้างไฟล์ใหม่เป็นหลัก
2. **แก้ไขน้อยที่สุด** - เพิ่มแค่ 2-5 บรรทัดต่อ component
3. **Rollback ง่าย** - ลบโค้ดที่เพิ่มออกได้ทันที
4. **ทำเป็น Phase** - ทำทีละส่วน ทดสอบได้
5. **แก้ Security ก่อน** - API whitelist เป็นอันดับแรก
