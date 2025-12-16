# Form Validation Analysis Report

## Executive Summary

หลังจากตรวจสอบ codebase ทั้งหมดพบว่า **ระบบขาดการ validate form อย่างมาก** ทั้งในฝั่ง Frontend และ Backend ซึ่งอาจก่อให้เกิดปัญหาด้าน Data Integrity และ Security

---

## 1. Dashboard Forms Analysis

### 1.1 Mission - DialogCreate.tsx
**Location:** `src/components/dashboard/mission/DialogCreate.tsx`

| Field | Type | Frontend Validation | Backend Validation |
|-------|------|--------------------|--------------------|
| title | text | NO | NO |
| detail | multiline | NO | NO |
| point | number | NO | NO (ไม่ตรวจสอบว่าเป็นตัวเลข) |
| thumbnail | image | NO | NO |
| startDate | date | NO | NO |
| endDate | date | NO | NO (ไม่ตรวจสอบว่า endDate > startDate) |
| type | select | NO | NO |
| condition | text | NO | NO |
| session | number | NO | NO |
| status | select | NO | NO |

**Issues Found:**
- ไม่มีการตรวจสอบ required fields
- ไม่มีการตรวจสอบความยาวของ title/detail
- ไม่มีการตรวจสอบว่า point เป็นตัวเลขบวก
- ไม่มีการตรวจสอบว่า endDate ต้องมากกว่า startDate
- ไม่มีการตรวจสอบ file type/size ของ thumbnail

---

### 1.2 Campaign - DialogCreate.tsx
**Location:** `src/components/dashboard/campaign/DialogCreate.tsx`

| Field | Type | Frontend Validation | Backend Validation |
|-------|------|--------------------|--------------------|
| thumbnail | image | NO | NO |
| title | text | NO | NO |
| description | multiline | NO | NO |
| target | select | NO | NO |

**Issues Found:**
- ไม่มีการตรวจสอบ required fields ก่อนส่ง
- ไม่มีการตรวจสอบว่าเลือก target group หรือยัง
- สามารถสร้าง campaign โดยไม่มีข้อมูลใดๆ ได้

---

### 1.3 Point - DialogCreate.tsx
**Location:** `src/components/dashboard/point/DialogCreate.tsx`

| Field | Type | Frontend Validation | Backend Validation |
|-------|------|--------------------|--------------------|
| title | text | NO | NO |
| point | number | NO | NO |
| type | select | NO | NO |
| reward | text | NO (แสดงเฉพาะเมื่อ type='credit') | NO |
| thumbnail | image | NO | NO |
| status | select | NO | NO |

**Issues Found:**
- ไม่มีการตรวจสอบว่า point เป็นตัวเลขบวก
- ไม่มีการตรวจสอบว่า reward มีค่าเมื่อ type='credit'
- ไม่มีการตรวจสอบ required fields

---

### 1.4 Community - DialogCreate.tsx
**Location:** `src/components/dashboard/community/DialogCreate.tsx`

| Field | Type | Frontend Validation | Backend Validation |
|-------|------|--------------------|--------------------|
| title | text | NO | NO |
| excerpt | multiline | NO | NO |
| category | select | NO | NO |
| thumbnail | image | NO | NO |
| status | select | NO | NO |

**Issues Found:**
- ไม่มีการตรวจสอบ required fields
- ไม่มีการตรวจสอบความยาวของ excerpt

---

### 1.5 Marketing - DialogCreate.tsx
**Location:** `src/components/dashboard/marketing/DialogCreate.tsx`

| Field | Type | Frontend Validation | Backend Validation |
|-------|------|--------------------|--------------------|
| title | text | NO | NO |
| description | multiline | NO | NO |
| thumbnail | image | NO | NO |
| status | select | NO | NO |

**Issues Found:**
- ไม่มีการตรวจสอบ required fields
- ไม่มีการ validate รูปแบบข้อมูล

---

### 1.6 Support - DialogCreate.tsx
**Location:** `src/components/dashboard/support/DialogCreate.tsx`

