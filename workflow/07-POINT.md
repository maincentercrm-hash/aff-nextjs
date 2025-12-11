# Point Module (ระบบคะแนน)

## ภาพรวม

Point Module เป็นระบบจัดการคะแนนและของรางวัล ผู้ใช้สามารถสะสมคะแนนจากการทำ Mission และนำไปแลกของรางวัลได้

---

## Collections

### 1. `tbl_point` - รายการของรางวัล

```typescript
interface Point {
  _id: ObjectId
  thumbnail: string       // รูปภาพของรางวัล
  title: string           // ชื่อของรางวัล
  detail: string          // รายละเอียด
  point: number           // คะแนนที่ต้องใช้แลก
  status: string          // 'publish' | 'pending'
  createDate: Date
}
```

### 2. `tbl_client_point` - คะแนนของผู้ใช้

```typescript
interface ClientPoint {
  userId: string          // LINE User ID (unique)
  tel: string             // หมายเลขโทรศัพท์
  point: number           // คะแนนปัจจุบัน
  updateDate: Date        // วันที่อัพเดทล่าสุด
}
```

### 3. `tbl_point_logs` - ประวัติการเพิ่ม/ลดคะแนน

```typescript
interface PointLog {
  _id: ObjectId
  userId: string          // LINE User ID
  tel: string             // หมายเลขโทรศัพท์
  point: number           // จำนวนคะแนน
  operation: string       // '+' | '-'
  title: string           // คำอธิบาย เช่น "แลก iPhone 15"
  createDate: Date        // วันที่ทำรายการ
}
```

---

## ไฟล์และที่ตั้ง

### Dashboard
```
src/app/(dashboard)/dashboard/point/
  └── page.tsx                          # หน้าหลัก (2 Tabs)

src/components/dashboard/point/
  ├── MainPoint.tsx                     # จัดการของรางวัล
  ├── TablePoint.tsx                    # ตารางของรางวัล
  ├── MainPointLog.tsx                  # ประวัติการแลก
  ├── TablePointLog.tsx                 # ตารางประวัติ
  ├── DialogCreate.tsx                  # สร้างของรางวัล
  ├── DialogEdit.tsx                    # แก้ไขของรางวัล
  ├── DialogDelete.tsx                  # ลบของรางวัล
  └── fileUpload.tsx                    # Upload รูปภาพ
```

### LIFF
```
src/app/(liff)/liff/point/
  └── page.tsx                          # หน้าแลกของรางวัล
```

### Actions
```
src/action/crud/
  └── point.ts                          # อัพเดทคะแนน (+/-)
src/action/point/
  └── updateStatus.ts                   # อัพเดทสถานะ
```

---

## การทำงาน

### 1. Admin สร้างของรางวัล

**Flow:**
```
1. Admin เข้า /dashboard/point
   ↓
2. Tab "จัดการพ้อยต์"
   ↓
3. คลิก "เพิ่มข้อมูล"
   ↓
4. กรอกข้อมูล:
   - Upload รูปภาพ (iPhone 15 Pro)
   - ชื่อ: "iPhone 15 Pro Max 256GB"
   - รายละเอียด: "สีไทเทเนียม..."
   - คะแนน: 50000
   - สถานะ: Publish
   ↓
5. บันทึกลง tbl_point
   ↓
6. แสดงใน LIFF ทันที
```

---

### 2. ผู้ใช้แลกของรางวัล

