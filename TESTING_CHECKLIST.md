# LT-ATGAME Testing Checklist

## สารบัญ (Table of Contents)

1. [Authentication & User Management](#1-authentication--user-management)
2. [Mission System](#2-mission-system)
3. [Affiliate/Commission System](#3-affiliatecommission-system)
4. [Point & Reward System](#4-point--reward-system)
5. [Client Management](#5-client-management)
6. [Campaign System](#6-campaign-system)
7. [Marketing Content System](#7-marketing-content-system)
8. [Community System](#8-community-system)
9. [Report & Analytics System](#9-report--analytics-system)
10. [Configuration & Settings System](#10-configuration--settings-system)
11. [LINE Integration (LIFF & Bot)](#11-line-integration-liff--bot)
12. [API Endpoints Testing](#12-api-endpoints-testing)
13. [UI/UX Testing](#13-uiux-testing)
14. [Performance Testing](#14-performance-testing)
15. [Security Testing](#15-security-testing)
16. [Mobile Responsiveness](#16-mobile-responsiveness)

---

## 1. Authentication & User Management

### 1.1 Admin Login (Dashboard)

| # | Test Case | Expected Result | Status |
|---|-----------|-----------------|--------|
| 1.1.1 | Login ด้วย email และ password ที่ถูกต้อง | เข้าสู่ระบบสำเร็จ, redirect ไป dashboard | ⬜ |
| 1.1.2 | Login ด้วย email ที่ไม่มีในระบบ | แสดง error "ไม่พบผู้ใช้" | ⬜ |
| 1.1.3 | Login ด้วย password ที่ผิด | แสดง error "รหัสผ่านไม่ถูกต้อง" | ⬜ |
| 1.1.4 | Login โดยไม่กรอก email | แสดง validation error | ⬜ |
| 1.1.5 | Login โดยไม่กรอก password | แสดง validation error | ⬜ |
| 1.1.6 | Login ด้วย email format ไม่ถูกต้อง | แสดง validation error | ⬜ |
| 1.1.7 | ตรวจสอบ JWT token หลัง login สำเร็จ | Token ถูกสร้างและเก็บใน cookie | ⬜ |
| 1.1.8 | Remember me functionality (ถ้ามี) | Session ถูก maintain หลัง close browser | ⬜ |

### 1.2 Admin Registration

| # | Test Case | Expected Result | Status |
|---|-----------|-----------------|--------|
| 1.2.1 | Register ด้วยข้อมูลที่ถูกต้องครบถ้วน | สร้าง account สำเร็จ | ⬜ |
| 1.2.2 | Register ด้วย email ที่มีอยู่แล้ว | แสดง error "email ซ้ำ" | ⬜ |
| 1.2.3 | Register โดยไม่กรอก required fields | แสดง validation error ทุก field | ⬜ |
| 1.2.4 | ตรวจสอบ password hashing | Password ถูก hash ด้วย bcrypt ก่อน save | ⬜ |
| 1.2.5 | ตรวจสอบ default role | User ใหม่มี role = "guest" หรือตามที่กำหนด | ⬜ |

### 1.3 Token Validation & Session

| # | Test Case | Expected Result | Status |
|---|-----------|-----------------|--------|
| 1.3.1 | Access protected route ด้วย valid token | เข้าถึงได้ปกติ | ⬜ |
| 1.3.2 | Access protected route ด้วย expired token | Redirect ไป login | ⬜ |
| 1.3.3 | Access protected route โดยไม่มี token | Redirect ไป login | ⬜ |
| 1.3.4 | Access protected route ด้วย invalid/malformed token | Redirect ไป login | ⬜ |
| 1.3.5 | Token refresh mechanism (ถ้ามี) | Token ถูก refresh ก่อน expire | ⬜ |

### 1.4 Logout

| # | Test Case | Expected Result | Status |
|---|-----------|-----------------|--------|
| 1.4.1 | Logout จาก dashboard | ลบ token และ redirect ไป login | ⬜ |
| 1.4.2 | หลัง logout กด back button | ไม่สามารถกลับไป dashboard ได้ | ⬜ |
| 1.4.3 | Logout แล้วใช้ URL เดิมเข้า dashboard | Redirect ไป login | ⬜ |

---

## 2. Mission System

### 2.1 Mission Management (Admin)

| # | Test Case | Expected Result | Status |
|---|-----------|-----------------|--------|
| 2.1.1 | ดูรายการ Mission ทั้งหมด | แสดง list ของ missions พร้อม pagination | ⬜ |
| 2.1.2 | สร้าง Mission ใหม่ (type: share) | Mission ถูกสร้างสำเร็จ | ⬜ |
| 2.1.3 | สร้าง Mission ใหม่ (type: deposit) | Mission ถูกสร้างสำเร็จ | ⬜ |
| 2.1.4 | สร้าง Mission โดยไม่กรอก title | แสดง validation error | ⬜ |
| 2.1.5 | สร้าง Mission โดยไม่กรอก point | แสดง validation error | ⬜ |
| 2.1.6 | สร้าง Mission ด้วย end_date ก่อน start_date | แสดง validation error | ⬜ |
| 2.1.7 | Upload thumbnail สำหรับ Mission | รูปถูก upload และแสดงผลถูกต้อง | ⬜ |
| 2.1.8 | แก้ไข Mission ที่มีอยู่ | ข้อมูลถูก update สำเร็จ | ⬜ |
| 2.1.9 | ลบ Mission | Mission ถูกลบออกจากระบบ | ⬜ |
| 2.1.10 | เปลี่ยน status Mission (publish/draft/inactive) | Status ถูกเปลี่ยนสำเร็จ | ⬜ |
| 2.1.11 | กรอก condition สำหรับ deposit mission | Condition ถูกบันทึกถูกต้อง | ⬜ |
| 2.1.12 | ตั้งค่า session สำหรับ Mission | Session ถูกบันทึกถูกต้อง | ⬜ |

### 2.2 Mission Display (LIFF - Player)

| # | Test Case | Expected Result | Status |
|---|-----------|-----------------|--------|
| 2.2.1 | ดู Mission ที่มี status = publish | แสดงเฉพาะ mission ที่ publish | ⬜ |
| 2.2.2 | ไม่แสดง Mission ที่ status = draft | Mission draft ไม่แสดง | ⬜ |
| 2.2.3 | ดู Mission ที่ยังไม่หมดอายุ | แสดงเฉพาะ mission ที่ยังไม่หมด date | ⬜ |
| 2.2.4 | ดู Mission detail | แสดงรายละเอียดครบถ้วน | ⬜ |
| 2.2.5 | Filter missions by status (available/active/completed) | แสดงตามสถานะที่เลือก | ⬜ |

### 2.3 Mission Participation (Share Type)

| # | Test Case | Expected Result | Status |
|---|-----------|-----------------|--------|
| 2.3.1 | เข้าร่วม share mission | สร้าง mission_log สำเร็จ | ⬜ |
| 2.3.2 | Share affiliate link | Affiliate link ถูก copy/share | ⬜ |
| 2.3.3 | ตรวจสอบ referral เมื่อมีคน register ผ่าน link | นับ referral ถูกต้อง | ⬜ |
| 2.3.4 | ทำ mission สำเร็จตาม condition | Status เปลี่ยนเป็น completed | ⬜ |
| 2.3.5 | รับ point reward หลังทำ mission สำเร็จ | Point ถูกเพิ่มให้ user | ⬜ |

### 2.4 Mission Participation (Deposit Type)

| # | Test Case | Expected Result | Status |
|---|-----------|-----------------|--------|
| 2.4.1 | เข้าร่วม deposit mission | สร้าง mission_log สำเร็จ | ⬜ |
| 2.4.2 | ตรวจสอบยอด deposit จาก external API | ดึงข้อมูล deposit ได้ถูกต้อง | ⬜ |
| 2.4.3 | ทำ mission สำเร็จเมื่อ deposit ถึง condition | Status เปลี่ยนเป็น completed | ⬜ |
| 2.4.4 | รับ point reward หลังทำ mission สำเร็จ | Point ถูกเพิ่มให้ user | ⬜ |

### 2.5 Mission Logs

| # | Test Case | Expected Result | Status |
|---|-----------|-----------------|--------|
| 2.5.1 | ดูประวัติการเข้าร่วม mission ของ user | แสดง logs ถูกต้อง | ⬜ |
| 2.5.2 | ตรวจสอบ mission_id reference ใน logs | Reference ถูกต้อง | ⬜ |
| 2.5.3 | Admin ดู mission logs ทั้งหมด | แสดง logs ของทุก user | ⬜ |

---

## 3. Affiliate/Commission System

### 3.1 Affiliate Link & Code

| # | Test Case | Expected Result | Status |
|---|-----------|-----------------|--------|
| 3.1.1 | ดู affiliate code ของ user | แสดง code ถูกต้อง | ⬜ |
| 3.1.2 | Copy affiliate link | Link ถูก copy ไป clipboard | ⬜ |
| 3.1.3 | Share affiliate link ผ่าน LINE | Link ถูก share สำเร็จ | ⬜ |
| 3.1.4 | Affiliate URL format ถูกต้อง | URL ประกอบด้วย aff code ที่ถูกต้อง | ⬜ |

### 3.2 Commission Tracking

| # | Test Case | Expected Result | Status |
|---|-----------|-----------------|--------|
| 3.2.1 | ดึง commission data จาก external API | ข้อมูลถูก fetch สำเร็จ | ⬜ |
| 3.2.2 | แสดง commission วันนี้ | ยอดถูกต้องตาม API | ⬜ |
| 3.2.3 | แสดง commission เดือนนี้ | ยอดถูกต้องตาม API | ⬜ |
| 3.2.4 | แสดง commission รวมทั้งหมด | ยอดถูกต้องตาม API | ⬜ |
| 3.2.5 | Commission breakdown by player | แสดงรายละเอียดต่อ player | ⬜ |
| 3.2.6 | ตรวจสอบการคำนวณ parent/child commission | คำนวณถูกต้อง | ⬜ |

### 3.3 Player Bet Data

| # | Test Case | Expected Result | Status |
|---|-----------|-----------------|--------|
| 3.3.1 | ดึงข้อมูล bet ของ player | ข้อมูลถูก fetch สำเร็จ | ⬜ |
| 3.3.2 | แสดงสรุป bet ต่อวัน | ยอดถูกต้อง | ⬜ |
| 3.3.3 | แสดง referred players list | รายชื่อถูกต้อง | ⬜ |

### 3.4 API Error Handling

| # | Test Case | Expected Result | Status |
|---|-----------|-----------------|--------|
| 3.4.1 | External API timeout | แสดง error message เหมาะสม | ⬜ |
| 3.4.2 | External API return error | Handle error gracefully | ⬜ |
| 3.4.3 | Invalid API key | แสดง error และ log | ⬜ |

---

## 4. Point & Reward System

### 4.1 Point Catalog Management (Admin)

| # | Test Case | Expected Result | Status |
|---|-----------|-----------------|--------|
| 4.1.1 | ดูรายการ rewards ทั้งหมด | แสดง list ของ rewards | ⬜ |
| 4.1.2 | สร้าง reward ใหม่ | Reward ถูกสร้างสำเร็จ | ⬜ |
| 4.1.3 | สร้าง reward โดยไม่กรอก title | แสดง validation error | ⬜ |
| 4.1.4 | สร้าง reward โดยไม่กรอก point | แสดง validation error | ⬜ |
| 4.1.5 | กรอก point เป็นค่าติดลบ | แสดง validation error | ⬜ |
| 4.1.6 | Upload thumbnail สำหรับ reward | รูปถูก upload สำเร็จ | ⬜ |
| 4.1.7 | แก้ไข reward | ข้อมูลถูก update สำเร็จ | ⬜ |
| 4.1.8 | ลบ reward | Reward ถูกลบสำเร็จ | ⬜ |
| 4.1.9 | เปลี่ยน status (publish/draft) | Status ถูกเปลี่ยนสำเร็จ | ⬜ |

### 4.2 Point Display (LIFF - Player)

| # | Test Case | Expected Result | Status |
|---|-----------|-----------------|--------|
| 4.2.1 | ดู point balance ปัจจุบัน | แสดงยอดถูกต้อง | ⬜ |
| 4.2.2 | ดู reward catalog | แสดงเฉพาะ rewards ที่ publish | ⬜ |
| 4.2.3 | ดู reward detail | แสดงรายละเอียดครบถ้วน | ⬜ |
| 4.2.4 | ไม่แสดง reward ที่ status = draft | Rewards draft ไม่แสดง | ⬜ |

### 4.3 Point Redemption

| # | Test Case | Expected Result | Status |
|---|-----------|-----------------|--------|
| 4.3.1 | Redeem reward ด้วย point เพียงพอ | สร้าง redemption request สำเร็จ | ⬜ |
| 4.3.2 | Redeem reward ด้วย point ไม่เพียงพอ | แสดง error "point ไม่พอ" | ⬜ |
| 4.3.3 | ตรวจสอบ point ถูกหักหลัง redeem | Point balance ลดลงถูกต้อง | ⬜ |
| 4.3.4 | ดูประวัติการ redeem | แสดง redemption history | ⬜ |

### 4.4 Redemption Status Management (Admin)

| # | Test Case | Expected Result | Status |
|---|-----------|-----------------|--------|
| 4.4.1 | ดู pending redemption requests | แสดง list ของ pending requests | ⬜ |
| 4.4.2 | Approve redemption request | Status เปลี่ยนเป็น approved | ⬜ |
| 4.4.3 | Reject redemption request | Status เปลี่ยนเป็น rejected | ⬜ |
| 4.4.4 | ส่ง LINE notification เมื่อ approve | Flex message ถูกส่งให้ user | ⬜ |
| 4.4.5 | คืน point เมื่อ reject (ถ้ามี) | Point ถูกคืนให้ user | ⬜ |

### 4.5 Point Logs

| # | Test Case | Expected Result | Status |
|---|-----------|-----------------|--------|
| 4.5.1 | บันทึก log เมื่อได้รับ point | Log ถูกสร้างถูกต้อง | ⬜ |
| 4.5.2 | บันทึก log เมื่อใช้ point | Log ถูกสร้างถูกต้อง | ⬜ |
| 4.5.3 | ดู point transaction history | แสดงประวัติครบถ้วน | ⬜ |

---

## 5. Client Management

### 5.1 Client Registration (LIFF)

| # | Test Case | Expected Result | Status |
|---|-----------|-----------------|--------|
| 5.1.1 | Register client ใหม่ผ่าน LIFF | สร้าง client record สำเร็จ | ⬜ |
| 5.1.2 | บันทึก LINE profile data | displayName, pictureUrl, statusMessage ถูกบันทึก | ⬜ |
| 5.1.3 | กรอกเบอร์โทรศัพท์ | Tel ถูกบันทึกและ validate format | ⬜ |
| 5.1.4 | กรอกเบอร์โทรศัพท์ format ผิด | แสดง validation error | ⬜ |
| 5.1.5 | Register ด้วย LINE userId ที่มีอยู่แล้ว | Update record แทนสร้างใหม่ (หรือ error) | ⬜ |

### 5.2 Client Profile (LIFF)

| # | Test Case | Expected Result | Status |
|---|-----------|-----------------|--------|
| 5.2.1 | ดู profile ของตัวเอง | แสดงข้อมูลถูกต้อง | ⬜ |
| 5.2.2 | แก้ไขเบอร์โทรศัพท์ | Tel ถูก update สำเร็จ | ⬜ |
| 5.2.3 | แสดง LINE profile picture | รูปแสดงถูกต้อง | ⬜ |
| 5.2.4 | แสดง affiliate code | Code แสดงถูกต้อง | ⬜ |

### 5.3 Client Management (Admin)

| # | Test Case | Expected Result | Status |
|---|-----------|-----------------|--------|
| 5.3.1 | ดูรายการ clients ทั้งหมด | แสดง list พร้อม pagination | ⬜ |
| 5.3.2 | Search clients by name | แสดงผลลัพธ์ถูกต้อง | ⬜ |
| 5.3.3 | Search clients by tel | แสดงผลลัพธ์ถูกต้อง | ⬜ |
| 5.3.4 | Filter clients | แสดงตาม filter ที่เลือก | ⬜ |
| 5.3.5 | ดู client detail | แสดงข้อมูลครบถ้วน | ⬜ |
| 5.3.6 | ดู client points | แสดง point balance ถูกต้อง | ⬜ |
| 5.3.7 | ลบ client | Client ถูกลบสำเร็จ | ⬜ |
| 5.3.8 | Export client data | Download ไฟล์สำเร็จ | ⬜ |

### 5.4 Client Point Balance

| # | Test Case | Expected Result | Status |
|---|-----------|-----------------|--------|
| 5.4.1 | สร้าง client_point record สำหรับ client ใหม่ | Record ถูกสร้างด้วย point = 0 | ⬜ |
| 5.4.2 | Update point balance เมื่อได้รับ point | Balance ถูก update ถูกต้อง | ⬜ |
| 5.4.3 | Update point balance เมื่อใช้ point | Balance ถูก update ถูกต้อง | ⬜ |
| 5.4.4 | ตรวจสอบ point ไม่ติดลบ | ไม่สามารถหักจนติดลบได้ | ⬜ |

---

## 6. Campaign System

### 6.1 Campaign Management (Admin)

| # | Test Case | Expected Result | Status |
|---|-----------|-----------------|--------|
| 6.1.1 | ดูรายการ campaigns ทั้งหมด | แสดง list ของ campaigns | ⬜ |
| 6.1.2 | สร้าง campaign ใหม่ | Campaign ถูกสร้างสำเร็จ | ⬜ |
| 6.1.3 | สร้าง campaign โดยไม่กรอก title | แสดง validation error | ⬜ |
| 6.1.4 | ตั้ง target และ volume | ค่าถูกบันทึกถูกต้อง | ⬜ |
| 6.1.5 | Upload thumbnail สำหรับ campaign | รูปถูก upload สำเร็จ | ⬜ |
| 6.1.6 | แก้ไข campaign | ข้อมูลถูก update สำเร็จ | ⬜ |
| 6.1.7 | ลบ campaign | Campaign ถูกลบสำเร็จ | ⬜ |
| 6.1.8 | เปลี่ยน status (publish/draft/inactive) | Status ถูกเปลี่ยนสำเร็จ | ⬜ |

### 6.2 Campaign Display (LIFF)

| # | Test Case | Expected Result | Status |
|---|-----------|-----------------|--------|
| 6.2.1 | ดู campaigns ที่ publish | แสดงเฉพาะ campaigns ที่ publish | ⬜ |
| 6.2.2 | ดู campaign detail | แสดงรายละเอียดครบถ้วน | ⬜ |
| 6.2.3 | ไม่แสดง campaign ที่ draft | Campaign draft ไม่แสดง | ⬜ |

### 6.3 Campaign Participation

| # | Test Case | Expected Result | Status |
|---|-----------|-----------------|--------|
| 6.3.1 | Click เข้าร่วม campaign | บันทึก click count | ⬜ |
| 6.3.2 | Track active user ใน campaign | บันทึก active status | ⬜ |
| 6.3.3 | บันทึก user participation ใน users array | ข้อมูลถูกบันทึกใน array | ⬜ |
| 6.3.4 | ส่ง LINE notification สำหรับ campaign | Flex message ถูกส่งสำเร็จ | ⬜ |

### 6.4 Campaign Metrics

| # | Test Case | Expected Result | Status |
|---|-----------|-----------------|--------|
| 6.4.1 | นับ click count ถูกต้อง | จำนวน click ตรงกับ actual | ⬜ |
| 6.4.2 | นับ active participants ถูกต้อง | จำนวน active ตรงกับ actual | ⬜ |
| 6.4.3 | แสดง progress ต่อ target | แสดง % ถูกต้อง | ⬜ |

---

## 7. Marketing Content System

### 7.1 Marketing Content Management (Admin)

| # | Test Case | Expected Result | Status |
|---|-----------|-----------------|--------|
| 7.1.1 | ดูรายการ marketing content ทั้งหมด | แสดง list ของ contents | ⬜ |
| 7.1.2 | สร้าง marketing content ใหม่ | Content ถูกสร้างสำเร็จ | ⬜ |
| 7.1.3 | กรอก title, excerpt, detail | ข้อมูลถูกบันทึกครบถ้วน | ⬜ |
| 7.1.4 | Upload thumbnail | รูปถูก upload สำเร็จ | ⬜ |
| 7.1.5 | ใช้ WYSIWYG editor สร้าง detail | HTML content ถูกบันทึก | ⬜ |
| 7.1.6 | แก้ไข content | ข้อมูลถูก update สำเร็จ | ⬜ |
| 7.1.7 | ลบ content | Content ถูกลบสำเร็จ | ⬜ |
| 7.1.8 | เปลี่ยน status (publish/draft) | Status ถูกเปลี่ยนสำเร็จ | ⬜ |

### 7.2 Marketing Content Display (LIFF)

| # | Test Case | Expected Result | Status |
|---|-----------|-----------------|--------|
| 7.2.1 | ดู marketing content ที่ publish | แสดงเฉพาะ content ที่ publish | ⬜ |
| 7.2.2 | ดู content detail | แสดง HTML content ถูกต้อง | ⬜ |
| 7.2.3 | แสดง thumbnail | รูปแสดงถูกต้อง | ⬜ |
| 7.2.4 | ไม่แสดง content ที่ draft | Content draft ไม่แสดง | ⬜ |

---

## 8. Community System

### 8.1 Community Management (Admin)

| # | Test Case | Expected Result | Status |
|---|-----------|-----------------|--------|
| 8.1.1 | ดูรายการ community posts ทั้งหมด | แสดง list ของ posts | ⬜ |
| 8.1.2 | ลบ community post | Post ถูกลบสำเร็จ | ⬜ |
| 8.1.3 | Moderate content | Content ถูก manage ได้ | ⬜ |

### 8.2 Community Features (LIFF)

| # | Test Case | Expected Result | Status |
|---|-----------|-----------------|--------|
| 8.2.1 | สร้าง community post/link | Post ถูกสร้างสำเร็จ | ⬜ |
| 8.2.2 | ดู community posts | แสดง posts ถูกต้อง | ⬜ |
| 8.2.3 | Share link ใน community | Link ถูกบันทึกสำเร็จ | ⬜ |
| 8.2.4 | ดู posts ของ user อื่น | แสดง posts ถูกต้อง | ⬜ |

---

## 9. Report & Analytics System

### 9.1 Mission Reports

| # | Test Case | Expected Result | Status |
|---|-----------|-----------------|--------|
| 9.1.1 | ดู mission statistics | แสดงสถิติถูกต้อง | ⬜ |
| 9.1.2 | Filter report by date range | แสดงตาม date range ที่เลือก | ⬜ |
| 9.1.3 | แสดง participation count per mission | จำนวนถูกต้อง | ⬜ |
| 9.1.4 | แสดง completion rate | % ถูกต้อง | ⬜ |
| 9.1.5 | Export mission report | Download ไฟล์สำเร็จ | ⬜ |

### 9.2 Commission Reports (LIFF)

| # | Test Case | Expected Result | Status |
|---|-----------|-----------------|--------|
| 9.2.1 | ดูรายงาน commission รายวัน | แสดงข้อมูลถูกต้อง | ⬜ |
| 9.2.2 | ดูรายงาน commission รายเดือน | แสดงข้อมูลถูกต้อง | ⬜ |
| 9.2.3 | Filter by date range | แสดงตาม date range | ⬜ |
| 9.2.4 | แสดง chart income | Chart render ถูกต้อง | ⬜ |
| 9.2.5 | Commission breakdown by player | แสดงรายละเอียดต่อ player | ⬜ |

### 9.3 Dashboard Analytics (Admin)

| # | Test Case | Expected Result | Status |
|---|-----------|-----------------|--------|
| 9.3.1 | แสดง user growth chart | Chart render ถูกต้อง | ⬜ |
| 9.3.2 | แสดง mission completion statistics | ตัวเลขถูกต้อง | ⬜ |
| 9.3.3 | แสดง point redemption trends | Chart render ถูกต้อง | ⬜ |
| 9.3.4 | แสดง summary cards | ข้อมูล summary ถูกต้อง | ⬜ |
| 9.3.5 | ApexCharts render correctly | Charts แสดงผลถูกต้อง | ⬜ |
| 9.3.6 | Recharts render correctly | Charts แสดงผลถูกต้อง | ⬜ |

### 9.4 Client Income Reports (Admin)

| # | Test Case | Expected Result | Status |
|---|-----------|-----------------|--------|
| 9.4.1 | ดูรายงาน income ของ clients | แสดงข้อมูลถูกต้อง | ⬜ |
| 9.4.2 | Filter by client | แสดงตาม client ที่เลือก | ⬜ |
| 9.4.3 | Filter by date range | แสดงตาม date range | ⬜ |
| 9.4.4 | Export income report | Download ไฟล์สำเร็จ | ⬜ |

---

## 10. Configuration & Settings System

### 10.1 Theme Configuration

| # | Test Case | Expected Result | Status |
|---|-----------|-----------------|--------|
| 10.1.1 | เปลี่ยน primary color | Color ถูกเปลี่ยนทั้งระบบ | ⬜ |
| 10.1.2 | เปลี่ยน background color | Background ถูกเปลี่ยน | ⬜ |
| 10.1.3 | Upload logo | Logo ถูก upload และแสดง | ⬜ |
| 10.1.4 | Upload favicon | Favicon ถูกเปลี่ยน | ⬜ |
| 10.1.5 | ตั้งค่า icon ต่างๆ | Icons ถูกเปลี่ยน | ⬜ |

### 10.2 UI Configuration

| # | Test Case | Expected Result | Status |
|---|-----------|-----------------|--------|
| 10.2.1 | Configure menu items | Menu แสดงตาม config | ⬜ |
| 10.2.2 | Configure menu icons | Icons แสดงถูกต้อง | ⬜ |
| 10.2.3 | Configure dashboard layout | Layout แสดงตาม config | ⬜ |
| 10.2.4 | Configure LIFF layout | Layout แสดงตาม config | ⬜ |

### 10.3 System Settings

| # | Test Case | Expected Result | Status |
|---|-----------|-----------------|--------|
| 10.3.1 | ดู system settings | แสดงการตั้งค่าปัจจุบัน | ⬜ |
| 10.3.2 | แก้ไข system settings | ค่าถูก update สำเร็จ | ⬜ |
| 10.3.3 | บันทึก setting logs | Log ถูกสร้างเมื่อมีการเปลี่ยนแปลง | ⬜ |
| 10.3.4 | ดู setting change history | แสดงประวัติการเปลี่ยนแปลง | ⬜ |

### 10.4 Config Initialization

| # | Test Case | Expected Result | Status |
|---|-----------|-----------------|--------|
| 10.4.1 | Initialize config สำหรับ new installation | Config ถูกสร้าง default | ⬜ |
| 10.4.2 | Load config on app start | Config ถูก load ถูกต้อง | ⬜ |
| 10.4.3 | Config context provides values | Components ได้รับค่า config | ⬜ |

---

## 11. LINE Integration (LIFF & Bot)

### 11.1 LIFF Initialization

| # | Test Case | Expected Result | Status |
|---|-----------|-----------------|--------|
| 11.1.1 | Initialize LIFF ใน LINE app | LIFF init สำเร็จ | ⬜ |
| 11.1.2 | Initialize LIFF ใน external browser | LIFF init สำเร็จหรือ redirect | ⬜ |
| 11.1.3 | Get LINE profile | ได้ profile data ถูกต้อง | ⬜ |
| 11.1.4 | Handle LIFF error | แสดง error message เหมาะสม | ⬜ |
| 11.1.5 | Check if running in LINE | ตรวจสอบได้ถูกต้อง | ⬜ |

### 11.2 LINE Login

| # | Test Case | Expected Result | Status |
|---|-----------|-----------------|--------|
| 11.2.1 | Login ผ่าน LIFF | ได้ accessToken และ profile | ⬜ |
| 11.2.2 | Get user ID from LIFF | ได้ userId ถูกต้อง | ⬜ |
| 11.2.3 | Get display name | ได้ displayName ถูกต้อง | ⬜ |
| 11.2.4 | Get profile picture URL | ได้ pictureUrl ถูกต้อง | ⬜ |
| 11.2.5 | Get status message | ได้ statusMessage (ถ้ามี) | ⬜ |

### 11.3 LINE Flex Messages

| # | Test Case | Expected Result | Status |
|---|-----------|-----------------|--------|
| 11.3.1 | ส่ง Flex message reward notification | Message ถูกส่งสำเร็จ | ⬜ |
| 11.3.2 | ส่ง Flex message campaign | Message ถูกส่งสำเร็จ | ⬜ |
| 11.3.3 | Flex message format ถูกต้อง | Message แสดงผลใน LINE ถูกต้อง | ⬜ |
| 11.3.4 | Handle send message error | Error ถูก handle gracefully | ⬜ |

### 11.4 LINE Webhook

| # | Test Case | Expected Result | Status |
|---|-----------|-----------------|--------|
| 11.4.1 | Receive webhook event | Event ถูกรับและ process | ⬜ |
| 11.4.2 | Verify webhook signature | Signature ถูก verify | ⬜ |
| 11.4.3 | Log webhook events | Events ถูกบันทึกใน tbl_line_log | ⬜ |
| 11.4.4 | Handle follow event | บันทึก new follower | ⬜ |
| 11.4.5 | Handle unfollow event | Update user status | ⬜ |

### 11.5 Share Target Picker

| # | Test Case | Expected Result | Status |
|---|-----------|-----------------|--------|
| 11.5.1 | Share content via Share Target Picker | Content ถูก share สำเร็จ | ⬜ |
| 11.5.2 | Share affiliate link | Link ถูก share สำเร็จ | ⬜ |

---

## 12. API Endpoints Testing

### 12.1 Authentication APIs

| # | Endpoint | Method | Test Case | Status |
|---|----------|--------|-----------|--------|
| 12.1.1 | `/api/users/login` | POST | Login with valid credentials | ⬜ |
| 12.1.2 | `/api/users/login` | POST | Login with invalid credentials | ⬜ |
| 12.1.3 | `/api/users/register` | POST | Register new user | ⬜ |
| 12.1.4 | `/api/users/register` | POST | Register duplicate email | ⬜ |
| 12.1.5 | `/api/users/validateToken` | POST | Validate valid token | ⬜ |
| 12.1.6 | `/api/users/validateToken` | POST | Validate invalid token | ⬜ |

### 12.2 CRUD APIs

| # | Endpoint | Method | Test Case | Status |
|---|----------|--------|-----------|--------|
| 12.2.1 | `/api/read/[table]` | GET | Read all records | ⬜ |
| 12.2.2 | `/api/readBy/[table]/[id]` | GET | Read by ID (exists) | ⬜ |
| 12.2.3 | `/api/readBy/[table]/[id]` | GET | Read by ID (not exists) | ⬜ |
| 12.2.4 | `/api/readKey/[table]/[key]/[value]` | GET | Read by custom field | ⬜ |
| 12.2.5 | `/api/readLimit/[slug]` | GET | Read with pagination | ⬜ |
| 12.2.6 | `/api/create` | POST | Create new record | ⬜ |
| 12.2.7 | `/api/create` | POST | Create with missing fields | ⬜ |
| 12.2.8 | `/api/update` | PATCH | Update existing record | ⬜ |
| 12.2.9 | `/api/update` | PATCH | Update non-existing record | ⬜ |
| 12.2.10 | `/api/delete` | DELETE | Delete existing record | ⬜ |
| 12.2.11 | `/api/delete` | DELETE | Delete non-existing record | ⬜ |

### 12.3 File & Data APIs

| # | Endpoint | Method | Test Case | Status |
|---|----------|--------|-----------|--------|
| 12.3.1 | `/api/upload` | POST | Upload valid image | ⬜ |
| 12.3.2 | `/api/upload` | POST | Upload invalid file type | ⬜ |
| 12.3.3 | `/api/upload` | POST | Upload file too large | ⬜ |
| 12.3.4 | `/api/download` | GET | Download data | ⬜ |

### 12.4 Business Logic APIs

| # | Endpoint | Method | Test Case | Status |
|---|----------|--------|-----------|--------|
| 12.4.1 | `/api/flexMessage` | POST | Send flex message | ⬜ |
| 12.4.2 | `/api/flexCampaign` | POST | Send campaign flex | ⬜ |
| 12.4.3 | `/api/point` | POST | Point operations | ⬜ |
| 12.4.4 | `/api/campaign/[slug]` | GET | Get campaign by slug | ⬜ |
| 12.4.5 | `/api/campaignUpdate` | PATCH | Update campaign metrics | ⬜ |
| 12.4.6 | `/api/reports/missions` | GET | Get mission reports | ⬜ |

### 12.5 Configuration APIs

| # | Endpoint | Method | Test Case | Status |
|---|----------|--------|-----------|--------|
| 12.5.1 | `/api/configs` | GET | Get config | ⬜ |
| 12.5.2 | `/api/configs/init` | POST | Initialize config | ⬜ |
| 12.5.3 | `/api/webhook` | POST | LINE webhook | ⬜ |

### 12.6 API Error Handling

| # | Test Case | Expected Result | Status |
|---|-----------|-----------------|--------|
| 12.6.1 | Request to non-existing endpoint | Return 404 | ⬜ |
| 12.6.2 | Request with invalid method | Return 405 | ⬜ |
| 12.6.3 | Request with invalid body | Return 400 | ⬜ |
| 12.6.4 | Request without authentication | Return 401 | ⬜ |
| 12.6.5 | Server error | Return 500 with message | ⬜ |

---

## 13. UI/UX Testing

### 13.1 Dashboard UI (Admin)

| # | Test Case | Expected Result | Status |
|---|-----------|-----------------|--------|
| 13.1.1 | Navigation menu ทำงานถูกต้อง | Navigate ไปหน้าต่างๆ ได้ | ⬜ |
| 13.1.2 | Sidebar collapse/expand | Sidebar ย่อ/ขยายได้ | ⬜ |
| 13.1.3 | Data tables render ถูกต้อง | Tables แสดงข้อมูลครบ | ⬜ |
| 13.1.4 | Table sorting | Sort ทำงานถูกต้อง | ⬜ |
| 13.1.5 | Table pagination | Pagination ทำงานถูกต้อง | ⬜ |
| 13.1.6 | Form validation feedback | แสดง error messages ถูกต้อง | ⬜ |
| 13.1.7 | Toast notifications | Toast แสดงและหายไปถูกต้อง | ⬜ |
| 13.1.8 | Modal dialogs | Modal เปิด/ปิดถูกต้อง | ⬜ |
| 13.1.9 | Breadcrumbs | แสดง path ถูกต้อง | ⬜ |
| 13.1.10 | Loading states | แสดง loading indicators | ⬜ |

### 13.2 LIFF UI (Mobile)

| # | Test Case | Expected Result | Status |
|---|-----------|-----------------|--------|
| 13.2.1 | Bottom navigation ทำงานถูกต้อง | Navigate ไปหน้าต่างๆ ได้ | ⬜ |
| 13.2.2 | Card components render | Cards แสดงถูกต้อง | ⬜ |
| 13.2.3 | Slider/Carousel | Slider ทำงานถูกต้อง | ⬜ |
| 13.2.4 | Pull to refresh (ถ้ามี) | Refresh ทำงาน | ⬜ |
| 13.2.5 | Infinite scroll (ถ้ามี) | Load more ทำงาน | ⬜ |
| 13.2.6 | Image loading | รูปแสดงถูกต้อง | ⬜ |
| 13.2.7 | Skeleton loading | แสดง skeleton ขณะ load | ⬜ |
| 13.2.8 | Error states | แสดง error UI เหมาะสม | ⬜ |
| 13.2.9 | Empty states | แสดง empty UI เหมาะสม | ⬜ |

### 13.3 Forms & Inputs

| # | Test Case | Expected Result | Status |
|---|-----------|-----------------|--------|
| 13.3.1 | Text input | พิมพ์และแสดงผลถูกต้อง | ⬜ |
| 13.3.2 | Number input | รับเฉพาะตัวเลข | ⬜ |
| 13.3.3 | Date picker | เลือกวันที่ได้ถูกต้อง | ⬜ |
| 13.3.4 | File upload (Dropzone) | Upload ไฟล์ได้ | ⬜ |
| 13.3.5 | Select/Dropdown | เลือก options ได้ | ⬜ |
| 13.3.6 | Checkbox | Check/uncheck ได้ | ⬜ |
| 13.3.7 | Radio button | Select ได้ | ⬜ |
| 13.3.8 | WYSIWYG editor | Edit rich text ได้ | ⬜ |
| 13.3.9 | Color picker | เลือกสีได้ | ⬜ |
| 13.3.10 | Required field validation | แสดง error เมื่อไม่กรอก | ⬜ |

### 13.4 Charts & Visualizations

| # | Test Case | Expected Result | Status |
|---|-----------|-----------------|--------|
| 13.4.1 | ApexCharts render | Charts แสดงถูกต้อง | ⬜ |
| 13.4.2 | Recharts render | Charts แสดงถูกต้อง | ⬜ |
| 13.4.3 | Chart tooltips | Tooltips แสดงข้อมูลถูกต้อง | ⬜ |
| 13.4.4 | Chart legends | Legends แสดงถูกต้อง | ⬜ |
| 13.4.5 | Chart responsive | Charts ปรับขนาดตาม viewport | ⬜ |
| 13.4.6 | Chart with no data | แสดง empty state | ⬜ |

---

## 14. Performance Testing

### 14.1 Page Load Performance

| # | Test Case | Expected Result | Status |
|---|-----------|-----------------|--------|
| 14.1.1 | Dashboard page load time | < 3 seconds | ⬜ |
| 14.1.2 | LIFF app load time | < 2 seconds | ⬜ |
| 14.1.3 | List pages with pagination | < 2 seconds per page | ⬜ |
| 14.1.4 | Detail pages load time | < 2 seconds | ⬜ |
| 14.1.5 | Initial LIFF initialization | < 3 seconds | ⬜ |

### 14.2 API Response Time

| # | Test Case | Expected Result | Status |
|---|-----------|-----------------|--------|
| 14.2.1 | Read API response time | < 500ms | ⬜ |
| 14.2.2 | Create API response time | < 1000ms | ⬜ |
| 14.2.3 | Update API response time | < 1000ms | ⬜ |
| 14.2.4 | Delete API response time | < 500ms | ⬜ |
| 14.2.5 | External API (commission) response | < 3000ms | ⬜ |

### 14.3 Database Performance

| # | Test Case | Expected Result | Status |
|---|-----------|-----------------|--------|
| 14.3.1 | Query with 1000+ records | < 1 second | ⬜ |
| 14.3.2 | Aggregation queries | < 2 seconds | ⬜ |
| 14.3.3 | Connection pool handling | No connection errors | ⬜ |
| 14.3.4 | Concurrent requests | Handle 50+ concurrent | ⬜ |

### 14.4 Image & Asset Loading

| # | Test Case | Expected Result | Status |
|---|-----------|-----------------|--------|
| 14.4.1 | Image lazy loading | Images load on viewport | ⬜ |
| 14.4.2 | Image optimization | Images optimized for web | ⬜ |
| 14.4.3 | Firebase storage access | < 2 seconds | ⬜ |

---

## 15. Security Testing

### 15.1 Authentication Security

| # | Test Case | Expected Result | Status |
|---|-----------|-----------------|--------|
| 15.1.1 | Password hashing | Passwords hashed with bcrypt | ⬜ |
| 15.1.2 | JWT token expiration | Token expires correctly | ⬜ |
| 15.1.3 | Token stored in httpOnly cookie | Cookie is httpOnly | ⬜ |
| 15.1.4 | Brute force protection | Rate limiting ทำงาน | ⬜ |
| 15.1.5 | Session hijacking prevention | Token tied to session | ⬜ |

### 15.2 Input Validation & Sanitization

| # | Test Case | Expected Result | Status |
|---|-----------|-----------------|--------|
| 15.2.1 | SQL/NoSQL injection prevention | Queries are parameterized | ⬜ |
| 15.2.2 | XSS prevention | HTML is sanitized | ⬜ |
| 15.2.3 | CSRF protection | CSRF tokens validated | ⬜ |
| 15.2.4 | File upload validation | Only allowed types accepted | ⬜ |
| 15.2.5 | Input length limits | Max length enforced | ⬜ |

### 15.3 API Security

| # | Test Case | Expected Result | Status |
|---|-----------|-----------------|--------|
| 15.3.1 | Protected endpoints require auth | 401 without token | ⬜ |
| 15.3.2 | Role-based access control | Admin-only routes protected | ⬜ |
| 15.3.3 | API rate limiting | Requests limited per IP | ⬜ |
| 15.3.4 | CORS configuration | Only allowed origins | ⬜ |
| 15.3.5 | Sensitive data in response | No passwords/tokens leaked | ⬜ |

### 15.4 LINE Security

| # | Test Case | Expected Result | Status |
|---|-----------|-----------------|--------|
| 15.4.1 | Webhook signature verification | Invalid signatures rejected | ⬜ |
| 15.4.2 | LIFF ID verification | Only valid LIFF IDs accepted | ⬜ |
| 15.4.3 | LINE access token security | Token stored securely | ⬜ |

### 15.5 Data Protection

| # | Test Case | Expected Result | Status |
|---|-----------|-----------------|--------|
| 15.5.1 | Sensitive data encryption | PII encrypted at rest | ⬜ |
| 15.5.2 | Database access control | DB credentials secure | ⬜ |
| 15.5.3 | Environment variables | .env not exposed | ⬜ |
| 15.5.4 | Error messages | No sensitive info in errors | ⬜ |

---

## 16. Mobile Responsiveness

### 16.1 LIFF App Responsiveness

| # | Test Case | Expected Result | Status |
|---|-----------|-----------------|--------|
| 16.1.1 | iPhone SE (320px) | UI แสดงถูกต้อง | ⬜ |
| 16.1.2 | iPhone 12 (390px) | UI แสดงถูกต้อง | ⬜ |
| 16.1.3 | iPhone 12 Pro Max (428px) | UI แสดงถูกต้อง | ⬜ |
| 16.1.4 | Samsung Galaxy S21 (360px) | UI แสดงถูกต้อง | ⬜ |
| 16.1.5 | iPad (768px) | UI แสดงถูกต้อง | ⬜ |
| 16.1.6 | Landscape orientation | UI ปรับตาม orientation | ⬜ |

### 16.2 Dashboard Responsiveness

| # | Test Case | Expected Result | Status |
|---|-----------|-----------------|--------|
| 16.2.1 | Desktop (1920px) | UI แสดงถูกต้อง | ⬜ |
| 16.2.2 | Laptop (1366px) | UI แสดงถูกต้อง | ⬜ |
| 16.2.3 | Tablet (768px) | UI แสดงถูกต้อง | ⬜ |
| 16.2.4 | Mobile (375px) | UI แสดงถูกต้อง | ⬜ |

### 16.3 Component Responsiveness

| # | Test Case | Expected Result | Status |
|---|-----------|-----------------|--------|
| 16.3.1 | Tables responsive | Tables scroll horizontally | ⬜ |
| 16.3.2 | Forms responsive | Forms stack on mobile | ⬜ |
| 16.3.3 | Charts responsive | Charts resize correctly | ⬜ |
| 16.3.4 | Images responsive | Images scale correctly | ⬜ |
| 16.3.5 | Modals responsive | Modals fit viewport | ⬜ |

---

## 17. Cross-Browser Testing

### 17.1 Browser Compatibility

| # | Browser | Test Case | Status |
|---|---------|-----------|--------|
| 17.1.1 | Chrome (latest) | ทุก feature ทำงานถูกต้อง | ⬜ |
| 17.1.2 | Firefox (latest) | ทุก feature ทำงานถูกต้อง | ⬜ |
| 17.1.3 | Safari (latest) | ทุก feature ทำงานถูกต้อง | ⬜ |
| 17.1.4 | Edge (latest) | ทุก feature ทำงานถูกต้อง | ⬜ |
| 17.1.5 | LINE In-App Browser | LIFF ทำงานถูกต้อง | ⬜ |

---

## 18. Integration Testing

### 18.1 External API Integration

| # | Test Case | Expected Result | Status |
|---|-----------|-----------------|--------|
| 18.1.1 | Gaming API connection | Connect และ fetch data ได้ | ⬜ |
| 18.1.2 | Gaming API error handling | Handle API errors gracefully | ⬜ |
| 18.1.3 | Firebase Storage upload | Upload files สำเร็จ | ⬜ |
| 18.1.4 | Firebase Storage download | Download/display files ได้ | ⬜ |
| 18.1.5 | LINE Messaging API | ส่ง messages ได้ | ⬜ |

### 18.2 Database Integration

| # | Test Case | Expected Result | Status |
|---|-----------|-----------------|--------|
| 18.2.1 | MongoDB Atlas connection | Connect ได้ทุก environment | ⬜ |
| 18.2.2 | Connection reconnection | Auto-reconnect เมื่อ disconnect | ⬜ |
| 18.2.3 | Mongoose model validation | Schema validation ทำงาน | ⬜ |
| 18.2.4 | Aggregation pipelines | Aggregation queries ทำงาน | ⬜ |

---

## 19. Error Handling & Edge Cases

### 19.1 Network Errors

| # | Test Case | Expected Result | Status |
|---|-----------|-----------------|--------|
| 19.1.1 | API request timeout | แสดง error message | ⬜ |
| 19.1.2 | Network disconnection | แสดง offline indicator | ⬜ |
| 19.1.3 | Slow network (3G) | App ยังคงทำงานได้ | ⬜ |

### 19.2 Data Edge Cases

| # | Test Case | Expected Result | Status |
|---|-----------|-----------------|--------|
| 19.2.1 | Empty data lists | แสดง empty state | ⬜ |
| 19.2.2 | Very long text content | Text truncate ถูกต้อง | ⬜ |
| 19.2.3 | Special characters in input | Handle special chars | ⬜ |
| 19.2.4 | Unicode/Emoji in content | แสดงถูกต้อง | ⬜ |
| 19.2.5 | Large numbers | Format numbers ถูกต้อง | ⬜ |
| 19.2.6 | Negative numbers | Handle negative values | ⬜ |
| 19.2.7 | Date timezone handling | Dates แสดงตาม timezone | ⬜ |

### 19.3 User Action Edge Cases

| # | Test Case | Expected Result | Status |
|---|-----------|-----------------|--------|
| 19.3.1 | Double submit prevention | ป้องกัน duplicate submit | ⬜ |
| 19.3.2 | Concurrent edit conflicts | Handle concurrent edits | ⬜ |
| 19.3.3 | Browser back button | Handle navigation correctly | ⬜ |
| 19.3.4 | Page refresh during action | Data integrity maintained | ⬜ |

---

## สรุป (Summary)

### จำนวน Test Cases ทั้งหมด

| Section | จำนวน Test Cases |
|---------|-----------------|
| 1. Authentication & User Management | 22 |
| 2. Mission System | 25 |
| 3. Affiliate/Commission System | 14 |
| 4. Point & Reward System | 20 |
| 5. Client Management | 16 |
| 6. Campaign System | 15 |
| 7. Marketing Content System | 12 |
| 8. Community System | 7 |
| 9. Report & Analytics System | 18 |
| 10. Configuration & Settings System | 14 |
| 11. LINE Integration | 20 |
| 12. API Endpoints Testing | 28 |
| 13. UI/UX Testing | 33 |
| 14. Performance Testing | 14 |
| 15. Security Testing | 19 |
| 16. Mobile Responsiveness | 16 |
| 17. Cross-Browser Testing | 5 |
| 18. Integration Testing | 8 |
| 19. Error Handling & Edge Cases | 14 |
| **รวมทั้งหมด** | **320** |

---

### วิธีใช้งาน Checklist

1. **⬜** = ยังไม่ได้ทดสอบ
2. **✅** = ทดสอบผ่าน
3. **❌** = ทดสอบไม่ผ่าน
4. **🔄** = อยู่ระหว่างแก้ไข
5. **⏭️** = ข้ามการทดสอบ (พร้อมเหตุผล)

### Priority Levels

- **P0 (Critical)**: Authentication, Security, Payment-related
- **P1 (High)**: Core features (Mission, Point, Commission)
- **P2 (Medium)**: Supporting features (Campaign, Marketing)
- **P3 (Low)**: UI polish, Performance optimization

---

*สร้างโดย: Claude Code*
*วันที่: December 8, 2025*
