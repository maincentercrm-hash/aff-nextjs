# Mission Module (ระบบภารกิจ) ⭐

## ภาพรวม

Mission Module เป็น **โมดูลหลักที่สำคัญที่สุด** ของระบบ เป็นกลไกในการกระตุ้นให้ผู้ใช้ทำกิจกรรมต่างๆ เพื่อรับคะแนน (Point) ที่สามารถนำไปแลกของรางวัลได้

### วัตถุประสงค์หลัก
1. สร้าง Engagement ให้ผู้ใช้กลับมาใช้งานระบบ
2. กระตุ้นให้เกิดพฤติกรรมที่ต้องการ (แชร์เพื่อน, ฝากเงิน)
3. ติดตามและวัดผลความสำเร็จแบบเรียลไทม์
4. มอบรางวัลอัตโนมัติเมื่อทำสำเร็จ

---

## Collections ที่เกี่ยวข้อง

### 1. `tbl_mission` - ข้อมูลภารกิจ

```typescript
interface Mission {
  _id: ObjectId
  title: string              // หัวข้อภารกิจ เช่น "แชร์ 5 เพื่อนรับ 100 Point"
  detail: string             // รายละเอียดภารกิจ
  thumbnail: string          // URL รูปภาพปก
  type: 'share' | 'deposit'  // ประเภทภารกิจ
  point: number              // คะแนนที่จะได้รับ
  condition: number          // เงื่อนไขที่ต้องบรรลุ (จำนวนคน หรือ จำนวนเงิน)
  session: string            // ชื่อ Session (เพื่อจำกัดการทำพร้อมกัน)
  start_date: Date           // วันเริ่มต้นภารกิจ
  end_date: Date             // วันสิ้นสุดภารกิจ
  status: string             // 'publish' | 'pending'
  createDate: Date           // วันที่สร้าง
}
```

### 2. `tbl_mission_logs` - บันทึกการทำภารกิจ

```typescript
interface MissionLog {
  _id: ObjectId
  userId: string             // LINE User ID
  tel: string                // หมายเลขโทรศัพท์ผู้ใช้
  mission_id: string         // Reference to tbl_mission._id
  missionDetails: Mission    // ข้อมูลภารกิจ (snapshot)
  status: string             // 'active' | 'complete' | 'expired'
  point: number              // คะแนนที่ได้รับ (เมื่อ complete)
  completeDate: Date         // วันที่ทำสำเร็จ
  createDate: Date           // วันที่เข้าร่วมภารกิจ
}
```

---

## ประเภทของภารกิจ (Mission Types)

### 1. Share Mission (แชร์เพื่อน)

**วัตถุประสงค์:** กระตุ้นให้ผู้ใช้แชร์ลิงก์ Affiliate เพื่อชวนเพื่อนสมัครสมาชิก

**การทำงาน:**
```
1. ผู้ใช้เข้าร่วมภารกิจ "แชร์ 5 เพื่อน"
   ↓
2. ระบบบันทึก createDate ของภารกิจ (เวลาที่เริ่มทำ)
   ↓
3. ระบบเรียก External API ตรวจสอบ:
   - Endpoint: /games/players/line/affiliate
   - Parameters: line_id, line_at
   ↓
4. กรองข้อมูล playerBets:
   - เฉพาะ created_at >= createDate
   - เฉพาะ created_at <= end_date
   ↓
5. นับ unique username (ไม่ซ้ำกัน)
   ↓
6. แสดงความคืบหน้า: totalPlayers / condition * 100%
   ↓
7. เมื่อ totalPlayers >= condition (100%)
   → ผู้ใช้สามารถกดรับ Point ได้
```

**ตัวอย่างเงื่อนไข:**
```json
{
  "type": "share",
  "condition": 5,          // ต้องแชร์ให้ได้ 5 คน
  "point": 100            // รับ 100 Point
}
```

**การคำนวณ:**
```typescript
// API Response
const response = {
  playerBets: [
    { username: 'user1', created_at: '2025-11-01T10:00:00Z' },
    { username: 'user2', created_at: '2025-11-02T11:00:00Z' },
    { username: 'user1', created_at: '2025-11-02T12:00:00Z' }, // ซ้ำ ไม่นับ
    { username: 'user3', created_at: '2025-11-03T09:00:00Z' }
  ]
}

// กรองตามช่วงเวลา
const missionStart = new Date(log.createDate)  // เวลาที่เริ่มทำภารกิจ
const missionEnd = new Date(data.end_date)     // วันสิ้นสุดภารกิจ

// กรองและนับ unique
const uniquePlayers = new Set(
  response.playerBets
    .filter(player => {
      const createdAt = new Date(player.created_at)
      return createdAt >= missionStart && createdAt <= missionEnd
    })
    .map(player => player.username)
)

const totalPlayers = uniquePlayers.size  // = 3 คน
const progress = (totalPlayers / condition) * 100  // = 60%
```

---

### 2. Deposit Mission (ฝากเงิน)

**วัตถุประสงค์:** กระตุ้นให้ผู้ใช้ฝากเงินเข้าระบบ

