# ภาพรวมระบบ LT-ATGAME CRM & Affiliate Platform

## ข้อมูลทั่วไป

**ชื่อระบบ:** LT-ATGAME CRM & Affiliate Platform
**เทคโนโลยี:** Next.js 14.1.3 (React 18.2.0)
**ฐานข้อมูล:** MongoDB (Mongoose ODM)
**LINE Integration:** LIFF (LINE Front-end Framework)
**UI Framework:** Material-UI (MUI) v5
**State Management:** Zustand, React Query (TanStack Query)
**Styling:** TailwindCSS

## วัตถุประสงค์ของระบบ

ระบบนี้เป็นแพลตฟอร์มสำหรับจัดการกิจกรรม Affiliate Marketing ที่มีการ:
1. ทำภารกิจ (Mission) เพื่อสะสมคะแนน
2. สะสมคะแนน (Point) เพื่อนำไปแลกของรางวัล
3. จัดการข้อมูลสมาชิกและติดตามผลการทำงาน
4. แชร์ข้อมูลและโปรโมชั่นผ่าน LINE

## โครงสร้างระบบหลัก

ระบบแบ่งออกเป็น 2 ส่วนหลัก:

### 1. Dashboard (Admin Panel) - `/dashboard/*`
ส่วนจัดการระบบสำหรับผู้ดูแล เข้าถึงผ่าน `/dashboard`

### 2. LIFF Application (User Interface) - `/liff/*`
ส่วนสำหรับผู้ใช้งานทั่วไป ทำงานผ่าน LINE App

---

## โมดูลหลักของระบบ (7 โมดูล)

### 1. **Online Marketing** (`tbl_online_marketings`)
- จัดการเนื้อหาการตลาด บทความ โปรโมชั่น
- แสดงข้อมูลข่าวสารและกิจกรรมต่างๆ
- รองรับการอัพโหลดไฟล์และรูปภาพ
- สามารถดาวน์โหลดไฟล์เอกสารประกอบ

### 2. **Community** (`tbl_community`)
- จัดการลิงก์ Social Media และ Community ต่างๆ
- รองรับ Facebook, LINE, Telegram และอื่นๆ
- สร้างช่องทางการติดต่อและสร้าง Engagement

### 3. **Mission** (`tbl_mission`, `tbl_mission_logs`) ⭐ โมดูลสำคัญที่สุด
- ระบบภารกิจสำหรับให้ผู้ใช้ทำเพื่อรับคะแนน
- รองรับ 2 ประเภทภารกิจ:
  - **Share Mission:** แชร์เพื่อนเข้าระบบ (Affiliate)
  - **Deposit Mission:** ฝากเงินตามเป้าหมาย
- มีระบบติดตามความคืบหน้าแบบเรียลไทม์
- คำนวณเงื่อนไขและให้รางวัลอัตโนมัติ

### 4. **Report** (Mission Report)
- ระบบรายงานการทำภารกิจ
- แสดงสถิติการทำ Mission แบบรายวัน
- สรุปยอด Point ที่ได้รับ
- ดูประวัติการทำภารกิจที่สำเร็จ/รอดำเนินการ

### 5. **Setting** (`tbl_setting`, `tbl_setting_logs`)
- ระบบเช็คอิน/เข้าร่วมกิจกรรมรายวัน
- รับ Point จากการเข้าร่วมต่อเนื่อง
- มีระบบตรวจสอบและอนุมัติ

### 6. **Support** (`tbl_support`)
- คลังความรู้และคำถามที่พบบ่อย (FAQ)
- บทความแนะนำการใช้งาน
- รองรับ Rich Text Editor (Draft.js)

### 7. **Point** (`tbl_point`, `tbl_point_logs`, `tbl_client_point`)
- ระบบจัดการคะแนน
- แสดงรายการสินค้า/ของรางวัลที่แลกได้
- ประวัติการแลก Point
- ติดตามคะแนนคงเหลือ

---

## การเชื่อมต่อ External API

ระบบมีการเชื่อมต่อกับ External API สำหรับดึงข้อมูล:

**Base API URL:** `https://api.ruaysud.com`

### API Endpoints ที่ใช้:

1. **Deposit API** - `/players/v1/line/deposit`
   - ตรวจสอบยอดฝากเงินของผู้ใช้
   - Query: `line_id`, `line_at`, `start_date`, `end_date`
   - Response: `{ deposit: number }`

2. **Affiliate/Share API** - `/games/players/line/affiliate`
   - ตรวจสอบจำนวนผู้ที่ลงทะเบียนผ่าน Affiliate Link
   - Query: `line_id`, `line_at`
   - Response: `{ playerBets: [...], playerSummaries: [...] }`

---

## โครงสร้างฐานข้อมูล (MongoDB Collections)

