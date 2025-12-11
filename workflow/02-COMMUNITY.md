# Community Module

## ภาพรวม

โมดูล Community เป็นระบบจัดการลิงก์ Social Media และช่องทางการติดต่อต่างๆ เพื่อสร้าง Engagement และช่องทางการสื่อสารระหว่างแบรนด์กับผู้ใช้

---

## Collection: `tbl_community`

### Schema Structure

```typescript
{
  _id: ObjectId
  title: string          // ชื่อ Community/Channel
  excerpt: string        // คำอธิบายสั้นๆ
  url: string            // URL/Link ไปยัง Community
  category: string       // 'facebook' | 'line' | 'telegram' | 'other'
  status: string         // 'publish' | 'pending'
  createDate: Date       // วันที่สร้าง
}
```

---

## ไฟล์และที่ตั้ง

### Dashboard (Admin)
- **Page:** `src/app/(dashboard)/dashboard/community/page.tsx`
- **Main Component:** `src/components/dashboard/community/MainCommunity.tsx`
- **Table Component:** `src/components/dashboard/community/TableCommunity.tsx`
- **Dialog Components:**
  - `DialogCreate.tsx` - สร้าง Community ใหม่
  - `DialogEdit.tsx` - แก้ไข Community
  - `DialogDelete.tsx` - ลบ Community

### LIFF (User)
- **Page:** `src/app/(liff)/liff/community/page.tsx`

---

## การทำงาน

### 1. Dashboard - จัดการ Community Links

#### การสร้าง Community Link ใหม่

**Flow:**
```
1. Admin คลิกปุ่ม "เพิ่มข้อมูล"
   ↓
2. เปิด DialogCreate พร้อม Form:
   - ชื่อ Community (title)
   - คำอธิบาย (excerpt)
   - URL/Link (url)
   - หมวดหมู่ (category):
     * Facebook
     * LINE
     * Telegram
     * Other
   - สถานะ (status: publish/pending)
   ↓
3. กด Submit → เรียก API POST /api/create
   ↓
4. บันทึกลง tbl_community
   ↓
5. Invalidate cache และ refresh table
```

**ตัวอย่างข้อมูล:**
```json
{
  "title": "กลุ่ม LINE Official",
  "excerpt": "เข้ากลุ่มเพื่อรับข่าวสารและโปรโมชั่นล่าสุด",
  "url": "https://line.me/ti/g/xxxxx",
  "category": "line",
  "status": "publish"
}
```

#### Category Types และ Icon

```typescript
const categoryIcons = {
  facebook: <FacebookIcon />,
  line: <LineIcon />,
  telegram: <TelegramIcon />,
  other: <LinkIcon />
}
```

---

### 2. LIFF - แสดง Community Links

**Flow:**
```
1. ผู้ใช้เข้าหน้า Community
   ↓
2. ดึงข้อมูล tbl_community ที่ status = 'publish'
   ↓
3. จัดกลุ่มตาม category:
   - Facebook Communities
   - LINE Groups
   - Telegram Channels
   - Other Links
   ↓
4. แสดงเป็น Card พร้อม:
   - Icon ตาม category
   - Title
   - Excerpt
   - ปุ่ม "เข้าร่วม" → เปิด URL ใน browser
```

**API Call:**
```typescript
useReadKey('tbl_community', 'status', 'publish')
```

**Display Logic:**
```typescript
// Group by category
const groupedCommunities = {
  facebook: items.data.filter(item => item.category === 'facebook'),
  line: items.data.filter(item => item.category === 'line'),
  telegram: items.data.filter(item => item.category === 'telegram'),
  other: items.data.filter(item => item.category === 'other')
}
```

---

## Structure Definition