**การทำงาน:**
```
1. ผู้ใช้เข้าร่วมภารกิจ "ฝาก 1000 บาท"
   ↓
2. ระบบบันทึก createDate
   ↓
3. ระบบเรียก External API ตรวจสอบ:
   - Endpoint: /players/v1/line/deposit
   - Parameters:
     * line_id (userId)
     * line_at (@lottwin88)
     * start_date (timestamp ของ createDate)
     * end_date (timestamp ของ mission end_date)
   ↓
4. API คืนค่า totalDeposit (ยอดฝากรวมในช่วงเวลา)
   ↓
5. คำนวณความคืบหน้า: totalDeposit / condition * 100%
   ↓
6. เมื่อ totalDeposit >= condition (100%)
   → ผู้ใช้สามารถกดรับ Point ได้
```

**ตัวอย่างเงื่อนไข:**
```json
{
  "type": "deposit",
  "condition": 1000,       // ต้องฝาก 1000 บาท
  "point": 50             // รับ 50 Point
}
```

**การคำนวณ:**
```typescript
// Convert dates to Unix timestamp
const startTimestamp = Math.floor(missionStart.getTime() / 1000)
const endTimestamp = Math.floor(missionEnd.getTime() / 1000)

// API Call
const response = await fetch(
  `${API_URL}/players/v1/line/deposit?` +
  `line_id=${userId}&` +
  `line_at=${lineAt}&` +
  `start_date=${startTimestamp}&` +
  `end_date=${endTimestamp}`
)

// Response
const data = {
  deposit: 750  // ยอดฝากรวม 750 บาท
}

const totalDeposit = data.deposit  // = 750
const progress = (totalDeposit / 1000) * 100  // = 75%
```

---

## ไฟล์และโครงสร้าง

### Dashboard (Admin)
```
src/app/(dashboard)/dashboard/mission/
  └── page.tsx                          # หน้าหลัก

src/components/dashboard/mission/
  ├── MainMission.tsx                   # Component หลัก
  ├── TableMission.tsx                  # ตารางแสดงภารกิจ
  ├── DialogCreate.tsx                  # ฟอร์มสร้างภารกิจ
  ├── DialogEdit.tsx                    # ฟอร์มแก้ไขภารกิจ
  ├── DialogDelete.tsx                  # ยืนยันการลบ
  ├── DateTimePicker.tsx                # เลือกวันเวลา
  ├── AppReactDatepicker.tsx            # Date picker component
  └── fileUpload.tsx                    # Upload รูปภาพ
```

### LIFF (User)
```
src/app/(liff)/liff/mission/
  └── page.tsx                          # หน้าหลักผู้ใช้

src/components/liff/mission/
  ├── DialogMission.tsx                 # Dialog เข้าร่วมภารกิจ
  ├── DialogMissionActive.tsx           # Dialog ภารกิจที่กำลังทำ
  ├── DialogMissionWait.tsx             # Dialog รอภารกิจอื่นเสร็จ
  └── timeCounter.tsx                   # Countdown timer
```

### Actions & Hooks
```
src/action/mission/
  ├── useMissionShare.ts                # Hook สำหรับ Share Mission
  ├── useMissionDeposit.ts              # Hook สำหรับ Deposit Mission
  └── useMissionReport.ts               # Hook สำหรับรายงาน
```

---

## Flow การทำงานแบบละเอียด

### 1. Admin สร้างภารกิจใหม่

```
┌─────────────────────────────────────────────────────────────┐
│ Admin Dashboard: /dashboard/mission                        │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ 1. คลิกปุ่ม "เพิ่มข้อมูล"                                    │
│    → เปิด DialogCreate                                      │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. กรอกข้อมูลภารกิจ:                                        │
│    ┌──────────────────────────────────────────────┐         │
│    │ • Upload รูปภาพปก (thumbnail)                │         │
│    │ • หัวข้อ: "แชร์ 5 เพื่อนรับ 100 Point"       │         │
│    │ • รายละเอียด: เงื่อนไขครบถ้วน                │         │
│    │ • คะแนน: 100                                 │         │
│    │ • วันเริ่มต้น: 2025-11-01                    │         │
│    │ • วันสิ้นสุด: 2025-11-30                     │         │
│    │ • ประเภท: Share                             │         │
│    │ • เงื่อนไข: 5 (คน)                           │         │
│    │ • Session: "november-share"                 │         │
│    │ • สถานะ: Publish                            │         │
│    └──────────────────────────────────────────────┘         │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. กด Submit                                                │
│    → POST /api/create                                       │
│    → Insert to tbl_mission                                  │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. React Query Invalidate                                  │
│    → Cache refresh                                          │
│    → Table อัพเดทแสดงภารกิจใหม่                             │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. ภารกิจปรากฏใน LIFF ทันที (status = publish)              │
└─────────────────────────────────────────────────────────────┘
```

---

### 2. ผู้ใช้เข้าร่วมภารกิจ (Join Mission)

