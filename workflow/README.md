# 📚 Workflow Documentation - LT-ATGAME CRM Platform

## เกี่ยวกับเอกสารนี้

เอกสารชุดนี้เป็นคู่มือการทำงานของระบบ LT-ATGAME CRM & Affiliate Platform ที่ครบถ้วนและละเอียด สร้างขึ้นเพื่อให้นักพัฒนาและผู้ดูแลระบบเข้าใจการทำงานของแต่ละโมดูลอย่างลึกซึ้ง

---

## 📋 สารบัญเอกสาร

### [00-OVERVIEW.md](./00-OVERVIEW.md) - ภาพรวมระบบ
**เนื้อหา:**
- ข้อมูลทั่วไปและวัตถุประสงค์ของระบบ
- โครงสร้างระบบและเทคโนโลยีที่ใช้
- โมดูลหลักทั้ง 7 โมดูล
- การเชื่อมต่อ External API
- โครงสร้างฐานข้อมูล MongoDB
- Environment Variables
- Flow การทำงานหลัก

**เหมาะสำหรับ:** ผู้ที่ต้องการเข้าใจภาพรวมของระบบทั้งหมด

---

### [01-ONLINE-MARKETING.md](./01-ONLINE-MARKETING.md) - ระบบข่าวสารและการตลาด
**เนื้อหา:**
- จัดการเนื้อหาการตลาด บทความ โปรโมชั่น
- CRUD Operations (Create, Read, Update, Delete)
- การอัพโหลดรูปภาพและไฟล์
- การแสดงผลใน LIFF Application
- State Management และ React Query

**Collection:** `tbl_online_marketings`

**คุณสมบัติหลัก:**
- ✅ Upload รูปภาพและไฟล์ดาวน์โหลด
- ✅ Rich Content Management
- ✅ Real-time Update
- ✅ Responsive Design

---

### [02-COMMUNITY.md](./02-COMMUNITY.md) - ระบบ Community Links
**เนื้อหา:**
- จัดการลิงก์ Social Media (Facebook, LINE, Telegram)
- Group by Category
- External Link Management
- URL Validation

**Collection:** `tbl_community`

**คุณสมบัติหลัก:**
- ✅ จัดกลุ่มตาม Platform
- ✅ Icon และ Color สำหรับแต่ละ Category
- ✅ เปิด URL ใน External Browser
- ✅ Click Tracking

---

### [03-MISSION.md](./03-MISSION.md) ⭐ - ระบบภารกิจ (โมดูลหลัก)
**เนื้อหา:**
- ระบบภารกิจสำหรับให้ผู้ใช้ทำเพื่อรับคะแนน
- Share Mission (แชร์เพื่อน Affiliate)
- Deposit Mission (ฝากเงิน)
- Real-time Progress Tracking
- Session-based System
- Countdown Timer
- การคำนวณและตรวจสอบเงื่อนไข
- External API Integration
- Automatic Reward Distribution

**Collections:** `tbl_mission`, `tbl_mission_logs`

**คุณสมบัติหลัก:**
- ✅ Real-time Progress Tracking (auto-refetch ทุก 30 วินาที)
- ✅ Session-based (ทำได้ 1 Mission ต่อ 1 Session)
- ✅ Progress Bar และ Countdown Timer
- ✅ Integration กับ External API
- ✅ Automatic Reward Distribution
- ✅ Mission Cache สำหรับ Performance

**เหมาะสำหรับ:** นักพัฒนาที่ต้องการเข้าใจระบบหลักและการทำงานแบบละเอียด

**หัวข้อพิเศษ:**
- การคำนวณ Share Mission (นับ unique players)
- การคำนวณ Deposit Mission (รวมยอดฝาก)
- Flow การเข้าร่วมและรับรางวัล
- React Query Optimization
- Error Handling และ Security

---

### [04-REPORT.md](./04-REPORT.md) - ระบบรายงาน
**เนื้อหา:**
- รายงานการทำ Mission
- สรุปสถิติรายวัน
- Dashboard Analytics
- Export Data

**API:** `/api/reports/missions`

**คุณสมบัติหลัก:**
- ✅ สรุปข้อมูลรวม (Total Missions, Points)
- ✅ รายงานรายวัน
- ✅ Filter ตามช่วงเวลา
- ✅ Export เป็น Excel/PDF