### Core Collections:
- `tbl_users` - ข้อมูลผู้ดูแลระบบ
- `tbl_client` - ข้อมูลผู้ใช้ LINE
- `tbl_client_point` - คะแนนปัจจุบันของผู้ใช้แต่ละคน

### Content Collections:
- `tbl_online_marketings` - เนื้อหาการตลาด
- `tbl_community` - ลิงก์ Social Media
- `tbl_support` - บทความช่วยเหลือ

### Mission & Point System:
- `tbl_mission` - ภารกิจทั้งหมด
- `tbl_mission_logs` - บันทึกการทำภารกิจ
- `tbl_point` - รายการของรางวัล
- `tbl_point_logs` - ประวัติการเพิ่มลด Point

### Setting System:
- `tbl_setting` - กิจกรรมเช็คอิน
- `tbl_setting_logs` - บันทึกการเช็คอิน

---

## Flow การทำงานหลัก

```
1. ผู้ใช้เข้าระบบผ่าน LINE LIFF
   ↓
2. ตรวจสอบ Profile และสร้าง/ดึงข้อมูลจาก tbl_client
   ↓
3. ผู้ใช้เลือกดู Mission ที่พร้อมใช้งาน
   ↓
4. เข้าร่วม Mission (สร้าง log ใน tbl_mission_logs)
   ↓
5. ระบบติดตามความคืบหน้า (เรียก External API ทุก 30 วินาที)
   ↓
6. เมื่อเสร็จสมบูรณ์ 100% → กดรับ Point
   ↓
7. ระบบบันทึก:
   - tbl_mission_logs (status: complete)
   - tbl_client_point (เพิ่ม point)
   - tbl_point_logs (บันทึกประวัติ)
   ↓
8. ผู้ใช้นำ Point ไปแลกของรางวัล
```

---

## คุณสมบัติเด่น

### 1. Real-time Mission Tracking
- ใช้ React Query เพื่อ auto-refetch ทุก 30 วินาที
- แสดงความคืบหน้าแบบ Progress Bar
- Countdown Timer แสดงเวลาที่เหลือ

### 2. Session-based Mission System
- ผู้ใช้สามารถทำได้เพียง 1 Mission ต่อ Session
- ป้องกันการทำหลาย Mission พร้อมกัน

### 3. LINE Integration
- เข้าสู่ระบบผ่าน LINE Profile
- ส่ง Flex Message แจ้งเตือน
- Webhook สำหรับรับข้อความ

### 4. Admin Dashboard
- จัดการเนื้อหาทั้งหมด CRUD
- Upload รูปภาพและไฟล์
- ตั้งค่า Mission (เงื่อนไข, รางวัล, ระยะเวลา)
- ดูรายงานและสถิติ

---

## Technology Stack สรุป

### Frontend:
- **Next.js 14** (App Router)
- **React 18**
- **TypeScript**
- **Material-UI (MUI) v5**
- **TailwindCSS**

### State Management:
- **Zustand** - Global State
- **TanStack React Query** - Server State & Caching

### Backend:
- **Next.js API Routes**
- **MongoDB** with Mongoose
- **JWT Authentication**

### LINE Platform:
- **LIFF SDK** v2.23.2
- **LINE Messaging API**

### Utilities:
- **date-fns** - Date manipulation
- **bcrypt** - Password hashing
- **Draft.js** - Rich text editor
- **React Dropzone** - File uploads

---

## Environment Variables

```env
MONGODB_URI - MongoDB connection string
NEXT_PUBLIC_LIFF_ID - LINE LIFF Application ID
LINE_ACCESS_TOKEN - LINE Messaging API token
LINE_SECRET - LINE Channel Secret
NEXT_PUBLIC_BASE_API_URL - External API URL
NEXT_PUBLIC_BASE_API_KEY - External API Key
```

---

## การ Deploy

- Production URL: `https://crm-aff-2dcsx.ondigitalocean.app`
- Platform: DigitalOcean
- Database: MongoDB Atlas
- Timezone: Asia/Bangkok

---

## เอกสารเพิ่มเติม

อ่านรายละเอียดการทำงานของแต่ละโมดูลได้ที่:

1. [01-ONLINE-MARKETING.md](./01-ONLINE-MARKETING.md)
2. [02-COMMUNITY.md](./02-COMMUNITY.md)
3. [03-MISSION.md](./03-MISSION.md) ⭐ **สำคัญที่สุด**
4. [04-REPORT.md](./04-REPORT.md)
5. [05-SETTING.md](./05-SETTING.md)
6. [06-SUPPORT.md](./06-SUPPORT.md)
7. [07-POINT.md](./07-POINT.md)

---

**Last Updated:** 2025-11-03
**Version:** 2.0.0