```
┌─────────────────────────────────────────────────────────────┐
│ LIFF: /liff/mission                                        │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ 1. Load ข้อมูล                                              │
│    ┌──────────────────────────────────────────────┐         │
│    │ useReadKey('tbl_mission', 'status', 'publish')│        │
│    │ useReadBy('tbl_client', userId)               │        │
│    │ useReadKey('tbl_mission_logs', 'tel', tel)    │        │
│    └──────────────────────────────────────────────┘         │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. กรอง Mission ที่แสดง                                      │
│    ┌──────────────────────────────────────────────┐         │
│    │ • ซ่อน Mission ที่ทำเสร็จแล้ว (complete)     │         │
│    │ • เรียง Mission ที่กำลังทำขึ้นก่อน (active)  │         │
│    │ • แสดง Mission ว่างที่รอเข้าร่วม             │         │
│    └──────────────────────────────────────────────┘         │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. ผู้ใช้เห็น Mission Card                                  │
│    ┌──────────────────────────────────────────────┐         │
│    │ ╔════════════════════════════════════╗       │         │
│    │ ║  [รูปภาพ Thumbnail]                ║       │         │
│    │ ║                                    ║       │         │
│    │ ║  แชร์ 5 เพื่อนรับ 100 Point        ║       │         │
│    │ ║  สิ้นสุด: 30 พ.ย. 2568             ║       │         │
│    │ ║                                    ║       │         │
│    │ ║            [ปุ่มเข้าร่วม]           ║       │         │
│    │ ╚════════════════════════════════════╝       │         │
│    └──────────────────────────────────────────────┘         │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. คลิก "เข้าร่วม"                                           │
│    → เปิด DialogMission                                     │
│    → แสดงรายละเอียดเต็ม                                      │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. ยืนยันเข้าร่วม                                            │
│    → actionCreate('tbl_mission_logs', {                     │
│         userId: 'U1234...',                                 │
│         tel: '0812345678',                                  │
│         mission_id: 'mission_123',                          │
│         status: 'active',                                   │
│         createDate: NOW                                     │
│       })                                                    │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. Invalidate Queries                                       │
│    → ['tbl_mission_logs']                                   │
│    → ['tbl_mission', 'status', 'publish']                   │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ 7. หน้าจอ Refresh                                            │
│    → Mission Card เปลี่ยนเป็น "DialogMissionActive"         │
│    → แสดง Progress Bar                                      │
│    → เริ่ม Countdown Timer                                  │
└─────────────────────────────────────────────────────────────┘
```

---

### 3. ติดตามความคืบหน้า (Track Progress)

```
┌─────────────────────────────────────────────────────────────┐
│ DialogMissionActive Component                              │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ 1. Check Mission Type                                       │
│    ┌──────────────────────────────────────────────┐         │
│    │ if (type === 'share') {                      │         │
│    │   → useMissionShare(...)                     │         │
│    │ } else if (type === 'deposit') {             │         │
│    │   → useMissionDeposit(...)                   │         │
│    │ }                                            │         │
│    └──────────────────────────────────────────────┘         │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. React Query Auto-Refetch (ทุก 30 วินาที)                 │
│    ┌──────────────────────────────────────────────┐         │
│    │ queryKey: ['missionShare', userId, ...]      │         │
│    │ refetchInterval: 30000  // 30 seconds        │         │
│    │ staleTime: 30000                             │         │
│    │ refetchOnMount: true                         │         │
│    │ refetchOnWindowFocus: true                   │         │
│    └──────────────────────────────────────────────┘         │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. External API Call (Share Mission Example)                │
│    ┌──────────────────────────────────────────────┐         │
│    │ GET /games/players/line/affiliate            │         │
│    │ ?line_id=U1234...                            │         │
│    │ &line_at=@lottwin88                          │         │
│    │                                              │         │
│    │ Response:                                    │         │
│    │ {                                            │         │
│    │   playerBets: [                              │         │
│    │     {username: 'user1', created_at: '...'},  │         │
│    │     {username: 'user2', created_at: '...'},  │         │
│    │     ...                                      │         │
│    │   ]                                          │         │
│    │ }                                            │         │
│    └──────────────────────────────────────────────┘         │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. Data Processing                                          │
│    ┌──────────────────────────────────────────────┐         │
│    │ // กรองตามช่วงเวลา                            │         │
│    │ const filtered = playerBets.filter(p => {    │         │
│    │   const created = new Date(p.created_at)     │         │
│    │   return created >= startDate                │         │
│    │       && created <= endDate                  │         │
│    │ })                                           │         │
│    │                                              │         │
│    │ // นับ unique                                │         │
│    │ const unique = new Set(                      │         │
│    │   filtered.map(p => p.username)              │         │
│    │ )                                            │         │
│    │                                              │         │
│    │ const totalPlayers = unique.size             │         │
│    └──────────────────────────────────────────────┘         │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. Calculate Progress                                       │
│    ┌──────────────────────────────────────────────┐         │
│    │ const progress =                             │         │
│    │   (totalPlayers / condition) * 100           │         │
│    │                                              │         │
│    │ // เช่น: (3 / 5) * 100 = 60%                │         │
│    │                                              │         │
│    │ setSumPercent(Math.min(progress, 100))       │         │
│    └──────────────────────────────────────────────┘         │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. Update UI                                                │
│    ┌──────────────────────────────────────────────┐         │
│    │ ╔════════════════════════════════════╗       │         │
│    │ ║  [รูปภาพ]                          ║       │         │
│    │ ║                                    ║       │         │
│    │ ║  แชร์ 5 เพื่อนรับ 100 Point        ║       │         │
│    │ ║  สิ้นสุด: 30 พ.ย. 2568             ║       │         │
│    │ ║                                    ║       │         │
│    │ ║  [████████████░░░░░░░░] 60%        ║       │         │
│    │ ║                                    ║       │         │
│    │ ║  เหลือเวลา: 25 วัน 12:30:45        ║       │         │
│    │ ║  จำนวนแชร์: 3 / 5 คน               ║       │         │
│    │ ║                                    ║       │         │
│    │ ║        [รับภารกิจนี้แล้ว]          ║       │         │
│    │ ╚════════════════════════════════════╝       │         │
│    └──────────────────────────────────────────────┘         │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ 7. ทุก 30 วินาที → Repeat Step 3-6                          │
└─────────────────────────────────────────────────────────────┘
```