```typescript
const structure = {
  title: 'เพิ่มข้อมูล',
  table: 'tbl_community',
  field: [
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
      id: 'url',
      type: 'text',
      label: 'ลิงค์'
    },
    {
      id: 'category',
      type: 'category',
      value: [
        'facebook',
        'line',
        'telegram',
        'other'
      ],
      label: 'หมวดหมู่'
    },
    {
      id: 'status',
      type: 'select',
      value: [
        'publish',
        'pending'
      ],
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
['tbl_community']

// ดึงข้อมูลที่ publish
['tbl_community', 'status', 'publish']

// ดึงข้อมูลตาม category
['tbl_community', 'category', 'facebook']
```

### Local State (Context)

```typescript
const ItemsContext = {
  open: boolean,              // DialogCreate
  openEdit: boolean,          // DialogEdit
  openDel: boolean,           // DialogDelete
  select: TypeCommunity,      // รายการที่เลือก
  update: boolean,
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
- **Body:** `{ table: 'tbl_community', data: {...} }`

### 2. Read All
- **Method:** GET
- **URL:** `/api/read/tbl_community`

### 3. Read by Status
- **Method:** GET
- **URL:** `/api/readKey/tbl_community/status/publish`

### 4. Update
- **Method:** PUT
- **URL:** `/api/update`
- **Body:** `{ table: 'tbl_community', data: { _id, ...updates } }`

### 5. Delete
- **Method:** DELETE
- **URL:** `/api/delete`
- **Body:** `{ table: 'tbl_community', id: '...' }`

---

## Use Cases

### UC-1: Admin เพิ่ม LINE Official Group

```
1. Admin ต้องการให้ผู้ใช้เข้ากลุ่ม LINE
2. เข้า /dashboard/community
3. คลิก "เพิ่มข้อมูล"
4. กรอก:
   - Title: "กลุ่ม LINE VIP"
   - Excerpt: "สำหรับสมาชิก VIP เท่านั้น"
   - URL: "https://line.me/ti/g/xxxxx"
   - Category: "line"
   - Status: "publish"
5. กด Submit
6. ผู้ใช้เห็นใน LIFF ทันที
```

### UC-2: ผู้ใช้เข้าร่วม Community

```
1. ผู้ใช้เปิดหน้า Community ใน LIFF
2. เห็นรายการ Communities ทั้งหมด
3. เลือก "กลุ่ม LINE VIP"
4. คลิกปุ่ม "เข้าร่วม"
5. เปิด LINE App และเข้ากลุ่ม
```

### UC-3: จัดกลุ่มตาม Platform

```
LIFF แสดง Section แยกตาม category:

📘 Facebook Communities
  - Page แฟนคลับ
  - กลุ่มสมาชิก

💬 LINE Groups
  - กลุ่ม LINE VIP
  - กลุ่มแจ้งข่าวสาร

✈️ Telegram Channels
  - Channel ข่าวด่วน

🔗 Other Links
  - Website
  - YouTube Channel
```

---

## UI/UX Details

### Dashboard Table
- Columns: Title, Category, URL, Status, Actions
- Category มี Badge สี:
  - Facebook: Blue
  - LINE: Green
  - Telegram: Cyan
  - Other: Gray
- URL แสดงแบบ truncate พร้อม copy button

### LIFF Display
- Card Layout with Icon
- เรียงตาม category
- ปุ่ม "เข้าร่วม" เปิด URL ใน External Browser
- Click Tracking (optional)

---

## URL Validation

```typescript
// ตรวจสอบ URL format
const validateURL = (url: string) => {
  const pattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/
  return pattern.test(url)
}

// Auto-add https:// ถ้าไม่มี
if (!url.startsWith('http')) {
  url = 'https://' + url
}
```

---

## Link Opening Behavior

### LIFF External Browser

```typescript
import liff from '@line/liff'

