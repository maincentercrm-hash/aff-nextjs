# Point & Reward System - Flow Summary

## สารบัญ

1. [ภาพรวมระบบ](#1-ภาพรวมระบบ)
2. [โครงสร้างฐานข้อมูล](#2-โครงสร้างฐานข้อมูล)
3. [Flow การได้รับ Points](#3-flow-การได้รับ-points)
4. [Flow การแลก Reward](#4-flow-การแลก-reward)
5. [Flow การอนุมัติโดย Admin](#5-flow-การอนุมัติโดย-admin)
6. [API Endpoints](#6-api-endpoints)
7. [ไฟล์และ Components ที่เกี่ยวข้อง](#7-ไฟล์และ-components-ที่เกี่ยวข้อง)
8. [LINE Notification](#8-line-notification)

---

## 1. ภาพรวมระบบ

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         POINT & REWARD SYSTEM                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────────┐         ┌─────────────┐         ┌─────────────────┐      │
│   │   Mission   │ ─────▶  │   Points    │ ─────▶  │     Reward      │      │
│   │  Complete   │  (+)    │   Balance   │  (-)    │   Redemption    │      │
│   └─────────────┘         └─────────────┘         └─────────────────┘      │
│                                  │                        │                 │
│                                  ▼                        ▼                 │
│                           ┌───────────┐           ┌─────────────┐          │
│                           │  Point    │           │   Admin     │          │
│                           │   Logs    │           │  Approval   │          │
│                           └───────────┘           └─────────────┘          │
│                                                          │                  │
│                                                          ▼                  │
│                                                   ┌─────────────┐          │
│                                                   │    LINE     │          │
│                                                   │ Notification│          │
│                                                   └─────────────┘          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### แหล่งที่มาของ Points

| แหล่งที่มา | Operation | รายละเอียด |
|------------|-----------|-------------|
| Mission Complete | + | ได้รับ points เมื่อทำ mission สำเร็จ |
| Reward Redemption | - | ใช้ points แลกของรางวัล |

---

## 2. โครงสร้างฐานข้อมูล

### 2.1 tbl_point (Reward Catalog - รายการรางวัล)

```typescript
interface TPoint {
  _id: ObjectId;
  title: string;        // ชื่อรางวัล เช่น "iPhone 15 Pro"
  thumbnail: string;    // URL รูปภาพรางวัล
  point: number;        // จำนวน points ที่ต้องใช้แลก
  type: 'credit' | 'default';  // ประเภทรางวัล
  status: 'publish' | 'pending';  // สถานะเผยแพร่
  createDate: Date;     // วันที่สร้าง
}
```

#### ประเภทรางวัล (Reward Type)

| Type | คำอธิบาย |
|------|----------|
| `default` | รางวัลทั่วไป เช่น ของรางวัล, Gift Card, สินค้า |
| `credit` | รางวัลเป็นเครดิตเติมเข้าบัญชีเกม |

### 2.2 tbl_client_point (Point Balance - ยอด Points ของผู้ใช้)

```typescript
interface TClientPoint {
  tel: string;          // เบอร์โทรศัพท์ (Primary Key)
  point: number;        // ยอด points คงเหลือ
  userId: string;       // LINE User ID
  updateDate: Date;     // วันที่อัพเดทล่าสุด
  lastPointOperation: {
    type: 'add' | 'subtract';
    amount: number;
    date: Date;
  };
}
```

### 2.3 tbl_point_logs (Point Transaction History)

```typescript
interface TPointLog {
  _id: string;
  userId: string;       // LINE User ID
  tel: string;          // เบอร์โทรศัพท์
  point: string;        // จำนวน points
  operation: '+' | '-'; // + = ได้รับ, - = ใช้แลก
  title: string;        // ชื่อรายการ (mission/reward)
  status: 'pending' | 'complete';
  createDate: string;   // วันเวลาที่ทำรายการ
}
```

---

## 3. Flow การได้รับ Points

### 3.1 Sequence Diagram - Mission Complete

```
┌──────────┐     ┌──────────┐     ┌──────────────┐     ┌──────────────┐
│   User   │     │   LIFF   │     │   Backend    │     │   MongoDB    │
│  (LINE)  │     │   App    │     │   API        │     │   Database   │
└────┬─────┘     └────┬─────┘     └──────┬───────┘     └──────┬───────┘
     │                │                   │                    │
     │ Complete       │                   │                    │
     │ Mission        │                   │                    │
     │───────────────>│                   │                    │
     │                │                   │                    │
     │                │ PATCH /api/point  │                    │
     │                │ (operation: '+')  │                    │
     │                │──────────────────>│                    │
     │                │                   │                    │
     │                │                   │ $inc: { point: +X }│
     │                │                   │───────────────────>│
     │                │                   │                    │
     │                │                   │<───────────────────│
     │                │                   │        OK          │
     │                │                   │                    │
     │                │ POST /api/create  │                    │
     │                │ (tbl_point_logs)  │                    │
     │                │──────────────────>│                    │
     │                │                   │                    │
     │                │                   │ Insert log record  │
     │                │                   │───────────────────>│
     │                │                   │                    │
     │                │<──────────────────│                    │
     │                │    Success        │                    │
     │                │                   │                    │
     │<───────────────│                   │                    │
     │  Show Success  │                   │                    │
     │  + Points      │                   │                    │
     │                │                   │                    │
```

### 3.2 API Request - เพิ่ม Points

```typescript
// PATCH /api/point
{
  table: 'tbl_client_point',
  data: {
    userId: 'U1234567890abcdef',
    point: 100,
    operation: '+'
  }
}

// Response
{
  message: "Points updated successfully",
  type: "success",
  details: {
    userId: 'U1234567890abcdef',
    operation: '+',
    point: 100,
    timestamp: '2025-12-11T10:30:00Z'
  }
}
```

---

## 4. Flow การแลก Reward

### 4.1 Sequence Diagram - Redemption Flow

```
┌──────────┐     ┌──────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────┐
│   User   │     │   LIFF   │     │   Backend    │     │   MongoDB    │     │   LINE   │
│  (LINE)  │     │   App    │     │   API        │     │   Database   │     │   API    │
└────┬─────┘     └────┬─────┘     └──────┬───────┘     └──────┬───────┘     └────┬─────┘
     │                │                   │                    │                  │
     │ เข้าหน้า       │                   │                    │                  │
     │ Point          │                   │                    │                  │
     │───────────────>│                   │                    │                  │
     │                │                   │                    │                  │
     │                │ GET /api/readBy/  │                    │                  │
     │                │ tbl_client_point  │                    │                  │
     │                │──────────────────>│                    │                  │
     │                │                   │───────────────────>│                  │
     │                │<──────────────────│ Point Balance      │                  │
     │                │                   │                    │                  │
     │                │ GET /api/readKey/ │                    │                  │
     │                │ tbl_point/status/ │                    │                  │
     │                │ publish           │                    │                  │
     │                │──────────────────>│                    │                  │
     │                │                   │───────────────────>│                  │
     │                │<──────────────────│ Reward List        │                  │
     │                │                   │                    │                  │
     │<───────────────│                   │                    │                  │
     │ แสดงหน้า Point │                   │                    │                  │
     │ + รายการรางวัล │                   │                    │                  │
     │                │                   │                    │                  │
     │ Click แลก     │                   │                    │                  │
     │ Reward         │                   │                    │                  │
     │───────────────>│                   │                    │                  │
     │                │                   │                    │                  │
     │                │ ┌────────────────────────────────────┐ │                  │
     │                │ │ Validation: currentPoint >= cost?  │ │                  │
     │                │ └────────────────────────────────────┘ │                  │
     │                │                   │                    │                  │
     │                │ [If Points พอ]    │                    │                  │
     │                │                   │                    │                  │
     │<───────────────│                   │                    │                  │
     │ แสดง Dialog    │                   │                    │                  │
     │ ยืนยัน         │                   │                    │                  │
     │                │                   │                    │                  │
     │ Click ตกลง    │                   │                    │                  │
     │───────────────>│                   │                    │                  │
     │                │                   │                    │                  │
     │                │ ─────────────────────────────────────────────────────────│
     │                │ │              STEP 1: Deduct Points                    ││
     │                │ ─────────────────────────────────────────────────────────│
     │                │                   │                    │                  │
     │                │ PATCH /api/point  │                    │                  │
     │                │ (operation: '-')  │                    │                  │
     │                │──────────────────>│                    │                  │
     │                │                   │                    │                  │
     │                │                   │ Check sufficient   │                  │
     │                │                   │───────────────────>│                  │
     │                │                   │                    │                  │
     │                │                   │ $inc: { point: -X }│                  │
     │                │                   │───────────────────>│                  │
     │                │                   │                    │                  │
     │                │<──────────────────│        OK          │                  │
     │                │                   │                    │                  │
     │                │ ─────────────────────────────────────────────────────────│
     │                │ │              STEP 2: Create Log                       ││
     │                │ ─────────────────────────────────────────────────────────│
     │                │                   │                    │                  │
     │                │ POST /api/create  │                    │                  │
     │                │ (tbl_point_logs)  │                    │                  │
     │                │──────────────────>│                    │                  │
     │                │                   │                    │                  │
     │                │                   │ Insert log         │                  │
     │                │                   │ status: 'pending'  │                  │
     │                │                   │───────────────────>│                  │
     │                │                   │                    │                  │
     │                │<──────────────────│        OK          │                  │
     │                │                   │                    │                  │
     │                │ ─────────────────────────────────────────────────────────│
     │                │ │              STEP 3: Send LINE Notification           ││
     │                │ ─────────────────────────────────────────────────────────│
     │                │                   │                    │                  │
     │                │ POST /api/        │                    │                  │
     │                │ flexMessage       │                    │                  │
     │                │──────────────────>│                    │                  │
     │                │                   │                    │                  │
     │                │                   │ Push Flex Message ──────────────────>│
     │                │                   │                    │                  │
     │                │                   │<─────────────────────────────────────│
     │                │                   │        OK          │                  │
     │                │<──────────────────│                    │                  │
     │                │                   │                    │                  │
     │<───────────────│                   │                    │                  │
     │ แสดง Success   │                   │                    │                  │
     │ Dialog         │                   │                    │                  │
     │                │                   │                    │                  │
     │<────────────────────────────────────────────────────────────────────────>│
     │                    LINE Flex Message (Reward Notification)               │
     │                │                   │                    │                  │
```

### 4.2 User Interface Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                        หน้า Point (LIFF)                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│    ┌─────────────────────────────────────────────────────────┐     │
│    │                    SECTION POINT                         │     │
│    │                                                          │     │
│    │                      ⭐ Icon                              │     │
│    │                                                          │     │
│    │                    ┌───────────┐                         │     │
│    │                    │   1,500   │  ← Point Balance        │     │
│    │                    │  คงเหลือ   │                         │     │
│    │                    └───────────┘                         │     │
│    │                                                          │     │
│    └─────────────────────────────────────────────────────────┘     │
│                                                                     │
│    ┌─────────────────────────────────────────────────────────┐     │
│    │                   REWARD CATALOG                         │     │
│    │                                                          │     │
│    │  ┌──────────────┐    ┌──────────────┐                   │     │
│    │  │     📱       │    │     🎧       │                   │     │
│    │  │  iPhone 15   │    │   AirPods    │                   │     │
│    │  │  Pro Max     │    │   Pro        │                   │     │
│    │  │              │    │              │                   │     │
│    │  │  5,000 pts   │    │  2,500 pts   │                   │     │
│    │  │    🛒       │    │    🛒       │  ← Click to redeem │     │
│    │  └──────────────┘    └──────────────┘                   │     │
│    │                                                          │     │
│    │  ┌──────────────┐    ┌──────────────┐                   │     │
│    │  │     🎮       │    │     ☕       │                   │     │
│    │  │  Nintendo    │    │  Starbucks   │                   │     │
│    │  │  Switch      │    │  Gift Card   │                   │     │
│    │  │              │    │              │                   │     │
│    │  │  3,000 pts   │    │    500 pts   │                   │     │
│    │  │    🛒       │    │    🛒       │                   │     │
│    │  └──────────────┘    └──────────────┘                   │     │
│    │                                                          │     │
│    │               [1] [2] [3] ← Pagination                   │     │
│    └─────────────────────────────────────────────────────────┘     │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 4.3 Dialog ยืนยันการแลก

```
┌─────────────────────────────────────────────────────────────────────┐
│                         DIALOG REWARD                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                                                              │   │
│  │                      📱 [Reward Image]                       │   │
│  │                                                              │   │
│  │                       iPhone 15 Pro Max                      │   │
│  │                                                              │   │
│  │                        5,000 points                          │   │
│  │                                                              │   │
│  │   ─────────────────────────────────────────────────────────  │   │
│  │                                                              │   │
│  │   CASE 1: Points เพียงพอ (currentPoint >= cost)              │   │
│  │                                                              │   │
│  │            ┌──────────┐    ┌──────────┐                     │   │
│  │            │  ตกลง    │    │  ยกเลิก   │                     │   │
│  │            └──────────┘    └──────────┘                     │   │
│  │                                                              │   │
│  │   ─────────────────────────────────────────────────────────  │   │
│  │                                                              │   │
│  │   CASE 2: Points ไม่เพียงพอ (currentPoint < cost)            │   │
│  │                                                              │   │
│  │                  ⚠️ POINT ไม่เพียงพอ                          │   │
│  │                                                              │   │
│  │                    ┌──────────┐                              │   │
│  │                    │   ตกลง   │                              │   │
│  │                    └──────────┘                              │   │
│  │                                                              │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 4.4 API Request - หัก Points

```typescript
// PATCH /api/point
{
  table: 'tbl_client_point',
  data: {
    userId: 'U1234567890abcdef',
    point: 500,
    operation: '-'
  }
}

// Response - Success
{
  message: "Points updated successfully",
  type: "success",
  details: {
    userId: 'U1234567890abcdef',
    operation: '-',
    point: 500,
    timestamp: '2025-12-11T10:30:00Z'
  }
}

// Response - Insufficient Points
{
  message: "Insufficient points",
  type: "error"
}
```

### 4.5 สร้าง Redemption Log

```typescript
// POST /api/create
{
  table: 'tbl_point_logs',
  data: {
    userId: 'U1234567890abcdef',
    tel: '0891234567',
    point: '500',
    operation: '-',
    title: 'Starbucks Gift Card',
    status: 'pending'
  }
}
```

---

## 5. Flow การอนุมัติโดย Admin

### 5.1 Sequence Diagram - Admin Approval

```
┌──────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Admin   │     │  Dashboard   │     │   Backend    │     │   MongoDB    │
│          │     │              │     │   API        │     │   Database   │
└────┬─────┘     └──────┬───────┘     └──────┬───────┘     └──────┬───────┘
     │                  │                    │                    │
     │ เข้าหน้าจัดการ    │                    │                    │
     │ Point            │                    │                    │
     │─────────────────>│                    │                    │
     │                  │                    │                    │
     │                  │ GET /api/readKey/  │                    │
     │                  │ tbl_point_logs/    │                    │
     │                  │ operation/-        │                    │
     │                  │───────────────────>│                    │
     │                  │                    │───────────────────>│
     │                  │<───────────────────│ Redemption Logs    │
     │                  │                    │                    │
     │<─────────────────│                    │                    │
     │ แสดง Table       │                    │                    │
     │ รายการแลก        │                    │                    │
     │ รอการอนุมัติ      │                    │                    │
     │                  │                    │                    │
     │ Toggle Switch    │                    │                    │
     │ (pending→        │                    │                    │
     │  complete)       │                    │                    │
     │─────────────────>│                    │                    │
     │                  │                    │                    │
     │                  │ PATCH /api/update  │                    │
     │                  │ tbl_point_logs     │                    │
     │                  │───────────────────>│                    │
     │                  │                    │                    │
     │                  │                    │ Update status      │
     │                  │                    │ 'pending'→         │
     │                  │                    │ 'complete'         │
     │                  │                    │───────────────────>│
     │                  │                    │                    │
     │                  │<───────────────────│        OK          │
     │                  │                    │                    │
     │<─────────────────│                    │                    │
     │ อัพเดท Table     │                    │                    │
     │                  │                    │                    │
```

### 5.2 Admin Dashboard UI

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           DASHBOARD - POINT MANAGEMENT                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌──────────────────────┐  ┌──────────────────────┐                        │
│   │    จัดการพ้อยต์       │  │    ประวัติการแลก      │  ← Active Tab         │
│   └──────────────────────┘  └──────────────────────┘                        │
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐  │
│   │                         TABLE POINT LOGS                             │  │
│   │                                                                      │  │
│   │  ┌────────────────────────────────────────────────────────────────┐ │  │
│   │  │ 🔍 Search...                                                   │ │  │
│   │  └────────────────────────────────────────────────────────────────┘ │  │
│   │                                                                      │  │
│   │  ┌─────────┬──────────────────┬────────┬─────────────┬───────────┐ │  │
│   │  │   TEL   │     รายการ        │ POINT  │   วันที่     │  STATUS   │ │  │
│   │  ├─────────┼──────────────────┼────────┼─────────────┼───────────┤ │  │
│   │  │ 089123  │ Starbucks Card   │ 🔴 500 │ 11/12/2025  │ [🔘    ] │ │  │
│   │  │ 4567    │                  │        │ 10:30       │  pending  │ │  │
│   │  ├─────────┼──────────────────┼────────┼─────────────┼───────────┤ │  │
│   │  │ 088765  │ Nintendo Switch  │ 🔴3000 │ 10/12/2025  │ [   🔘] │ │  │
│   │  │ 4321    │                  │        │ 14:15       │ complete  │ │  │
│   │  ├─────────┼──────────────────┼────────┼─────────────┼───────────┤ │  │
│   │  │ 086543  │ AirPods Pro      │ 🔴2500 │ 09/12/2025  │ [🔘    ] │ │  │
│   │  │ 2109    │                  │        │ 09:45       │  pending  │ │  │
│   │  └─────────┴──────────────────┴────────┴─────────────┴───────────┘ │  │
│   │                                                                      │  │
│   │  🔴 = การแลก (operation: '-')                                        │  │
│   │  🟢 = ได้รับ (operation: '+')                                        │  │
│   │                                                                      │  │
│   │  Toggle Switch: pending ←→ complete                                  │  │
│   │                                                                      │  │
│   └─────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 5.3 API Request - Update Status

```typescript
// PATCH /api/update
{
  table: 'tbl_point_logs',
  data: {
    _id: '507f1f77bcf86cd799439011',
    status: 'complete'  // หรือ 'pending' ถ้าต้องการ revert
  }
}

// Response
{
  message: "อัพเดตสำเร็จ",
  type: "success"
}
```

---

## 6. API Endpoints

### 6.1 สรุป Endpoints ทั้งหมด

| Endpoint | Method | Purpose | Request Body |
|----------|--------|---------|--------------|
| `/api/point` | PATCH | เพิ่ม/ลด points | `{ table, data: { userId, point, operation } }` |
| `/api/readBy/tbl_client_point/{tel}` | GET | ดู point balance | - |
| `/api/readKey/tbl_point/status/publish` | GET | ดู reward catalog | - |
| `/api/readKey/tbl_point_logs/operation/-` | GET | ดู redemption logs | - |
| `/api/create` | POST | สร้าง log | `{ table, data: {...} }` |
| `/api/update` | PATCH | อัพเดท status | `{ table, data: { _id, status } }` |
| `/api/flexMessage` | POST | ส่ง LINE notification | `{ userId, flex, altText }` |

### 6.2 Error Handling

| Error | HTTP Code | Response |
|-------|-----------|----------|
| Points ไม่เพียงพอ | 400 | `{ message: "Insufficient points", type: "error" }` |
| ไม่พบ user | 404 | `{ message: "User not found", type: "error" }` |
| Invalid operation | 400 | `{ message: "Invalid operation type", type: "error" }` |
| Database error | 500 | `{ message: "Database error", type: "error" }` |

---

## 7. ไฟล์และ Components ที่เกี่ยวข้อง

### 7.1 Backend (API Routes)

```
src/app/api/
├── point/
│   └── route.ts                    # PATCH - Point operations
├── create/
│   └── route.ts                    # POST - Create records
├── update/
│   └── route.ts                    # PATCH - Update records
├── readBy/
│   └── [table]/[id]/route.ts       # GET - Read by ID
├── readKey/
│   └── [table]/[key]/[value]/route.ts  # GET - Read by field
└── flexMessage/
    └── route.ts                    # POST - LINE Flex Message
```

### 7.2 Frontend - LIFF (User)

```
src/
├── app/(liff)/liff/point/
│   └── page.tsx                    # หน้า Point หลัก
│
└── components/liff/point/
    ├── DialogReward.tsx            # Dialog ยืนยันการแลก
    ├── RewardCard.tsx              # Card แสดงรางวัล
    └── sectionPoint.tsx            # Section แสดง Point Balance
```

### 7.3 Frontend - Dashboard (Admin)

```
src/
├── app/(dashboard)/dashboard/point/
│   └── page.tsx                    # หน้าจัดการ Point
│
└── components/dashboard/point/
    ├── MainPoint.tsx               # Tab จัดการ Reward Catalog
    ├── MainPointLog.tsx            # Tab ประวัติการแลก
    ├── TablePoint.tsx              # Table รายการรางวัล
    ├── TablePointLog.tsx           # Table ประวัติการแลก
    ├── DialogCreate.tsx            # Dialog เพิ่มรางวัล
    ├── DialogEdit.tsx              # Dialog แก้ไขรางวัล
    └── DialogDelete.tsx            # Dialog ลบรางวัล
```

### 7.4 Types & Actions

```
src/
├── types/
│   ├── typePoint.ts                # Interface: TPoint
│   └── typePointLog.ts             # Interface: TPointLog
│
├── action/crud/
│   ├── point.ts                    # actionPoint()
│   ├── create.ts                   # actionCreate()
│   ├── update.ts                   # actionUpdate()
│   ├── readBy.ts                   # actionReadBy()
│   └── readByKey.ts                # actionReadByKey()
│
└── components/flexMessage/
    └── flexReward.tsx              # Flex Message Template
```

---

## 8. LINE Notification

### 8.1 Flex Message Structure

```json
{
  "type": "flex",
  "altText": "GET REWARD",
  "contents": {
    "type": "bubble",
    "header": {
      "type": "box",
      "layout": "vertical",
      "backgroundColor": "#3EB982",
      "contents": [
        {
          "type": "image",
          "url": "[gift-star.png]",
          "size": "80px"
        },
        {
          "type": "text",
          "text": "GET REWARD",
          "color": "#ffffff",
          "weight": "bold"
        }
      ]
    },
    "body": {
      "type": "box",
      "layout": "vertical",
      "contents": [
        {
          "type": "image",
          "url": "[reward_thumbnail]",
          "size": "150px"
        },
        {
          "type": "text",
          "text": "ขอแสดงความยินดี"
        },
        {
          "type": "text",
          "text": "ยูสเซอร์ : 089-123-4567"
        },
        {
          "type": "text",
          "text": "แลก Point : Starbucks Gift Card"
        },
        {
          "type": "text",
          "text": "11 ธ.ค. 2025 เวลา 10.30"
        },
        {
          "type": "text",
          "text": "กรุณาติดต่อแอดมินเพื่อรับของรางวัล",
          "color": "#ff0000"
        }
      ]
    }
  }
}
```

### 8.2 ตัวอย่าง LINE Notification ที่ได้รับ

```
┌─────────────────────────────────────┐
│         🎁 GET REWARD 🎁           │
│        (Background: Green)          │
├─────────────────────────────────────┤
│                                     │
│         [📱 Reward Image]           │
│                                     │
│        ขอแสดงความยินดี              │
│                                     │
│     ยูสเซอร์ : 089-123-4567         │
│                                     │
│  แลก Point : Starbucks Gift Card    │
│                                     │
│    11 ธ.ค. 2025 เวลา 10.30         │
│                                     │
│  ⚠️ กรุณาติดต่อแอดมินเพื่อ          │
│     รับของรางวัล                    │
│                                     │
└─────────────────────────────────────┘
```

---

## 9. Summary Flow Chart

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          COMPLETE FLOW OVERVIEW                             │
└─────────────────────────────────────────────────────────────────────────────┘

                              ┌───────────────┐
                              │   User เข้า   │
                              │   LINE LIFF   │
                              └───────┬───────┘
                                      │
                                      ▼
                              ┌───────────────┐
                              │  ทำ Mission   │
                              │   สำเร็จ      │
                              └───────┬───────┘
                                      │
                                      ▼
                    ┌─────────────────────────────────┐
                    │      ได้รับ Points (+)          │
                    │  → Update tbl_client_point      │
                    │  → Insert tbl_point_logs        │
                    │    (operation: '+')             │
                    └─────────────────┬───────────────┘
                                      │
                                      ▼
                              ┌───────────────┐
                              │  เข้าหน้า     │
                              │  Point/Reward │
                              └───────┬───────┘
                                      │
                      ┌───────────────┴───────────────┐
                      │                               │
                      ▼                               ▼
              ┌───────────────┐               ┌───────────────┐
              │  ดู Point     │               │  ดู Reward    │
              │  Balance      │               │  Catalog      │
              │ (readBy API)  │               │ (readKey API) │
              └───────────────┘               └───────┬───────┘
                                                      │
                                                      ▼
                                              ┌───────────────┐
                                              │  เลือก Reward │
                                              │  ที่ต้องการ   │
                                              └───────┬───────┘
                                                      │
                                                      ▼
                                      ┌───────────────────────────┐
                                      │   Validate: Points พอ?    │
                                      └───────────────┬───────────┘
                                                      │
                              ┌────────────────────┬──┴──┬────────────────────┐
                              │                    │     │                    │
                              ▼                    │     ▼                    │
                      ┌───────────────┐           │  ┌───────────────┐       │
                      │  ไม่พอ ❌     │           │  │   พอ ✅       │       │
                      │  แสดง Error   │           │  │  ยืนยันการแลก │       │
                      └───────────────┘           │  └───────┬───────┘       │
                                                  │          │               │
                                                  │          ▼               │
                                                  │  ┌───────────────┐       │
                                                  │  │ 1. หัก Points │       │
                                                  │  │ (operation:-)│       │
                                                  │  └───────┬───────┘       │
                                                  │          │               │
                                                  │          ▼               │
                                                  │  ┌───────────────┐       │
                                                  │  │ 2. Create Log │       │
                                                  │  │ (status:      │       │
                                                  │  │  pending)     │       │
                                                  │  └───────┬───────┘       │
                                                  │          │               │
                                                  │          ▼               │
                                                  │  ┌───────────────┐       │
                                                  │  │ 3. Send LINE  │       │
                                                  │  │ Notification  │       │
                                                  │  └───────┬───────┘       │
                                                  │          │               │
                                                  │          ▼               │
                                                  │  ┌───────────────┐       │
                                                  │  │  รอ Admin     │       │
                                                  │  │  อนุมัติ      │       │
                                                  │  └───────┬───────┘       │
                                                  │          │               │
                                                  │          ▼               │
                                                  │  ┌───────────────┐       │
                                                  │  │ Admin Toggle  │       │
                                                  │  │ Status →      │       │
                                                  │  │ 'complete'    │       │
                                                  │  └───────┬───────┘       │
                                                  │          │               │
                                                  │          ▼               │
                                                  │  ┌───────────────┐       │
                                                  │  │  User ติดต่อ  │       │
                                                  │  │  รับของรางวัล │       │
                                                  │  └───────────────┘       │
                                                  │                          │
                                                  └──────────────────────────┘
```

---

## 10. Business Rules Summary

| Rule | Description |
|------|-------------|
| **Point Validation** | User ต้องมี points เพียงพอก่อนแลก reward |
| **Immediate Deduction** | Points ถูกหักทันทีเมื่อทำการแลก |
| **Pending Status** | Redemption request เริ่มต้นเป็น status 'pending' |
| **Admin Approval Required** | Admin ต้อง approve ก่อนที่ user จะรับของรางวัล |
| **LINE Notification** | User ได้รับ Flex Message ทันทีหลังจากแลกสำเร็จ |
| **No Negative Balance** | System ป้องกันไม่ให้ points ติดลบ |
| **Transaction Logging** | ทุก operation ถูกบันทึกใน tbl_point_logs |
| **Published Rewards Only** | แสดงเฉพาะ rewards ที่มี status = 'publish' |
| **Reward Types** | รางวัลแบ่งเป็น 2 ประเภท: `credit` (เครดิตเกม) และ `default` (ของรางวัลทั่วไป) |

---

*สร้างโดย: Claude Code*
*วันที่: 11 ธันวาคม 2025*