---

### 4. รับรางวัล (Claim Reward)

```
┌─────────────────────────────────────────────────────────────┐
│ เมื่อ Progress = 100%                                        │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ 1. ปุ่มเปลี่ยนเป็น "กดรับ 100 POINT" (สีแดง)                 │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. ผู้ใช้คลิก "กดรับ POINT"                                  │
│    → handleGetPoint()                                       │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. Validate Progress                                        │
│    ┌──────────────────────────────────────────────┐         │
│    │ if (sumPercent < 100) {                      │         │
│    │   alert('ยังทำไม่สำเร็จ')                    │         │
│    │   return                                     │         │
│    │ }                                            │         │
│    └──────────────────────────────────────────────┘         │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. Update Mission Log                                       │
│    ┌──────────────────────────────────────────────┐         │
│    │ actionUpdate('tbl_mission_logs', {           │         │
│    │   _id: logId,                                │         │
│    │   status: 'complete',                        │         │
│    │   point: 100,                                │         │
│    │   completeDate: NOW                          │         │
│    │ })                                           │         │
│    └──────────────────────────────────────────────┘         │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. Update Client Point                                      │
│    ┌──────────────────────────────────────────────┐         │
│    │ actionPoint('tbl_client_point', {            │         │
│    │   userId: 'U1234...',                        │         │
│    │   tel: '0812345678',                         │         │
│    │   point: 100,                                │         │
│    │   operation: '+' // เพิ่ม point             │         │
│    │ })                                           │         │
│    │                                              │         │
│    │ // คะแนนใน tbl_client_point จะ += 100       │         │
│    └──────────────────────────────────────────────┘         │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. Create Point Log                                         │
│    ┌──────────────────────────────────────────────┐         │
│    │ actionCreate('tbl_point_logs', {             │         │
│    │   userId: 'U1234...',                        │         │
│    │   tel: '0812345678',                         │         │
│    │   point: 100,                                │         │
│    │   operation: '+',                            │         │
│    │   title: 'แชร์ 5 เพื่อนรับ 100 Point',       │         │
│    │   createDate: NOW                            │         │
│    │ })                                           │         │
│    └──────────────────────────────────────────────┘         │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ 7. Invalidate All Related Queries                          │
│    ┌──────────────────────────────────────────────┐         │
│    │ queryClient.invalidateQueries({              │         │
│    │   queryKey: ['tbl_mission_logs']             │         │
│    │ })                                           │         │
│    │ queryClient.invalidateQueries({              │         │
│    │   queryKey: ['tbl_mission']                  │         │
│    │ })                                           │         │
│    │ queryClient.invalidateQueries({              │         │
│    │   queryKey: ['tbl_client_point']             │         │
│    │ })                                           │         │
│    │ queryClient.invalidateQueries({              │         │
│    │   queryKey: ['missionShare']                 │         │
│    │ })                                           │         │
│    └──────────────────────────────────────────────┘         │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ 8. แสดง Success Dialog                                       │
│    ┌──────────────────────────────────────────────┐         │
│    │ ╔════════════════════════════════════╗       │         │
│    │ ║  คุณได้รับ 100 POINT               ║       │         │
│    │ ║                                    ║       │         │
│    │ ║         [ปิดหน้าจอ]                ║       │         │
│    │ ╚════════════════════════════════════╝       │         │
│    └──────────────────────────────────────────────┘         │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ 9. Mission Card หายไป (ถูกกรองออก เพราะ status = complete) │
└─────────────────────────────────────────────────────────────┘
```

---

## Session-based System (ระบบ Session)

### ทำไมต้องมี Session?

ป้องกันผู้ใช้ทำหลาย Mission พร้อมกันในกลุ่มเดียวกัน

**ตัวอย่าง:**
```
Mission A: แชร์ 5 เพื่อน (session: "november-share")
Mission B: แชร์ 10 เพื่อน (session: "november-share")
Mission C: แชร์ 20 เพื่อน (session: "november-share")
```

**กฎ:** ผู้ใช้สามารถทำได้เพียง 1 Mission ต่อ 1 Session

### Logic การตรวจสอบ

```typescript
// ใน LIFF page.tsx
const sortedItems = useMemo(() => {
  return items.data
    .filter(item => {
      // ซ่อน Mission ที่ทำเสร็จแล้ว
      const isCompleted = missionLog.data.some(
        log => log.mission_id === item._id
            && (log.status === 'success' || log.status === 'complete')
      )
      return !isCompleted
    })
    .sort((a, b) => {
      // เรียง Mission ที่กำลังทำขึ้นก่อน
      const aIsActive = missionLog.data.some(
        log => log.mission_id === a._id && log.status === 'active'
      )
      const bIsActive = missionLog.data.some(
        log => log.mission_id === b._id && log.status === 'active'
      )

      if (aIsActive && !bIsActive) return -1
      if (!aIsActive && bIsActive) return 1
      return 0
    })
}, [items.data, missionLog.data])

// การแสดง Component
slicedItems.map(item => {
  const activeMission = missionLog.data.find(
    log => log.mission_id === item._id && log.status === 'active'
  )

  const groupMission = missionLog.data.find(
    log => log.status === 'active'
        && log.missionDetails.session === item.session
  )

  const canReceiveMission = !groupMission

  if (activeMission) {
    return <DialogMissionActive />  // กำลังทำอยู่
  } else if (canReceiveMission) {
    return <DialogMission />  // สามารถเข้าร่วมได้
  } else {
    return <DialogMissionWait />  // รอภารกิจอื่นเสร็จก่อน
  }
})
```

