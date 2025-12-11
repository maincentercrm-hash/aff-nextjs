# Online Marketing Module

## ภาพรวม

โมดูล Online Marketing เป็นระบบจัดการเนื้อหาการตลาด ข่าวสาร โปรโมชั่น และกิจกรรมต่างๆ ที่ต้องการสื่อสารไปยังผู้ใช้งาน

---

## Collection: `tbl_online_marketings`

### Schema Structure

```typescript
{
  _id: ObjectId
  title: string           // หัวข้อ
  excerpt: string         // คำโปรย/สรุปสั้นๆ
  detail: string          // รายละเอียดเต็ม
  thumbnail: string       // URL รูปภาพปก
  file_download: string   // URL ไฟล์ดาวน์โหลด (optional)
  status: string          // 'publish' | 'pending'
  createDate: Date        // วันที่สร้าง
}
```

---

## ไฟล์และที่ตั้ง

### Dashboard (Admin)
- **Page:** `src/app/(dashboard)/dashboard/marketing/page.tsx`
- **Main Component:** `src/components/dashboard/marketing/MainMarketing.tsx`
- **Table Component:** `src/components/dashboard/marketing/TableMarketing.tsx`
- **Dialog Components:**
  - `DialogCreate.tsx` - สร้างข้อมูลใหม่
  - `DialogEdit.tsx` - แก้ไขข้อมูล
  - `DialogDelete.tsx` - ลบข้อมูล
- **File Upload:** `fileUpload.tsx`

### LIFF (User)
- **Page:** `src/app/(liff)/liff/marketing/page.tsx`
- **Detail Page:** `src/app/(liff)/liff/marketing/[slug]/page.tsx`

### Model
- **Model File:** `src/models/modelOnlineMarketing.ts`

---

## การทำงาน

### 1. Dashboard - จัดการข้อมูล (CRUD)

#### การสร้างข้อมูลใหม่

**Flow:**
```
1. Admin คลิกปุ่ม "เพิ่มข้อมูล"
   ↓
2. เปิด DialogCreate พร้อม Form:
   - อัพโหลดภาพปก (thumbnail)
   - หัวข้อ (title)
   - คำโปรย (excerpt)
   - รายละเอียด (detail - multiline)
   - อัพโหลดไฟล์ (file_download - optional)
   - สถานะ (status: publish/pending)
   ↓
3. กด Submit → เรียก API POST /api/create
   ↓
4. บันทึกลง MongoDB collection tbl_online_marketings
   ↓
5. Invalidate React Query cache
   ↓
6. Table auto-refresh แสดงข้อมูลใหม่
```

**ไฟล์ที่เกี่ยวข้อง:**
- `DialogCreate.tsx` - ฟอร์มสร้างข้อมูล
- `fileUpload.tsx` - Upload รูปภาพและไฟล์
- `src/action/crud/create.ts` - Function สำหรับ create
- `src/app/api/create/route.ts` - API endpoint

#### การแก้ไขข้อมูล

**Flow:**
```
1. Admin เลือกรายการ → คลิก "แก้ไข"
   ↓
2. เปิด DialogEdit พร้อมข้อมูลเดิม
   ↓
3. แก้ไขข้อมูลที่ต้องการ
   ↓
4. Submit → เรียก API PUT /api/update
   ↓
5. อัพเดทข้อมูลใน MongoDB
   ↓
6. Invalidate cache และ refresh table
```

**ไฟล์ที่เกี่ยวข้อง:**
- `DialogEdit.tsx`
- `src/action/crud/update.ts`
- `src/app/api/update/route.ts`

#### การลบข้อมูล

**Flow:**
```
1. Admin เลือกรายการ → คลิก "ลบ"
   ↓
2. แสดง DialogDelete ยืนยัน
   ↓
3. ยืนยันการลบ → เรียก API DELETE /api/delete
   ↓
4. ลบข้อมูลจาก MongoDB
   ↓
5. Invalidate cache และ refresh table
```