---

### [05-SETTING.md](./05-SETTING.md) - ระบบเช็คอิน/กิจกรรมรายวัน
**เนื้อหา:**
- กิจกรรมรายวันที่ต้องรอ Admin อนุมัติ
- Daily Check-in System
- Manual Approval Workflow
- Point Distribution

**Collections:** `tbl_setting`, `tbl_setting_logs`

**คุณสมบัติหลัก:**
- ✅ Daily Check-in
- ✅ Manual Approval by Admin
- ✅ Approve/Reject Workflow
- ✅ Point Distribution เมื่ออนุมัติ

**Flow:**
```
ผู้ใช้เข้าร่วม → pending → Admin ตรวจสอบ → approved/rejected → รับ Point
```

---

### [06-SUPPORT.md](./06-SUPPORT.md) - ระบบช่วยเหลือ/FAQ
**เนื้อหา:**
- คลังความรู้และ FAQ
- Rich Text Editor (Draft.js)
- Image Support
- Content Management

**Collection:** `tbl_support`

**คุณสมบัติหลัก:**
- ✅ Rich Text Editor (Bold, Italic, Headings, Lists, Links, Images)
- ✅ Upload รูปภาพปกและในเนื้อหา
- ✅ Category (Future Enhancement)
- ✅ Search Functionality

**เทคโนโลยี:**
- Draft.js สำหรับ Rich Text Editing
- HTML/JSON Storage Format
- Prose Styling

---

### [07-POINT.md](./07-POINT.md) - ระบบคะแนนและของรางวัล
**เนื้อหา:**
- จัดการคะแนนผู้ใช้
- รายการของรางวัล
- การแลกคะแนน
- ประวัติการทำรายการ

**Collections:** `tbl_point`, `tbl_client_point`, `tbl_point_logs`

**คุณสมบัติหลัก:**
- ✅ Point Management (+/-)
- ✅ Reward Catalog
- ✅ Transaction Logs
- ✅ Real-time Update
- ✅ Prevent Negative Points

**Point Flow:**
```
Mission สำเร็จ → +Point → แลกของรางวัล → -Point → Log ทุกรายการ
```

---

## 🎯 แนะนำการอ่าน

### สำหรับนักพัฒนาใหม่:
1. เริ่มที่ **00-OVERVIEW.md** เพื่อทำความเข้าใจภาพรวม
2. อ่าน **03-MISSION.md** เพื่อเข้าใจโมดูลหลักที่สำคัญที่สุด
3. อ่าน **07-POINT.md** เพื่อเข้าใจระบบคะแนน
4. อ่านโมดูลอื่นๆ ตามความสนใจ

### สำหรับผู้ดูแลระบบ (Admin):
1. **00-OVERVIEW.md** - ภาพรวม
2. **01-ONLINE-MARKETING.md** - จัดการข้อมูลการตลาด
3. **03-MISSION.md** - จัดการภารกิจ
4. **07-POINT.md** - จัดการของรางวัล
5. **04-REPORT.md** - ดูรายงาน

### สำหรับนักพัฒนาที่ต้องการ Implement Feature ใหม่:
1. อ่าน **00-OVERVIEW.md** เพื่อดู Technology Stack
2. อ่านโมดูลที่เกี่ยวข้องกับ Feature ที่จะทำ
3. ดูตัวอย่างการ Implement ใน **03-MISSION.md** (โมดูลที่ครบถ้วนที่สุด)

---

## 🔑 Key Concepts

### 1. React Query
ระบบใช้ TanStack React Query สำหรับ:
- Server State Management
- Auto Refetching
- Caching
- Invalidation

**Query Key Pattern:**
```typescript
['table_name']                          // ดึงทั้งหมด
['table_name', 'field', 'value']        // กรองตาม field
['missionShare', userId, ...]           // Custom queries
```

### 2. CRUD Operations
ทุกโมดูลใช้ Generic CRUD Functions:
- `actionCreate(table, data)` - สร้าง
- `useRead(table)` - อ่านทั้งหมด
- `useReadKey(table, key, value)` - อ่านตามเงื่อนไข
- `actionUpdate(table, data)` - อัพเดท
- `actionDelete(table, id)` - ลบ