**ผลลัพธ์:**
```
ผู้ใช้เข้าร่วม Mission A (session: "november-share", status: active)

→ Mission B แสดง DialogMissionWait "กรุณารอทำภารกิจ A ให้เสร็จก่อน"
→ Mission C แสดง DialogMissionWait "กรุณารอทำภารกิจ A ให้เสร็จก่อน"
→ Mission D (session: "december-deposit") แสดง DialogMission "เข้าร่วมได้"
```

---

## Countdown Timer

### Component: `timeCounter.tsx`

**วัตถุประสงค์:** แสดงเวลาที่เหลือจนกว่าภารกิจจะหมดอายุ

```typescript
interface TimeCounterProps {
  expire: string        // วันสิ้นสุดภารกิจ (ISO string)
  missionId: string     // Mission ID
  onExpire: Function    // Callback เมื่อหมดเวลา
  log: any              // Mission log
}

export const TimeCounter = ({ expire, missionId, onExpire, log }: TimeCounterProps) => {
  const [timeLeft, setTimeLeft] = useState('')

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime()
      const expireTime = new Date(expire).getTime()
      const distance = expireTime - now

      if (distance < 0) {
        clearInterval(timer)
        setTimeLeft('หมดเวลา')

        // Update mission log to expired
        actionUpdate('tbl_mission_logs', {
          _id: log._id,
          status: 'expired'
        })

        onExpire()
        return
      }

      // คำนวณวัน ชั่วโมง นาที วินาที
      const days = Math.floor(distance / (1000 * 60 * 60 * 24))
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((distance % (1000 * 60)) / 1000)

      setTimeLeft(`${days} วัน ${hours}:${minutes}:${seconds}`)
    }, 1000)

    return () => clearInterval(timer)
  }, [expire, missionId, onExpire, log])

  return <span className="text-xs">{timeLeft}</span>
}
```

**Display:**
```
เหลือเวลา: 25 วัน 12:30:45
เหลือเวลา: 0 วัน 23:59:30
เหลือเวลา: หมดเวลา
```

---

## API Endpoints สำหรับ Mission

### Internal APIs

#### 1. Create Mission
```typescript
POST /api/create
Body: {
  table: 'tbl_mission',
  data: {
    title: string
    detail: string
    thumbnail: string
    type: 'share' | 'deposit'
    point: number
    condition: number
    session: string
    start_date: Date
    end_date: Date
    status: 'publish' | 'pending'
  }
}
```

#### 2. Update Mission
```typescript
PUT /api/update
Body: {
  table: 'tbl_mission',
  data: {
    _id: string
    ...fields to update
  }
}
```

#### 3. Delete Mission
```typescript
DELETE /api/delete
Body: {
  table: 'tbl_mission',
  id: string
}
```

#### 4. Join Mission (Create Log)
```typescript
POST /api/create
Body: {
  table: 'tbl_mission_logs',
  data: {
    userId: string
    tel: string
    mission_id: string
    status: 'active'
  }
}
```

#### 5. Complete Mission (Update Log)
```typescript
PUT /api/update
Body: {
  table: 'tbl_mission_logs',
  data: {
    _id: string
    status: 'complete'
    point: number
    completeDate: Date
  }
}
```

#### 6. Update Point
```typescript
POST /api/point
Body: {
  table: 'tbl_client_point',
  data: {
    userId: string
    tel: string
    point: number
    operation: '+' | '-'
  }
}

// Logic ใน API:
if (operation === '+') {
  currentPoint += point
} else {
  currentPoint -= point
}
```

### External APIs

#### 1. Share/Affiliate API
```typescript
GET https://api.ruaysud.com/games/players/line/affiliate
  ?line_id={userId}
  &line_at=@lottwin88

Headers: {
  'API-KEY': process.env.NEXT_PUBLIC_BASE_API_KEY
}

Response: {
  code: string
  playerBets: [
    {
      username: string
      created_at: string (ISO)
      bet_amount: number
      commission_amount: number
      ...
    }
  ]
  playerSummaries: [
    {
      date: string
      amount: number
    }
  ]
}
```

#### 2. Deposit API
```typescript
GET https://api.ruaysud.com/players/v1/line/deposit
  ?line_id={userId}
  &line_at=@lottwin88
  &start_date={timestamp}
  &end_date={timestamp}

Headers: {
  'api-key': process.env.NEXT_PUBLIC_BASE_API_KEY
}

Response: {
  deposit: number  // ยอดฝากรวม (บาท)
}
```

---

## React Query Implementation

### useMissionShare Hook