**ไฟล์ที่เกี่ยวข้อง:**
- `DialogDelete.tsx`
- `src/action/crud/delete.ts`
- `src/app/api/delete/route.ts`

---

### 2. LIFF - แสดงข้อมูลสำหรับผู้ใช้

#### หน้ารายการ (`/liff/marketing`)

**Flow:**
```
1. ผู้ใช้เข้าหน้า Marketing
   ↓
2. ดึงข้อมูล tbl_online_marketings ที่ status = 'publish'
   ↓
3. แสดงเป็น Card List:
   - รูปภาพ Thumbnail
   - Title
   - Excerpt
   - ปุ่ม "อ่านต่อ"
```

**API Call:**
```typescript
useReadKey('tbl_online_marketings', 'status', 'publish')
```

#### หน้ารายละเอียด (`/liff/marketing/[slug]`)

**Flow:**
```
1. ผู้ใช้คลิก "อ่านต่อ" จาก Card
   ↓
2. Navigate ไป /liff/marketing/[_id]
   ↓
3. ดึงข้อมูลรายละเอียด โดยใช้ _id
   ↓
4. แสดง:
   - รูปภาพเต็ม
   - Title
   - Detail (Full content)
   - ปุ่ม Download File (ถ้ามี file_download)
```

**API Call:**
```typescript
useReadBy('tbl_online_marketings', slug)
```

---

## Structure Definition

```typescript
const structure = {
  title: 'เพิ่มข้อมูล',
  table: 'tbl_online_marketings',
  field: [
    {
      id: 'thumbnail',
      type: 'image',
      label: 'ภาพปก'
    },
    {
      id: 'title',
      type: 'text',
      label: 'หัวข้อ'
    },
    {
      id: 'excerpt',
      type: 'text',
      label: 'คำโปรย'
    },
    {
      id: 'detail',
      type: 'multiline',
      label: 'รายละเอียด'
    },
    {
      id: 'file_download',
      type: 'file',
      label: 'ไฟล์ดาวน์โหลด'
    },
    {
      id: 'status',
      type: 'select',
      value: ['publish', 'pending'],
      label: 'สถานะ'
    }
  ]
}
```

---

## State Management

### React Query Keys

```typescript
// ดึงข้อมูลทั้งหมด
['tbl_online_marketings']

// ดึงข้อมูลที่ publish
['tbl_online_marketings', 'status', 'publish']

// ดึงข้อมูลรายการเดียว
['tbl_online_marketings', id]
```

### Local State (Context)

```typescript
const ItemsContext = {
  open: boolean,              // สถานะเปิด/ปิด DialogCreate
  openEdit: boolean,          // สถานะเปิด/ปิด DialogEdit
  openDel: boolean,           // สถานะเปิด/ปิด DialogDelete
  select: TypeMarketing,      // รายการที่เลือก
  update: boolean,            // Flag สำหรับ trigger update
  setOpen: Function,
  setOpenEdit: Function,
  setOpenDel: Function,
  setSelect: Function,
  setUpdate: Function
}
```

---

## API Endpoints ที่ใช้

### 1. Create
- **Method:** POST
- **URL:** `/api/create`
- **Body:** `{ table: 'tbl_online_marketings', data: {...} }`

### 2. Read All
- **Method:** GET
- **URL:** `/api/read/tbl_online_marketings`

### 3. Read by Status
- **Method:** GET
- **URL:** `/api/readKey/tbl_online_marketings/status/publish`

### 4. Update
- **Method:** PUT
- **URL:** `/api/update`
- **Body:** `{ table: 'tbl_online_marketings', data: { _id, ...updates } }`

### 5. Delete
- **Method:** DELETE
- **URL:** `/api/delete`
- **Body:** `{ table: 'tbl_online_marketings', id: '...' }`

### 6. Upload File/Image
- **Method:** POST
- **URL:** `/api/upload`
- **Body:** FormData

---

## Use Cases

### UC-1: Admin สร้างโปรโมชั่นใหม่