### 3. API Routes Pattern
```
/api/create      → POST    → สร้างข้อมูล
/api/read/[slug] → GET     → อ่านทั้งหมด
/api/update      → PUT     → อัพเดท
/api/delete      → DELETE  → ลบ
/api/upload      → POST    → อัพโหลดไฟล์
```

### 4. External API Integration
- **Affiliate API** - ตรวจสอบจำนวนผู้แชร์
- **Deposit API** - ตรวจสอบยอดฝากเงิน
- **Authentication** - ใช้ API Key

### 5. Point System Flow
```
Mission → Complete → +Point → tbl_client_point
                   ↓
              tbl_point_logs

Point → Redeem → -Point → tbl_client_point
                       ↓
                  tbl_point_logs
```

---

## 📊 Database Schema Overview

### Core Tables
- `tbl_users` - Admin users
- `tbl_client` - LINE users
- `tbl_client_point` - User points

### Content Tables
- `tbl_online_marketings` - Marketing content
- `tbl_community` - Social links
- `tbl_support` - Help articles

### Mission & Point Tables
- `tbl_mission` - Mission definitions
- `tbl_mission_logs` - Mission participation logs
- `tbl_point` - Reward items
- `tbl_point_logs` - Point transaction logs
- `tbl_setting` - Daily activities
- `tbl_setting_logs` - Activity participation logs

---

## 🛠 Technology Stack

**Frontend:**
- Next.js 14 (App Router)
- React 18
- TypeScript
- Material-UI v5
- TailwindCSS

**State Management:**
- TanStack React Query (Server State)
- Zustand (Client State)

**Backend:**
- Next.js API Routes
- MongoDB + Mongoose
- JWT Authentication

**LINE Integration:**
- LIFF SDK v2.23.2
- LINE Messaging API

---

## 📝 Code Examples

### Read Data
```typescript
const items = useRead('tbl_mission')
const publishedItems = useReadKey('tbl_mission', 'status', 'publish')
```

### Create Data
```typescript
await actionCreate('tbl_mission', {
  title: 'New Mission',
  type: 'share',
  point: 100,
  condition: 5
})
```

### Update Point
```typescript
await actionPoint('tbl_client_point', {
  userId: 'U1234',
  tel: '0812345678',
  point: 100,
  operation: '+'
})
```

---

## 🔍 ค้นหาเนื้อหา

### หาวิธี Implement Feature
- **Mission Tracking** → 03-MISSION.md → "Real-time Progress Tracking"
- **Upload File** → 01-ONLINE-MARKETING.md → "File Upload Component"
- **Rich Text Editor** → 06-SUPPORT.md → "Rich Text Editor (Draft.js)"
- **Point Distribution** → 07-POINT.md → "Point Operation"

### หาวิธีใช้ API
- **External API** → 03-MISSION.md → "External APIs"
- **Internal API** → ดู API Endpoints ในแต่ละโมดูล

### หา Collections Schema
- ดูใน "Collection" section ของแต่ละโมดูล

---

## 📞 การสนับสนุน

หากมีคำถามหรือพบปัญหา:
1. อ่านเอกสารที่เกี่ยวข้อง
2. ตรวจสอบ Code Examples
3. ดู Error Handling และ Security Considerations
4. ติดต่อทีมพัฒนา

---

## 📅 Version History

**Version 2.0.0** (2025-11-03)
- เอกสารครบถ้วนทั้ง 7 โมดูล
- รายละเอียดการทำงานแบบลึก
- Code Examples และ Use Cases
- Flow Diagrams และ Architecture

---

## 🎓 Best Practices

### 1. React Query
- ใช้ stable query keys
- Set appropriate staleTime/cacheTime
- Invalidate queries after mutations

### 2. Error Handling
- Handle network errors
- Validate user input
- Show user-friendly messages

### 3. Security
- Validate API keys
- Check user permissions
- Prevent SQL injection (use Mongoose)
- Sanitize user input

### 4. Performance
- Memoize expensive calculations
- Use React.memo for components
- Optimize images
- Implement pagination

---

**สร้างโดย:** Claude Code AI
**วันที่:** 2025-11-03
**สำหรับโปรเจกต์:** LT-ATGAME CRM & Affiliate Platform
**เวอร์ชัน:** 2.0.0