```typescript
// src/action/mission/useMissionShare.ts

export const useMissionShare = (
  userId: string,
  lineAt: string,
  missionStartDate: string,
  missionEndDate: string,
  options: ShareOptions = {}
) => {
  const queryKey = ['missionShare', userId, lineAt, missionStartDate, missionEndDate]

  return useQuery<ShareData>({
    queryKey,
    queryFn: async () => {
      // Validate parameters
      if (!missionStartDate || !missionEndDate || !userId || !lineAt) {
        return { totalPlayers: 0 }
      }

      // Fetch from External API
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/games/players/line/affiliate?` +
        `line_id=${userId}&line_at=${lineAt}`,
        {
          method: 'GET',
          headers: {
            'API-KEY': process.env.NEXT_PUBLIC_BASE_API_KEY
          },
          cache: 'no-cache'
        }
      )

      const data: ShareResponse = await response.json()

      // Parse dates
      const missionStart = new Date(missionStartDate)
      const missionEnd = new Date(missionEndDate)

      // Filter playerBets by date range
      const uniquePlayers = new Set(
        data.playerBets
          .filter(player => {
            const createdAt = new Date(player.created_at)
            return createdAt >= missionStart && createdAt <= missionEnd
          })
          .map(player => player.username)
      )

      return {
        totalPlayers: uniquePlayers.size,
        rawData: data
      }
    },

    // React Query Options
    staleTime: 30 * 1000,              // 30 seconds
    gcTime: 5 * 60 * 1000,             // 5 minutes
    refetchInterval: 30 * 1000,        // Auto refetch every 30s
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: (failureCount) => failureCount < 3,
    enabled: Boolean(missionStartDate && missionEndDate && userId && lineAt)
  })
}
```

### useMissionDeposit Hook

```typescript
// src/action/mission/useMissionDeposit.ts