**Flow:**
```
1. ผู้ใช้เข้า /liff/point
   ↓
2. ดึงข้อมูล:
   - tbl_point (ของรางวัลทั้งหมด)
   - tbl_client_point (คะแนนของผู้ใช้)
   ↓
3. แสดงรายการของรางวัล:
   ┌──────────────────────────────────┐
   │ [รูปภาพ iPhone]                  │
   │ iPhone 15 Pro Max 256GB          │
   │ 50,000 Point                     │
   │                                  │
   │ คะแนนของคุณ: 12,500 Point        │
   │         [แลก]                    │
   └──────────────────────────────────┘
   ↓
4. ผู้ใช้คลิก "แลก"
   ↓
5. ตรวจสอบคะแนน:
   if (userPoint < itemPoint) {
     alert('คะแนนไม่พอ')
     return
   }
   ↓
6. ยืนยันการแลก
   ↓
7. ดำเนินการ:
   - Update tbl_client_point:
     * point -= 50000
   - Create tbl_point_logs:
     * operation = '-'
     * point = 50000
     * title = 'แลก iPhone 15 Pro Max'
   ↓
8. แสดง "แลกสำเร็จ! รอติดต่อกลับ"
```

---

## Dashboard Page (2 Tabs)

```typescript
// src/app/(dashboard)/dashboard/point/page.tsx

const Page = () => {
  const [value, setValue] = useState(0)

  return (
    <>
      <Tabs value={value} onChange={(e, v) => setValue(v)}>
        <Tab label="จัดการพ้อยต์" />    {/* Tab 0: ของรางวัล */}
        <Tab label="ประวัติการแลก" />   {/* Tab 1: Point Logs */}
      </Tabs>

      {value === 0 && <MainPoint />}        {/* CRUD ของรางวัล */}
      {value === 1 && <MainPointLog />}     {/* ดูประวัติ */}
    </>
  )
}
```

---

## Point Operation (actionPoint)

### การเพิ่มคะแนน (Operation: '+')

```typescript
// src/action/crud/point.ts

export const actionPoint = async (table: string, data: {
  userId: string
  tel: string
  point: number
  operation: '+' | '-'
}) => {
  const response = await fetch('/api/point', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ table, data })
  })

  return response.json()
}

// API Implementation
// src/app/api/point/route.ts

export async function POST(request: Request) {
  const { table, data } = await request.json()
  const { userId, point, operation } = data

  await connectDB()

  // Find existing record
  let clientPoint = await db.collection(table).findOne({ userId })

  if (clientPoint) {
    // Update existing
    const newPoint = operation === '+'
      ? clientPoint.point + point
      : clientPoint.point - point

    await db.collection(table).updateOne(
      { userId },
      {
        $set: {
          point: Math.max(0, newPoint),  // ไม่ให้ติดลบ
          updateDate: new Date()
        }
      }
    )
  } else {
    // Create new (สำหรับผู้ใช้ใหม่)
    await db.collection(table).insertOne({
      userId: data.userId,
      tel: data.tel,
      point: operation === '+' ? point : 0,
      createDate: new Date(),
      updateDate: new Date()
    })
  }

  return NextResponse.json({ success: true })
}
```

---

## Structure Definition

### Point Item (ของรางวัล)