const handleJoinCommunity = (url: string) => {
  if (liff.isInClient()) {
    // เปิดใน External Browser
    liff.openWindow({
      url: url,
      external: true
    })
  } else {
    // เปิดใน Tab ใหม่
    window.open(url, '_blank')
  }
}
```

---

## Analytics & Tracking

### Track Community Clicks

```typescript
// บันทึก log เมื่อผู้ใช้คลิก
const trackCommunityClick = async (communityId: string, userId: string) => {
  await actionCreate('tbl_community_logs', {
    communityId,
    userId,
    action: 'click',
    timestamp: new Date()
  })
}
```

---

## Category Icons & Colors

```typescript
const categoryConfig = {
  facebook: {
    icon: 'mdi:facebook',
    color: '#1877F2',
    label: 'Facebook'
  },
  line: {
    icon: 'mdi:line',
    color: '#00B900',
    label: 'LINE'
  },
  telegram: {
    icon: 'mdi:telegram',
    color: '#0088CC',
    label: 'Telegram'
  },
  other: {
    icon: 'mdi:link',
    color: '#666666',
    label: 'อื่นๆ'
  }
}
```

---

## Features Summary

### ✅ Admin Features
- เพิ่ม/แก้ไข/ลบ Community Links
- จัดกลุ่มตาม Platform
- ตั้งสถานะ Publish/Pending
- ดูสถิติการคลิก (ถ้ามี tracking)

### ✅ User Features
- ดู Community Links ทั้งหมด
- เรียงตาม Category
- คลิกเพื่อเข้าร่วม Community
- เปิดใน External Browser

---

## Best Practices

### 1. URL Management
```typescript
// เก็บ Short URL แทน Long URL
const shortenURL = async (longURL: string) => {
  // ใช้ service อย่าง bit.ly, tinyurl
  return shortURL
}
```

### 2. QR Code Support
```typescript
// สร้าง QR Code สำหรับ Community Link
import QRCode from 'qrcode'

const generateQR = async (url: string) => {
  return await QRCode.toDataURL(url)
}
```

### 3. Deeplink Support
```typescript
// Facebook Group
facebook://group?id=xxxxx

// LINE Group
https://line.me/ti/g/xxxxx

// Telegram
tg://join?invite=xxxxx
```

---

## Performance

### Caching Strategy
```typescript
{
  staleTime: 5 * 60 * 1000,  // 5 minutes
  cacheTime: 10 * 60 * 1000, // 10 minutes
  refetchOnMount: false,      // ไม่ต้อง refetch บ่อย
}
```

### Lazy Loading
```typescript
// Load icons แบบ dynamic
const CategoryIcon = dynamic(() => import(`@/icons/${category}`))
```

---

## Error Handling

```typescript
// กรณี URL ไม่ถูกต้อง
if (!validateURL(url)) {
  toast.error('กรุณากรอก URL ที่ถูกต้อง')
  return
}

// กรณีเปิด URL ไม่ได้
try {
  liff.openWindow({ url, external: true })
} catch (error) {
  toast.error('ไม่สามารถเปิดลิงก์ได้ กรุณาลองใหม่')
}
```

---

## Future Enhancements

### 1. Social Login Integration
- ใช้ Community Links สำหรับ OAuth Login
- Connect Facebook/LINE/Telegram Account

### 2. Community Feed
- แสดง Latest Posts จาก Community
- Integration กับ Social Media API

### 3. Member Count
- แสดงจำนวนสมาชิกใน Community
- Auto-sync จาก Platform API

---

## สรุป

Community Module เป็นระบบจัดการลิงก์ Social Media แบบง่ายแต่มีประสิทธิภาพ ช่วยให้ผู้ใช้เข้าถึง Community ต่างๆ ได้สะดวก และเพิ่มช่องทางการสื่อสารระหว่างแบรนด์กับลูกค้า

**จุดเด่น:**
- จัดกลุ่มตาม Platform ชัดเจน
- รองรับหลาย Platform
- เปิด URL ได้ทั้ง In-App และ External Browser
- UI ใช้งานง่าย มี Icon สวยงาม

---

**Related Modules:**
- [01-ONLINE-MARKETING.md](./01-ONLINE-MARKETING.md) - ระบบข่าวสาร
- [06-SUPPORT.md](./06-SUPPORT.md) - ระบบช่วยเหลือ