| Field | Type | Frontend Validation | Backend Validation |
|-------|------|--------------------|--------------------|
| title | text | NO | NO |
| description | multiline | NO | NO |
| detail | editor (rich text) | NO | NO |
| thumbnail | image | NO | NO |
| status | select | NO | NO |

**Issues Found:**
- ไม่มีการตรวจสอบ required fields
- Rich text editor อาจมีปัญหาเรื่อง XSS ถ้าไม่ sanitize

---

### 1.7 Setting - DialogCreate.tsx
**Location:** `src/components/dashboard/setting/DialogCreate.tsx`

| Field | Type | Frontend Validation | Backend Validation |
|-------|------|--------------------|--------------------|
| key | text | NO | NO |
| value | text/number | NO | NO |

**Issues Found:**
- ไม่มีการตรวจสอบ required fields
- ไม่มีการตรวจสอบ key ซ้ำ
- มีการแปลง point เป็น Number แต่ไม่ validate

---

### 1.8 Medias - DialogCreate.tsx
**Location:** `src/components/dashboard/medias/DialogCreate.tsx`

| Field | Type | Frontend Validation | Backend Validation |
|-------|------|--------------------|--------------------|
| file | image/file | PARTIAL (ตรวจสอบว่ามีไฟล์) | NO |

**Issues Found:**
- มีการตรวจสอบว่า data !== null (บางส่วน)
- ไม่มีการตรวจสอบ file type/size อย่างเข้มงวด

---

## 2. Authentication Forms Analysis

### 2.1 Login Form
**Location:** `src/views/Login.tsx`

| Field | Frontend Validation | Backend Validation |
|-------|--------------------|--------------------|
| email | NO | YES (ตรวจสอบ !email) |
| password | NO | YES (ตรวจสอบ !password) |

**Issues Found:**
- Frontend: ใช้ `noValidate` บน form ทำให้ไม่มี HTML5 validation
- Frontend: ไม่มีการตรวจสอบ email format
- Backend: มีการตรวจสอบเบื้องต้น (required fields)

---

### 2.2 Register Dialog
**Location:** `src/views/DialogRigister.tsx`

| Field | Frontend Validation | Backend Validation |
|-------|--------------------|--------------------|
| email | NO | YES (ตรวจสอบ !email) |
| password | NO | YES (ตรวจสอบ !password) |

**Issues Found:**
- Frontend: ไม่มีการตรวจสอบ email format
- Frontend: ไม่มีการตรวจสอบความแข็งแรงของ password
- Backend: มีการตรวจสอบ email ซ้ำ

---

## 3. API Routes Validation Analysis

### 3.1 POST /api/create
**Location:** `src/app/api/create/route.ts`

| Validation | Status |
|------------|--------|
| Required fields | NO |
| Data type validation | NO |
| Input sanitization | NO |
| Table name validation | NO |

**Critical Issues:**
- รับ table name โดยตรงจาก request - อาจเกิด NoSQL Injection
- ไม่มีการ validate ข้อมูลก่อน insert

---

### 3.2 PATCH /api/update
**Location:** `src/app/api/update/route.ts`

| Validation | Status |
|------------|--------|
| ObjectId validation | YES |
| Point type conversion | YES (Number()) |
| Table name validation | NO |

**Issues Found:**
- มีการ validate ObjectId
- มีการแปลง point เป็น Number
- ยังขาดการ validate ข้อมูลอื่นๆ

---

### 3.3 POST /api/users/login
**Location:** `src/app/api/users/login/route.ts`

| Validation | Status |
|------------|--------|
| Required fields (email, password) | YES |
| Email format | NO |
| Password validation | NO (ตรวจเฉพาะ bcrypt compare) |

**Issues Found:**
- มีการตรวจสอบ required fields
- ขาดการตรวจสอบ email format

---

### 3.4 POST /api/users/register
**Location:** `src/app/api/users/register/route.ts`

| Validation | Status |
|------------|--------|
| Required fields (email, password) | YES |
| Email format | NO |
| Password strength | NO |
| Duplicate email check | YES |