```
1. Admin เข้า /dashboard/marketing
2. คลิก "เพิ่มข้อมูล"
3. อัพโหลดรูปปก (เช่น banner โปรโมชั่น)
4. กรอก:
   - Title: "โปรโมชั่นฝากครั้งแรกรับ 100%"
   - Excerpt: "สำหรับสมาชิกใหม่ ฝากครั้งแรกรับโบนัสเพิ่ม 100%"
   - Detail: รายละเอียดเงื่อนไขครบถ้วน
5. เลือก Status: "publish"
6. กด Submit
7. ระบบบันทึกและแสดงใน LIFF ทันที
```

### UC-2: ผู้ใช้ดูโปรโมชั่น

```
1. ผู้ใช้เปิด LINE LIFF
2. ไปที่หน้า Marketing
3. เห็นรายการโปรโมชั่นทั้งหมด (status = publish)
4. คลิกอ่านรายละเอียด
5. ดูข้อมูลครบถ้วน
6. Download ไฟล์เอกสารประกอบ (ถ้ามี)
```

### UC-3: Admin แก้ไขข้อมูลโปรโมชั่น

```
1. Admin เห็นว่าต้องแก้ไขเงื่อนไข
2. เลือกรายการที่ต้องการ
3. คลิก "แก้ไข"
4. แก้ไขข้อความใน Detail
5. กด Submit
6. ผู้ใช้เห็นข้อมูลใหม่ทันที
```

---

## การ Upload ไฟล์

### File Upload Component

ใช้ `react-dropzone` สำหรับ:
- **รูปภาพ:** PNG, JPG, GIF (Thumbnail)
- **ไฟล์:** PDF, DOC, XLS (File Download)

**Flow การ Upload:**
```
1. เลือกไฟล์ → Dropzone accept file
   ↓
2. แปลงเป็น FormData
   ↓
3. POST ไป /api/upload
   ↓
4. Server บันทึกไฟล์ (เช่น Firebase Storage, DigitalOcean Spaces)
   ↓
5. Return URL ของไฟล์
   ↓
6. เก็บ URL ใน field (thumbnail/file_download)
```

---

## UI/UX Details

### Dashboard Table
- แสดง: Thumbnail, Title, Excerpt, Status, Actions
- Actions: Edit (IconButton), Delete (IconButton)
- Pagination: รองรับหน้าหลายหน้า
- Search/Filter: กรองตาม Status

### LIFF Card Display
- Material-UI Card component
- Responsive design
- Image aspect ratio: 16:9
- Typography: Title (h6), Excerpt (body2)

---

## Performance Optimization

1. **React Query Caching:**
   - Cache Time: 5 minutes
   - Stale Time: 30 seconds
   - Auto refetch on mount: true

2. **Image Optimization:**
   - ใช้ Next.js Image component
   - Lazy loading
   - Responsive images

3. **Pagination:**
   - แสดงทีละ 10 รายการ (Dashboard)
   - แสดงทีละ 6 รายการ (LIFF)

---

## Error Handling

```typescript
// กรณี Network Error
if (!response.ok) {
  toast.error('เกิดข้อผิดพลาดในการดึงข้อมูล')
}

// กรณีไม่พบข้อมูล
if (!items.data || items.data.length === 0) {
  return <div>ไม่พบข้อมูล</div>
}

// กรณี Loading
if (items.status === 'pending') {
  return <Loading />
}
```

---

## สรุป

Online Marketing Module เป็นระบบจัดการเนื้อหาแบบ CRUD พื้นฐาน ที่ออกแบบมาให้ใช้งานง่าย มีการ upload รูปภาพและไฟล์ และแสดงผลที่เหมาะสมทั้งใน Dashboard และ LIFF Application

**จุดเด่น:**
- UI ใช้งานง่าย เข้าใจง่าย
- รองรับ Rich Content (รูปภาพ + ไฟล์)
- Real-time update ด้วย React Query
- Responsive design ทำงานได้ทั้ง Mobile และ Desktop

---

**Related Modules:**
- [03-MISSION.md](./03-MISSION.md) - ระบบภารกิจ
- [07-POINT.md](./07-POINT.md) - ระบบคะแนน
