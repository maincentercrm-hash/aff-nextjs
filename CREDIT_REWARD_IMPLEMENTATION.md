# Credit Reward Implementation Plan
# แผนการพัฒนาระบบแลกรางวัลประเภท Credit

> **Version:** 1.0
> **Created:** 2025-12-11
> **Related System:** retirement-lottery-go-fiber-main (External API Reference)

---

## สารบัญ

1. [ภาพรวมระบบที่ต้องการ](#1-ภาพรวมระบบที่ต้องการ)
2. [Flow Diagram](#2-flow-diagram)
3. [ความแตกต่างระหว่าง Default และ Credit](#3-ความแตกต่างระหว่าง-default-และ-credit)
4. [สิ่งที่ต้องพัฒนาเพิ่ม](#4-สิ่งที่ต้องพัฒนาเพิ่ม)
5. [Database Schema Changes](#5-database-schema-changes)
6. [API Endpoints ที่ต้องสร้างใหม่](#6-api-endpoints-ที่ต้องสร้างใหม่)
7. [Frontend Changes](#7-frontend-changes)
8. [Configuration](#8-configuration)
9. [Implementation Steps](#9-implementation-steps)

---

## 1. ภาพรวมระบบที่ต้องการ

### 1.1 สถานการณ์ปัจจุบัน

เมื่อ User แลกรางวัล:
1. หัก Points ทันที
2. สร้าง Log (status: pending)
3. ส่ง LINE Notification
4. **Admin ต้อง Approve/Reject manually**

### 1.2 สิ่งที่ต้องการเพิ่ม (เฉพาะ type = "credit")

เมื่อ User แลกรางวัลประเภท **Credit**:
1. หัก Points ทันที
2. สร้าง Log (status: pending)
3. ส่ง LINE Notification
4. **ส่งข้อมูลไป External API อัตโนมัติ**
5. **รอรับ Callback จาก External API**
6. **ถ้า Approve → อัพเดท Log เป็น complete**
7. **ถ้า Reject → อัพเดท Log + คืน Points ให้ User**

---

## 2. Flow Diagram

### 2.1 Flow เปรียบเทียบ Default vs Credit

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    REWARD REDEMPTION FLOW COMPARISON                        │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────┐    ┌─────────────────────────────────────┐
│      TYPE = "default"           │    │         TYPE = "credit"              │
│      (ของรางวัลทั่วไป)            │    │         (เครดิตเกม)                   │
├─────────────────────────────────┤    ├─────────────────────────────────────┤
│                                 │    │                                     │
│  1. User เลือกแลกรางวัล          │    │  1. User เลือกแลกรางวัล              │
│           │                     │    │           │                         │
│           ▼                     │    │           ▼                         │
│  2. ตรวจสอบ Points พอ?          │    │  2. ตรวจสอบ Points พอ?              │
│           │                     │    │           │                         │
│           ▼                     │    │           ▼                         │
│  3. หัก Points                  │    │  3. หัก Points                      │
│           │                     │    │           │                         │
│           ▼                     │    │           ▼                         │
│  4. สร้าง Log (pending)         │    │  4. สร้าง Log (pending)             │
│           │                     │    │           │                         │
│           ▼                     │    │           ▼                         │
│  5. ส่ง LINE Notification       │    │  5. ส่ง LINE Notification           │
│           │                     │    │           │                         │
│           ▼                     │    │           ▼                         │
│  6. จบ (รอ Admin Approve)       │    │  6. ส่งข้อมูลไป External API ──────┐│
│                                 │    │           │                        ││
│                                 │    │           ▼                        ││
│  ═══════════════════════════    │    │  7. รอ Callback                    ││
│  Admin Manual Process:          │    │           │                        ││
│                                 │    │     ┌─────┴─────┐                  ││
│  - เห็นรายการใน Dashboard       │    │     ▼           ▼                  ││
│  - Toggle Approve/Reject        │    │  Approve     Reject                ││
│  - (Reject = ต้องคืน Point      │    │     │           │                  ││
│     manually)                   │    │     ▼           ▼                  ││
│                                 │    │  8a. Update  8b. Update Log       ││
│                                 │    │   Log=done    + คืน Points         ││
│                                 │    │     │           │                  ││
│                                 │    │     ▼           ▼                  ││
│                                 │    │  จบ          จบ                    ││
│                                 │    │                                     │
└─────────────────────────────────┘    └─────────────────────────────────────┘
```

### 2.2 Credit Reward Detailed Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      CREDIT REWARD DETAILED FLOW                            │
└─────────────────────────────────────────────────────────────────────────────┘

         ┌─────────────────┐
         │  User เลือกแลก  │
         │  รางวัล Credit  │
         └────────┬────────┘
                  │
                  ▼
         ┌─────────────────┐
         │  ตรวจสอบ type   │
         │  = "credit" ?   │
         └────────┬────────┘
                  │
         ┌────────┴────────┐
         │ YES             │ NO
         ▼                 ▼
┌─────────────────┐  ┌─────────────────┐
│  Credit Flow    │  │  Default Flow   │
│                 │  │  (เดิม)          │
└────────┬────────┘  └─────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 1: หัก Points + สร้าง Log                                  │
│                                                                  │
│  1a. PATCH /api/point (operation: '-')                          │
│  1b. POST /api/create (tbl_point_logs, status: 'pending')       │
│  1c. POST /api/flexMessage (LINE Notification)                  │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 2: ส่งข้อมูลไป External API                                │
│                                                                  │
│  POST {api_endpoint}/players/v1/line/rewards/claim              │
│                                                                  │
│  Request Body:                                                   │
│  {                                                               │
│    "log_id": "{tbl_point_logs._id}",                            │
│    "user_id": "{LINE_USER_ID}",                                 │
│    "tel": "0891234567",                                         │
│    "reward_title": "เครดิต 500 บาท",                             │
│    "reward_amount": 500,                                         │
│    "point_used": 1000,                                          │
│    "callback_url": "https://your-domain.com/api/reward-callback",│
│    "line_at": "@lineofficial"                                   │
│  }                                                               │
│                                                                  │
│  Headers:                                                        │
│  - Content-Type: application/json                                │
│  - api-key: {api_key}                                           │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  External API   │
                    │  ประมวลผล        │
                    │  (อนุมัติ/ปฏิเสธ)  │
                    └────────┬────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 3: External API ส่ง Callback กลับมา                        │
│                                                                  │
│  POST /api/reward-callback                                       │
│                                                                  │
│  Request Body:                                                   │
│  {                                                               │
│    "log_id": "{tbl_point_logs._id}",                            │
│    "status": "approve" | "reject"                               │
│  }                                                               │
└────────────────────────────┬────────────────────────────────────┘
                             │
              ┌──────────────┴──────────────┐
              │                             │
              ▼                             ▼
     ┌────────────────┐            ┌────────────────┐
     │ status=approve │            │ status=reject  │
     │                │            │                │
     │ 1. Update Log  │            │ 1. Update Log  │
     │    status →    │            │    status →    │
     │    'complete'  │            │    'rejected'  │
     │                │            │                │
     │ 2. (Optional)  │            │ 2. คืน Points   │
     │    ส่ง LINE    │            │    ให้ User     │
     │    แจ้ง User   │            │                │
     │                │            │ 3. ส่ง LINE    │
     │                │            │    แจ้ง User   │
     └────────────────┘            └────────────────┘
```

---

## 3. ความแตกต่างระหว่าง Default และ Credit

| Feature | type = "default" | type = "credit" |
|---------|------------------|-----------------|
| การหัก Points | ทันที | ทันที |
| การสร้าง Log | status: pending | status: pending |
| LINE Notification | ส่งทันที | ส่งทันที |
| ส่งไป External API | ❌ ไม่ส่ง | ✅ ส่งอัตโนมัติ |
| การ Approve | Admin manual | External API callback |
| การ Reject | Admin manual (ไม่คืน Points auto) | Callback + **คืน Points อัตโนมัติ** |
| การแสดงใน Dashboard | แสดง (Admin approve ได้) | แสดง (Read-only, รอ callback) |

---

## 4. สิ่งที่ต้องพัฒนาเพิ่ม

### 4.1 Backend (API)

| # | รายการ | ไฟล์ | Priority |
|---|--------|------|----------|
| 1 | สร้าง API Endpoint: `/api/reward-callback` | `src/app/api/reward-callback/route.ts` | **P0** |
| 2 | สร้าง API Endpoint: `/api/claim-credit-reward` | `src/app/api/claim-credit-reward/route.ts` | **P0** |
| 3 | แก้ไข Logic ใน DialogReward.tsx | `src/components/liff/point/DialogReward.tsx` | **P0** |
| 4 | เพิ่ม config สำหรับ External API | `tbl_config` หรือ `.env` | **P1** |

### 4.2 Database

| # | รายการ | Table | Priority |
|---|--------|-------|----------|
| 1 | เพิ่ม field `type` ใน tbl_point_logs | `tbl_point_logs` | **P0** |
| 2 | เพิ่ม field `callback_time` ใน tbl_point_logs | `tbl_point_logs` | **P1** |
| 3 | เพิ่ม External API config | `tbl_config` | **P0** |

### 4.3 Frontend

| # | รายการ | ไฟล์ | Priority |
|---|--------|------|----------|
| 1 | แก้ไข DialogReward.tsx ให้ตรวจสอบ type | `DialogReward.tsx` | **P0** |
| 2 | แสดงสถานะ "รอการยืนยันจากระบบ" สำหรับ credit | `TablePointLog.tsx` | **P1** |
| 3 | ซ่อน toggle switch สำหรับ credit type | `TablePointLog.tsx` | **P1** |

---

## 5. Database Schema Changes

### 5.1 tbl_point_logs (Update)

```typescript
interface TPointLog {
  _id: string;
  userId: string;
  tel: string;
  point: string;
  operation: '+' | '-';
  title: string;
  type: 'default' | 'credit';      // ✅ NEW: ประเภทรางวัล
  status: 'pending' | 'complete' | 'rejected';  // ✅ UPDATE: เพิ่ม 'rejected'
  callback_time?: Date;             // ✅ NEW: เวลาที่ได้รับ callback
  createDate: string;
}
```

### 5.2 tbl_config (เพิ่ม External API Config)

```typescript
// เพิ่มใน tbl_config
{
  // ... existing config ...

  // External API Configuration
  external_api: {
    endpoint: "https://example.com/api",       // Base URL ของ External API
    api_key: "your-secret-api-key",            // API Key
    callback_url: "https://your-domain.com/api/reward-callback",
    line_at: "@lineofficial"
  }
}
```

---

## 6. API Endpoints ที่ต้องสร้างใหม่

### 6.1 POST `/api/claim-credit-reward`

**Purpose:** ส่งข้อมูลการแลกรางวัล credit ไป External API

**Request Body:**
```json
{
  "log_id": "674f1234567890abcdef1234",
  "user_id": "U1234567890abcdef",
  "tel": "0891234567",
  "reward_title": "เครดิต 500 บาท",
  "reward_amount": 500,
  "point_used": 1000
}
```

**Logic:**
```typescript
// src/app/api/claim-credit-reward/route.ts

export async function POST(request: Request) {
  const body = await request.json()

  // 1. ดึง config จาก database
  const config = await getExternalApiConfig()

  // 2. สร้าง request body สำหรับ External API
  const externalPayload = {
    log_id: body.log_id,
    user_id: body.user_id,
    tel: body.tel,
    reward_title: body.reward_title,
    reward_amount: body.reward_amount,
    point_used: body.point_used,
    callback_url: config.callback_url,
    line_at: config.line_at
  }

  // 3. ส่งไป External API
  const response = await fetch(
    `${config.endpoint}/players/v1/line/rewards/claim`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': config.api_key
      },
      body: JSON.stringify(externalPayload)
    }
  )

  // 4. Return response
  return NextResponse.json({
    message: "Claim sent to external API",
    status: "pending"
  })
}
```

### 6.2 POST `/api/reward-callback`

**Purpose:** รับ Callback จาก External API

**Request Body (จาก External API):**
```json
{
  "log_id": "674f1234567890abcdef1234",
  "status": "approve"  // หรือ "reject"
}
```

**Logic:**
```typescript
// src/app/api/reward-callback/route.ts

export async function POST(request: Request) {
  const { log_id, status } = await request.json()

  // 1. ค้นหา Log Entry
  const logEntry = await findLogById(log_id)
  if (!logEntry) {
    return NextResponse.json({ error: "Log not found" }, { status: 404 })
  }

  // 2. ตรวจสอบว่า log เป็น pending อยู่
  if (logEntry.status !== 'pending') {
    return NextResponse.json({ error: "Log already processed" }, { status: 400 })
  }

  if (status === 'approve') {
    // 3a. Approve: อัพเดท log เป็น complete
    await updateLog(log_id, {
      status: 'complete',
      callback_time: new Date()
    })

    // (Optional) ส่ง LINE แจ้ง User ว่าได้รับเครดิตแล้ว

  } else if (status === 'reject') {
    // 3b. Reject: อัพเดท log + คืน Points

    // อัพเดท log
    await updateLog(log_id, {
      status: 'rejected',
      callback_time: new Date()
    })

    // คืน Points ให้ User
    await refundPoints(logEntry.userId, logEntry.point)

    // ส่ง LINE แจ้ง User ว่าถูกปฏิเสธและได้รับ Points คืน
  }

  return NextResponse.json({
    log_id,
    status,
    callback_time: new Date().toISOString(),
    message: status === 'approve'
      ? "Reward approved successfully"
      : "Reward rejected, points refunded"
  })
}
```

---

## 7. Frontend Changes

### 7.1 DialogReward.tsx - แก้ไข Logic

```typescript
// src/components/liff/point/DialogReward.tsx

const handleConfirmRedeem = async () => {
  // 1. หัก Points
  await actionPoint('tbl_client_point', {
    userId,
    point: data.point,
    operation: '-'
  })

  // 2. สร้าง Log
  const logResult = await actionCreate('tbl_point_logs', {
    userId,
    tel,
    point: data.point,
    operation: '-',
    title: data.title,
    type: data.type,  // ✅ เพิ่ม type
    status: 'pending'
  })

  // 3. ส่ง LINE Notification
  await sendFlexMessage(...)

  // 4. ถ้าเป็น credit type → ส่งไป External API
  if (data.type === 'credit') {
    await fetch('/api/claim-credit-reward', {
      method: 'POST',
      body: JSON.stringify({
        log_id: logResult.insertedId,
        user_id: userId,
        tel,
        reward_title: data.title,
        reward_amount: data.point, // หรือ credit amount ตาม business logic
        point_used: data.point
      })
    })
  }

  // 5. แสดง Success Dialog
  setShowSuccess(true)
}
```

### 7.2 TablePointLog.tsx - ซ่อน Toggle สำหรับ Credit

```typescript
// ในส่วน status column

cell: info => {
  const row = info.row.original

  // ถ้าเป็น credit type และยังเป็น pending → แสดงข้อความรอ
  if (row.type === 'credit' && row.status === 'pending') {
    return <Chip label="รอยืนยันจากระบบ" color="warning" size="small" />
  }

  // ถ้าเป็น credit type และ rejected → แสดงว่าถูกปฏิเสธ
  if (row.type === 'credit' && row.status === 'rejected') {
    return <Chip label="ถูกปฏิเสธ (คืน Points แล้ว)" color="error" size="small" />
  }

  // ถ้าเป็น default type → แสดง toggle switch เหมือนเดิม
  if (row.type === 'default' || !row.type) {
    return (
      <Switch
        checked={row.status === 'complete'}
        onChange={() => handleToggleStatus(row)}
      />
    )
  }

  // Complete status
  return <Chip label="สำเร็จ" color="success" size="small" />
}
```

---

## 8. Configuration

### 8.1 Environment Variables (แนะนำ)

```env
# .env.local

# External API Configuration
EXTERNAL_API_ENDPOINT=https://example.com/api
EXTERNAL_API_KEY=your-secret-api-key
EXTERNAL_CALLBACK_URL=https://your-domain.com/api/reward-callback
LINE_AT=@lineofficial
```

### 8.2 หรือเก็บใน Database (tbl_config)

```json
{
  "external_api": {
    "endpoint": "https://example.com/api",
    "api_key": "your-secret-api-key",
    "callback_url": "https://your-domain.com/api/reward-callback",
    "line_at": "@lineofficial"
  }
}
```

---

## 9. Implementation Steps

### Phase 1: Database & Types (Day 1) ✅ COMPLETED

- [x] 1.1 อัพเดท `typePointLog.ts` เพิ่ม field `type`, `callback_time`, `rejected` status
- [x] 1.2 ใช้ External API config จาก `.env` (มีอยู่แล้ว)

### Phase 2: Backend APIs (Day 1-2) ✅ COMPLETED

- [x] 2.1 สร้าง `/api/claim-credit-reward/route.ts`
- [x] 2.2 สร้าง `/api/reward-callback/route.ts`
- [x] 2.3 Refund points logic รวมอยู่ใน reward-callback API

### Phase 3: Frontend Integration (Day 2-3) ✅ COMPLETED

- [x] 3.1 แก้ไข `DialogReward.tsx` ให้ตรวจสอบ type และเรียก API ที่เหมาะสม
- [x] 3.2 แก้ไข `TablePointLog.tsx` ให้แสดงสถานะตาม type
- [ ] 3.3 เพิ่ม LINE Notification สำหรับ approve/reject (Optional - สามารถเพิ่มภายหลัง)

### Phase 4: Testing

- [ ] 4.1 ทดสอบ flow default type (ควรทำงานเหมือนเดิม)
- [ ] 4.2 ทดสอบ flow credit type with mock External API
- [ ] 4.3 ทดสอบ callback approve scenario
- [ ] 4.4 ทดสอบ callback reject scenario (ต้องคืน points)
- [ ] 4.5 ทดสอบ edge cases (duplicate callback, invalid log_id)

### Phase 5: Integration Testing

- [ ] 5.1 ทดสอบกับ External API จริง (ถ้ามี staging environment)
- [ ] 5.2 ทดสอบ LINE Notification ทุก scenario
- [ ] 5.3 ทดสอบ concurrent requests

---

## 10. Security Considerations

### 10.1 Callback Validation

```typescript
// ควรมีการ validate callback request
// เช่น ตรวจสอบ IP whitelist หรือ signature

export async function POST(request: Request) {
  // 1. Validate source IP (optional)
  const clientIP = request.headers.get('x-forwarded-for')
  if (!isAllowedIP(clientIP)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  // 2. Validate request signature (recommended)
  const signature = request.headers.get('x-signature')
  if (!verifySignature(signature, body)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 403 })
  }

  // ... process callback
}
```

### 10.2 Idempotency

```typescript
// ป้องกัน duplicate callback processing
if (logEntry.status !== 'pending') {
  // Already processed, return success without re-processing
  return NextResponse.json({
    message: "Already processed",
    status: logEntry.status
  })
}
```

### 10.3 API Key Security

- เก็บ API Key ใน environment variable หรือ encrypted database
- ไม่ expose API Key ใน client-side code
- ใช้ server-side API route เท่านั้นในการเรียก External API

---

## Summary

| Item | Status | Notes |
|------|--------|-------|
| Type field in reward | ✅ Done | credit / default |
| Type field in point logs | ✅ Done | เพิ่ม type, callback_time, rejected status |
| Callback API | ✅ Done | POST /api/reward-callback |
| External API call | ✅ Done | POST /api/claim-credit-reward |
| Refund logic | ✅ Done | คืน Points อัตโนมัติเมื่อ reject |
| Frontend - DialogReward | ✅ Done | ตรวจสอบ type และส่งไป External API |
| Frontend - TablePointLog | ✅ Done | แสดงสถานะตาม type (Chip/Switch) |
| LINE Notification | ⬜ Optional | approve/reject messages |

---

## Files Changed

```
src/
├── types/
│   └── typePointLog.ts              ✅ เพิ่ม type, callback_time, rejected status
│
├── app/api/
│   ├── reward-callback/
│   │   └── route.ts                 ✅ NEW - รับ callback จาก External API
│   └── claim-credit-reward/
│       └── route.ts                 ✅ NEW - ส่งข้อมูลไป External API
│
└── components/
    ├── liff/point/
    │   └── DialogReward.tsx         ✅ เพิ่ม logic สำหรับ credit type
    └── dashboard/point/
        └── TablePointLog.tsx        ✅ แสดงสถานะตาม type
```

---

*Document created: 2025-12-11*
*Last updated: 2025-12-11*
*Created by: Claude Code*