**Issues Found:**
- มีการตรวจสอบ required fields และ email ซ้ำ
- ขาดการตรวจสอบ email format และ password strength

---

### 3.5 PATCH /api/point
**Location:** `src/app/api/point/route.ts`

| Validation | Status |
|------------|--------|
| Tel required | YES |
| Point type validation | YES |
| Point is NaN check | YES |
| Operation validation | YES |
| Insufficient points check | YES |

**Best Practice Example:**
- API นี้มีการ validate ค่อนข้างดี
- ตรวจสอบ required fields, data types, และ business logic

---

## 4. Summary Table

| Form/API | Frontend Validation | Backend Validation | Risk Level |
|----------|--------------------|--------------------|------------|
| Mission Create | NO | NO | HIGH |
| Campaign Create | NO | NO | HIGH |
| Point Create | NO | NO | HIGH |
| Community Create | NO | NO | MEDIUM |
| Marketing Create | NO | NO | MEDIUM |
| Support Create | NO | NO | MEDIUM |
| Setting Create | NO | NO | MEDIUM |
| Medias Create | PARTIAL | NO | LOW |
| Login | NO | PARTIAL | MEDIUM |
| Register | NO | PARTIAL | MEDIUM |
| API /create | N/A | NO | CRITICAL |
| API /update | N/A | PARTIAL | MEDIUM |
| API /point | N/A | YES | LOW |

---

## 5. Recommendations

### 5.1 Frontend Validation (High Priority)
1. **ใช้ Form Library** - แนะนำใช้ `react-hook-form` + `zod` หรือ `yup` สำหรับ validation
2. **Required Fields** - เพิ่มการตรวจสอบ required fields ทุก form
3. **Data Type Validation** - ตรวจสอบ number, email format, date range
4. **User Feedback** - แสดง error message ที่ชัดเจน

### 5.2 Backend Validation (Critical)
1. **Input Sanitization** - ป้องกัน XSS และ NoSQL Injection
2. **Table Name Whitelist** - ควรมี whitelist สำหรับ table names ที่ยอมรับ
3. **Schema Validation** - ใช้ validation library เช่น `joi` หรือ `zod`
4. **Type Checking** - ตรวจสอบ data types ทุก field

### 5.3 Security Concerns
1. **SQL/NoSQL Injection** - `/api/create` รับ table name โดยตรง (Critical)
2. **XSS** - Rich text editor ใน Support ควร sanitize
3. **Password Policy** - ควรบังคับใช้ password strength rules

---

## 6. Validation Rules Suggestion

### Mission Form
```javascript
{
  title: required, minLength(3), maxLength(100),
  detail: required, minLength(10),
  point: required, number, positive,
  startDate: required, date,
  endDate: required, date, afterDate(startDate),
  type: required, oneOf(['daily', 'weekly', 'monthly']),
  status: required, oneOf(['active', 'inactive'])
}
```

### Campaign Form
```javascript
{
  title: required, minLength(3), maxLength(100),
  description: optional, maxLength(500),
  target: required,
  thumbnail: required, fileType(['image/jpeg', 'image/png']), maxSize(5MB)
}
```

### Point Form
```javascript
{
  title: required, minLength(3),
  point: required, number, positive,
  type: required, oneOf(['default', 'credit']),
  reward: requiredIf(type === 'credit'),
  status: required
}
```

### Login/Register Forms
```javascript
{
  email: required, email,
  password: required, minLength(8), hasUppercase, hasNumber, hasSpecialChar
}
```

---

## 7. Conclusion

ระบบปัจจุบันมีปัญหาด้าน validation อย่างมาก โดยเฉพาะ:
- **ฝั่ง Frontend**: แทบไม่มี validation เลย
- **ฝั่ง Backend**: มีบางส่วนแต่ไม่ครอบคลุม
- **Security Risk**: API `/create` มีความเสี่ยงสูงจาก table name injection

**ควรดำเนินการแก้ไขโดยด่วน** โดยเฉพาะ API routes ที่มีความเสี่ยงด้าน security