export const useMissionDeposit = (
  userId: string,
  lineAt: string,
  startDate: string,
  endDate: string,
  options: DepositOptions = {}
) => {
  const queryKey = ['missionDeposit', userId, lineAt, startDate, endDate]

  return useQuery<DepositData>({
    queryKey,
    queryFn: async () => {
      if (!startDate || !endDate || !userId || !lineAt) {
        return { totalDeposit: 0 }
      }

      // Convert to Unix timestamp
      const missionStart = new Date(startDate)
      const missionEnd = new Date(endDate)
      const startTimestamp = Math.floor(missionStart.getTime() / 1000)
      const endTimestamp = Math.floor(missionEnd.getTime() / 1000)

      // Fetch from External API
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/players/v1/line/deposit?` +
        `line_id=${userId}&` +
        `line_at=${lineAt}&` +
        `start_date=${startTimestamp}&` +
        `end_date=${endTimestamp}`,
        {
          method: 'GET',
          headers: {
            'api-key': process.env.NEXT_PUBLIC_BASE_API_KEY
          },
          cache: 'no-cache'
        }
      )

      const data: DepositResponse = await response.json()

      return {
        totalDeposit: data.deposit,
        rawData: data
      }
    },

    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchInterval: 30 * 1000,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    enabled: Boolean(startDate && endDate && userId && lineAt)
  })
}
```

---

## Performance Optimization

### 1. Mission Cache

```typescript
// Pre-calculate mission dates to reduce re-renders
const missionCache = useMemo(() => {
  if (!Array.isArray(missionLog.data)) return { share: {}, deposit: {} }

  const shareCache: Record<string, MissionCacheData> = {}
  const depositCache: Record<string, MissionCacheData> = {}

  missionLog.data.forEach(mission => {
    if (mission.missionDetails.type === 'share') {
      shareCache[mission._id] = {
        startDate: mission.createDate,
        endDate: mission.missionDetails.end_date,
        condition: mission.missionDetails.condition
      }
    } else if (mission.missionDetails.type === 'deposit') {
      depositCache[mission._id] = {
        startDate: mission.createDate,
        endDate: mission.missionDetails.end_date,
        condition: mission.missionDetails.condition
      }
    }
  })

  return { share: shareCache, deposit: depositCache }
}, [missionLog.data])
```

### 2. Query Key Optimization

```typescript
// Stable query keys prevent unnecessary refetches
const queryKey = ['missionShare', userId, lineAt, startDate, endDate]

// NOT like this:
const queryKey = ['missionShare', { userId, lineAt, startDate, endDate }]
// ⚠️ Object reference changes every render → constant refetch
```

### 3. Conditional Fetching

```typescript
// Only fetch when actually needed
enabled: type === 'share' && Boolean(startDate && endDate && userId)

// Disable fetching for completed missions
enabled: log.status === 'active' && type === 'share'
```

### 4. Debounced Updates

```typescript
// Prevent too frequent state updates
const debouncedProgress = useMemo(() => {
  return debounce((progress: number) => {
    setSumPercent(Math.min(progress, 100))
  }, 500)
}, [])
```

---

## Error Handling

### 1. API Errors

```typescript
try {
  const response = await fetch(apiUrl)

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`)
  }

  const data = await response.json()
  return data
} catch (error) {
  console.error('Mission data fetch error:', error)
  throw error instanceof Error
    ? error
    : new Error('Unknown error occurred')
}
```

### 2. Invalid Date Handling

```typescript
const missionStart = new Date(startDate)

if (isNaN(missionStart.getTime())) {
  console.error('Invalid date provided:', startDate)
  return { totalPlayers: 0 }
}
```

### 3. Missing Data Handling

```typescript
if (!items.data || items.data.length === 0) {
  return <div>ไม่พบภารกิจ</div>
}

if (!profile.data) {
  return <div>กรุณาเข้าสู่ระบบ</div>
}
```

### 4. Network Retry Logic

```typescript
retry: (failureCount, error) => {
  // Retry up to 3 times
  if (failureCount < 3) return true

  // Don't retry on 4xx errors
  if (error.message.includes('400') || error.message.includes('401')) {
    return false
  }

  return false
}

retryDelay: attemptIndex => {
  // Exponential backoff: 1s, 2s, 4s, ...
  return Math.min(1000 * 2 ** attemptIndex, 30000)
}
```

---

## Security Considerations

### 1. API Key Protection

```env
# .env (ไม่ควร commit ลง Git)
NEXT_PUBLIC_BASE_API_KEY=xxxxxxxxxxxx
```

```typescript
// ใช้ environment variable
headers.append('API-KEY', process.env.NEXT_PUBLIC_BASE_API_KEY)
```

### 2. User Validation

```typescript
// ตรวจสอบว่าผู้ใช้มีสิทธิ์รับ Point หรือไม่
const validateMissionCompletion = async (logId, userId) => {
  const log = await db.collection('tbl_mission_logs').findOne({ _id: logId })

  // ตรวจสอบเจ้าของ
  if (log.userId !== userId) {
    throw new Error('Unauthorized')
  }

  // ตรวจสอบสถานะ
  if (log.status !== 'active') {
    throw new Error('Mission not active')
  }

  return true
}
```

### 3. Prevent Double Claim

```typescript
const handleGetPoint = async () => {
  // Lock เพื่อป้องกันกดซ้ำ
  if (isClaimingisRef.current) return
  isClaimingRef.current = true

  try {
    // ตรวจสอบสถานะอีกครั้ง
    const currentLog = await fetchMissionLog(logId)
    if (currentLog.status === 'complete') {
      alert('คุณได้รับ Point ไปแล้ว')
      return
    }

    // ดำเนินการรับ Point
    await claimReward()
  } finally {
    isClaimingRef.current = false
  }
}
```

---

## Testing Scenarios

### Test Case 1: Join Mission

```
Given: ผู้ใช้ล็อกอินอยู่
And: มีภารกิจที่ status = 'publish'
And: ผู้ใช้ยังไม่ได้เข้าร่วมภารกิจนี้
And: ไม่มีภารกิจอื่นใน session เดียวกันที่ active

When: ผู้ใช้คลิก "เข้าร่วม"

Then:
  - สร้าง record ใน tbl_mission_logs
  - status = 'active'
  - createDate = เวลาปัจจุบัน
  - Mission Card เปลี่ยนเป็น DialogMissionActive
  - แสดง Progress Bar
  - เริ่ม Countdown
```

### Test Case 2: Track Progress (Share)

```
Given: ผู้ใช้เข้าร่วมภารกิจ "แชร์ 5 เพื่อน" แล้ว
And: createDate = 2025-11-01 10:00:00
And: end_date = 2025-11-30 23:59:59

When: External API return playerBets:
  [
    {username: 'user1', created_at: '2025-11-01 11:00:00'}, // ✅ นับ
    {username: 'user2', created_at: '2025-11-02 12:00:00'}, // ✅ นับ
    {username: 'user1', created_at: '2025-11-03 13:00:00'}, // ❌ ซ้ำ
    {username: 'user3', created_at: '2025-10-31 09:00:00'}  // ❌ ก่อน createDate
  ]

Then:
  - totalPlayers = 2
  - progress = (2 / 5) * 100 = 40%
  - ปุ่มยังเป็น "รับภารกิจนี้แล้ว" (ยังกดรับ Point ไม่ได้)
```

### Test Case 3: Complete Mission

```
Given: ผู้ใช้เข้าร่วมภารกิจ "แชร์ 5 เพื่อน"
And: progress = 100% (totalPlayers = 5)

When: ผู้ใช้คลิก "กดรับ 100 POINT"

Then:
  - Update tbl_mission_logs:
    * status = 'complete'
    * point = 100
    * completeDate = NOW
  - Update tbl_client_point:
    * point += 100
  - Create tbl_point_logs:
    * operation = '+'
    * point = 100
    * title = 'แชร์ 5 เพื่อนรับ 100 Point'
  - Mission Card หายไป (filtered out)
  - แสดง Dialog "คุณได้รับ 100 POINT"
```

### Test Case 4: Session Limitation

```
Given:
  - Mission A: session = "nov-share", status = 'publish'
  - Mission B: session = "nov-share", status = 'publish'
  - ผู้ใช้เข้าร่วม Mission A (status = 'active')

When: ผู้ใช้เห็น Mission B

Then:
  - Mission B แสดง DialogMissionWait
  - ข้อความ: "กรุณารอทำภารกิจอื่นให้เสร็จก่อน"
  - ไม่มีปุ่ม "เข้าร่วม"
```

### Test Case 5: Expired Mission

```
Given: ผู้ใช้เข้าร่วมภารกิจ
And: progress = 60%
And: end_date ผ่านไปแล้ว (หมดเวลา)

When: Countdown Timer ถึง 0

Then:
  - Update tbl_mission_logs:
    * status = 'expired'
  - TimeCounter แสดง "หมดเวลา"
  - ปุ่มไม่สามารถกดรับ Point ได้
  - Mission Card อาจจะหายไป หรือแสดง "หมดอายุ"
```

---

## Best Practices

### 1. Date Handling

```typescript
// ✅ ใช้ ISO String สำหรับ storage
const createDate = new Date().toISOString()

// ✅ แปลงก่อนใช้งาน
const missionStart = new Date(log.createDate)

// ✅ ตรวจสอบ valid date
if (isNaN(missionStart.getTime())) {
  throw new Error('Invalid date')
}

// ✅ ใช้ timezone-aware date library
import { formatInTimeZone } from 'date-fns-tz'
const formattedDate = formatInTimeZone(
  new Date(date),
  'Asia/Bangkok',
  'dd/MM/yyyy HH:mm:ss'
)
```

### 2. React Query Best Practices

```typescript
// ✅ Stable query keys
const queryKey = ['missionShare', userId, lineAt, startDate, endDate]

// ✅ Proper enabled flag
enabled: Boolean(startDate && endDate && userId && lineAt)

// ✅ Appropriate stale/cache time
staleTime: 30 * 1000,      // Data fresh for 30s
gcTime: 5 * 60 * 1000,     // Keep in cache for 5min

// ✅ Refetch strategy
refetchInterval: 30 * 1000, // Auto refetch every 30s
refetchOnMount: true,
refetchOnWindowFocus: true
```

### 3. Component Optimization

```typescript
// ✅ Memoize expensive calculations
const sortedItems = useMemo(() => {
  return items.data.sort(...)
}, [items.data])

// ✅ Prevent unnecessary re-renders
const missionCache = useMemo(() => {
  return calculateCache(missionLog.data)
}, [missionLog.data])

// ✅ Stable callback references
const handleExpire = useCallback(() => {
  setPage(1)
}, [])
```

### 4. Error Boundaries

```typescript
<ErrorBoundary
  fallback={<div>เกิดข้อผิดพลาด กรุณารีเฟรชหน้าเว็บ</div>}
>
  <DialogMissionActive />
</ErrorBoundary>
```

---

## Future Enhancements

### 1. Mission Templates

```typescript
// Admin สร้าง Mission จาก Template
const missionTemplates = [
  {
    name: 'Share 5 friends',
    type: 'share',
    condition: 5,
    point: 100
  },
  {
    name: 'Deposit 1000',
    type: 'deposit',
    condition: 1000,
    point: 50
  }
]
```

### 2. Mission Badges & Achievements

```typescript
// ระบบเหรียญและความสำเร็จ
interface MissionBadge {
  mission_id: string
  userId: string
  badgeType: 'bronze' | 'silver' | 'gold'
  earnedDate: Date
}
```

### 3. Mission Leaderboard

```typescript
// ตารางผู้นำ
interface Leaderboard {
  userId: string
  totalMissionsCompleted: number
  totalPointsEarned: number
  rank: number
}
```

### 4. Recurring Missions

```typescript
// ภารกิจที่ทำซ้ำได้
interface RecurringMission {
  recurring: 'daily' | 'weekly' | 'monthly'
  maxCompletions: number  // จำนวนครั้งสูงสุดที่ทำได้
}
```

### 5. Mission Notifications

```typescript
// แจ้งเตือนผ่าน LINE
const sendMissionNotification = async (userId: string, type: string) => {
  if (type === 'complete') {
    // ส่ง Flex Message "ยินดีด้วย! ทำภารกิจสำเร็จ"
  } else if (type === 'expire_soon') {
    // ส่ง "ภารกิจใกล้หมดอายุ เหลือเวลา 24 ชม."
  }
}
```

---

## สรุป

Mission Module เป็นหัวใจสำคัญของระบบ ที่ผสมผสานระหว่าง:
- **Gamification** - ทำให้ผู้ใช้รู้สึกสนุกและมีเป้าหมาย
- **Real-time Tracking** - ติดตามความคืบหน้าแบบเรียลไทม์
- **External API Integration** - เชื่อมต่อกับระบบภายนอกเพื่อตรวจสอบเงื่อนไข
- **Reward System** - มอบรางวัลอัตโนมัติเมื่อสำเร็จ

### จุดเด่นของระบบ

1. **Real-time Progress Tracking**
   - อัพเดททุก 30 วินาที
   - แสดง Progress Bar แบบเรียลไทม์
   - Countdown Timer

2. **Session-based System**
   - ป้องกันการทำหลาย Mission พร้อมกัน
   - จัดการ Priority ได้ดี

3. **Flexible Mission Types**
   - รองรับหลายประเภท (Share, Deposit)
   - ง่ายต่อการเพิ่มประเภทใหม่

4. **Automatic Reward Distribution**
   - คำนวณและมอบรางวัลอัตโนมัติ
   - บันทึก Log ครบถ้วน

5. **User-friendly UI**
   - ใช้งานง่าย เข้าใจง่าย
   - Visual Feedback ชัดเจน

---

**Related Modules:**
- [07-POINT.md](./07-POINT.md) - ระบบคะแนนที่ Mission แจกให้
- [04-REPORT.md](./04-REPORT.md) - รายงานการทำ Mission
- [05-SETTING.md](./05-SETTING.md) - ระบบเช็คอิน (Mission อีกรูปแบบ)

---

**Last Updated:** 2025-11-03
**Version:** 2.0.0