```typescript
const structure = {
  title: 'เพิ่มข้อมูล',
  table: 'tbl_point',
  field: [
    {
      id: 'thumbnail',
      type: 'image',
      label: 'ภาพของรางวัล'
    },
    {
      id: 'title',
      type: 'text',
      label: 'ชื่อของรางวัล'
    },
    {
      id: 'detail',
      type: 'multiline',
      label: 'รายละเอียด'
    },
    {
      id: 'point',
      type: 'number',
      label: 'คะแนนที่ใช้แลก'
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

## LIFF Point Page

```typescript
const Page = () => {
  const { userId } = useContext(LineProfile)
  const items = useReadKey('tbl_point', 'status', 'publish')
  const profile = useReadBy('tbl_client', userId)
  const clientPoint = useReadBy('tbl_client_point', userId)

  const handleRedeem = async (item) => {
    const userPoint = clientPoint.data?.point || 0

    // ตรวจสอบคะแนน
    if (userPoint < item.point) {
      toast.error(`คะแนนไม่พอ (มี ${userPoint} ต้องการ ${item.point})`)
      return
    }

    // ยืนยัน
    const confirm = window.confirm(
      `ต้องการแลก ${item.title} ใช้ ${item.point} Point?`
    )
    if (!confirm) return

    try {
      // 1. ลดคะแนน
      await actionPoint('tbl_client_point', {
        userId,
        tel: profile.data.tel,
        point: item.point,
        operation: '-'
      })

      // 2. บันทึก Log
      await actionCreate('tbl_point_logs', {
        userId,
        tel: profile.data.tel,
        point: item.point,
        operation: '-',
        title: `แลก ${item.title}`,
        createDate: new Date()
      })

      // 3. Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['tbl_client_point'] })
      queryClient.invalidateQueries({ queryKey: ['tbl_point_logs'] })

      toast.success('แลกสำเร็จ! ทางทีมงานจะติดต่อกลับโดยเร็ว')
    } catch (error) {
      toast.error('เกิดข้อผิดพลาด กรุณาลองใหม่')
    }
  }

  return (
    <>
      <NavTop title="POINT" />

      {/* แสดงคะแนนปัจจุบัน */}
      <div className="p-4 bg-blue-500 text-white text-center">
        <h2>คะแนนของคุณ</h2>
        <p className="text-4xl font-bold">
          {clientPoint.data?.point?.toLocaleString() || 0} Point
        </p>
      </div>

      {/* รายการของรางวัล */}
      <div className="grid gap-4 p-4">
        {items.data?.map(item => (
          <Card key={item._id}>
            <CardMedia image={item.thumbnail} />
            <CardContent>
              <h3>{item.title}</h3>
              <p>{item.detail}</p>
              <p className="text-lg font-bold text-blue-600">
                {item.point.toLocaleString()} Point
              </p>
              <Button
                variant="contained"
                onClick={() => handleRedeem(item)}
                disabled={!clientPoint.data || clientPoint.data.point < item.point}
              >
                {(!clientPoint.data || clientPoint.data.point < item.point)
                  ? 'คะแนนไม่พอ'
                  : 'แลก'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  )
}
```

---

## Point Logs (ประวัติ)

### Dashboard View

```typescript
const MainPointLog = () => {
  const logs = useRead('tbl_point_logs')

  return (
    <TablePointLog items={logs.data} />
  )
}

const TablePointLog = ({ items }) => (
  <Table>
    <TableHead>
      <TableRow>
        <TableCell>วันที่</TableCell>
        <TableCell>เบอร์โทร</TableCell>
        <TableCell>รายการ</TableCell>
        <TableCell>คะแนน</TableCell>
        <TableCell>ประเภท</TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {items?.map(log => (
        <TableRow key={log._id}>
          <TableCell>{formatDate(log.createDate)}</TableCell>
          <TableCell>{log.tel}</TableCell>
          <TableCell>{log.title}</TableCell>
          <TableCell>{log.point.toLocaleString()}</TableCell>
          <TableCell>
            <Chip
              label={log.operation === '+' ? 'รับ' : 'ใช้'}
              color={log.operation === '+' ? 'success' : 'error'}
            />
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
)
```

---

## Point Flow Diagram

```
ผู้ใช้ทำ Mission สำเร็จ
         ↓
    รับ Point (+)
         ↓
tbl_client_point.point += 100
         ↓
tbl_point_logs (operation: '+')
         ↓
ผู้ใช้แลกของรางวัล
         ↓
    ใช้ Point (-)
         ↓
tbl_client_point.point -= 50000
         ↓
tbl_point_logs (operation: '-')
```

---

## Features

### ✅ Point Management
- เพิ่มคะแนนจาก Mission/Setting
- ลดคะแนนจากการแลกของรางวัล
- ไม่ให้คะแนนติดลบ

### ✅ Reward Catalog
- จัดการของรางวัลแบบ CRUD
- อัพโหลดรูปภาพ
- ตั้งค่าคะแนนที่ต้องใช้

### ✅ Transaction Log
- บันทึกทุกการเพิ่ม/ลดคะแนน
- แสดงประวัติครบถ้วน
- ตรวจสอบได้ว่าได้ Point มาจากไหน

### ✅ Real-time Update
- คะแนนอัพเดททันที
- ใช้ React Query Invalidation

---

## Use Cases

### UC-1: ผู้ใช้ทำ Mission สำเร็จรับ 100 Point

```
1. ผู้ใช้ทำ Mission "แชร์ 5 เพื่อน" สำเร็จ
2. กด "รับ Point"
3. ระบบ:
   - tbl_client_point: 0 → 100
   - tbl_point_logs: +100 "แชร์ 5 เพื่อนรับ 100 Point"
4. ผู้ใช้เห็นคะแนน 100 Point
```

### UC-2: ผู้ใช้แลก iPhone (50,000 Point)

```
1. ผู้ใช้มีคะแนน 55,000 Point
2. เข้าหน้า Point
3. เลือก "iPhone 15 Pro Max" (50,000 Point)
4. คลิก "แลก"
5. ยืนยัน
6. ระบบ:
   - tbl_client_point: 55,000 → 5,000
   - tbl_point_logs: -50,000 "แลก iPhone 15 Pro Max"
7. แสดง "แลกสำเร็จ!"
```

### UC-3: ตรวจสอบประวัติคะแนน

```
1. ผู้ใช้เข้าหน้า Point Logs (ถ้ามี)
2. เห็นประวัติ:
   - 1 พ.ย. | +100 | แชร์ 5 เพื่อน
   - 5 พ.ย. | +50  | ฝาก 1000 บาท
   - 10 พ.ย.| -500 | แลกบัตรของขวัญ
3. รู้ว่าคะแนนมาจากไหน ใช้ไปไหน
```

---

## Security Considerations

### 1. Prevent Negative Points

```typescript
const newPoint = operation === '+'
  ? currentPoint + point
  : currentPoint - point

// ไม่ให้ติดลบ
await updateOne({ userId }, {
  $set: { point: Math.max(0, newPoint) }
})
```

### 2. Transaction Atomicity

```typescript
// ใช้ MongoDB Transaction สำหรับการแลก Point
const session = client.startSession()
session.startTransaction()

try {
  // 1. ลดคะแนน
  await db.collection('tbl_client_point').updateOne(...)

  // 2. บันทึก log
  await db.collection('tbl_point_logs').insertOne(...)

  await session.commitTransaction()
} catch (error) {
  await session.abortTransaction()
  throw error
} finally {
  session.endSession()
}
```

### 3. Validate Point Amount

```typescript
// ตรวจสอบก่อนแลก
if (userPoint < itemPoint) {
  return { error: 'คะแนนไม่พอ' }
}

// Double-check ใน API
const currentPoint = await db.collection('tbl_client_point')
  .findOne({ userId })

if (currentPoint.point < requestedPoint) {
  return { error: 'คะแนนไม่พอ' }
}
```

---

## Future Enhancements

### 1. Point Expiry

```typescript
// คะแนนมีอายุ (หมดอายุใน 365 วัน)
interface ClientPoint {
  point: number
  expiryDate: Date
}
```

### 2. Point Tiers

```typescript
// ระดับสมาชิก ตามคะแนนสะสม
const tiers = {
  bronze: 0,      // 0-999
  silver: 1000,   // 1,000-4,999
  gold: 5000,     // 5,000-9,999
  platinum: 10000 // 10,000+
}
```

### 3. Special Offers

```typescript
// ของรางวัลพิเศษ ลดราคา
interface PointItem {
  point: number
  discountPoint?: number  // ราคาลด
  validUntil?: Date       // ถึงวันที่
}
```

---

**Related Modules:**
- [03-MISSION.md](./03-MISSION.md) - ได้ Point จากการทำ Mission
- [05-SETTING.md](./05-SETTING.md) - ได้ Point จากการเช็คอิน
- [04-REPORT.md](./04-REPORT.md) - รายงาน Point ที่แจก
