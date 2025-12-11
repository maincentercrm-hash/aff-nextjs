# Setting Module (ระบบเช็คอิน/กิจกรรมรายวัน)

## ภาพรวม

Setting Module เป็นระบบกิจกรรมรายวันที่ผู้ใช้สามารถเข้าร่วมเพื่อรับคะแนน คล้ายกับ Mission แต่เป็นแบบเช็คอิน และต้องรอการตรวจสอบจาก Admin

---

## Collections

### 1. `tbl_setting` - กิจกรรมรายวัน

```typescript
interface Setting {
  _id: ObjectId
  title: string           // หัวข้อกิจกรรม
  detail: string          // รายละเอียด
  point: number           // คะแนนที่ได้รับ
  status: string          // 'publish' | 'pending'
  createDate: Date
}
```

### 2. `tbl_setting_logs` - บันทึกการเข้าร่วม

```typescript
interface SettingLog {
  _id: ObjectId
  userId: string          // LINE User ID
  tel: string             // หมายเลขโทรศัพท์
  setting_id: string      // Reference to tbl_setting
  status: string          // 'pending' | 'approved' | 'rejected'
  point: number           // คะแนนที่ได้รับ (เมื่อ approved)
  createDate: Date        // วันที่เข้าร่วม
  approveDate: Date       // วันที่อนุมัติ
}
```

---

## ไฟล์และที่ตั้ง

### Dashboard
```
src/app/(dashboard)/dashboard/setting/
  └── page.tsx                          # หน้าหลัก (มี 2 Tab)

src/components/dashboard/setting/
  ├── MainSetting.tsx                   # จัดการกิจกรรม
  ├── TableSetting.tsx                  # ตารางกิจกรรม
  ├── MainLogSetting.tsx                # ตรวจสอบรายการรอ
  ├── TableLogSetting.tsx               # ตารางรายการรอ
  ├── DialogCreate.tsx                  # สร้างกิจกรรม
  ├── DialogEdit.tsx                    # แก้ไขกิจกรรม
  ├── DialogDelete.tsx                  # ลบกิจกรรม
  └── DialogCheck.tsx                   # ตรวจสอบ/อนุมัติ
```

### LIFF
```
src/app/(liff)/liff/setting/
  └── page.tsx                          # หน้าผู้ใช้
```

---

## การทำงาน

### 1. Admin สร้างกิจกรรม

**Flow:**
```
1. Admin เข้าหน้า /dashboard/setting
   ↓
2. Tab "ตั้งค่าการทำงาน"
   ↓
3. คลิก "เพิ่มข้อมูล"
   ↓
4. กรอกข้อมูล:
   - หัวข้อ: "เช็คอินรายวัน"
   - รายละเอียด: "เข้าร่วมทุกวันรับ 10 Point"
   - คะแนน: 10
   - สถานะ: publish
   ↓
5. บันทึกลง tbl_setting
   ↓
6. กิจกรรมปรากฏใน LIFF
```

---

### 2. ผู้ใช้เข้าร่วมกิจกรรม

**Flow:**
```
1. ผู้ใช้เข้าหน้า /liff/setting
   ↓
2. เห็นกิจกรรมที่ status = 'publish'
   ↓
3. คลิก "เข้าร่วม"
   ↓
4. บันทึกลง tbl_setting_logs:
   {
     userId: 'U1234...',
     tel: '0812345678',
     setting_id: 'setting_123',
     status: 'pending',  // รอตรวจสอบ
     createDate: NOW
   }
   ↓
5. แสดงข้อความ "รอการตรวจสอบ"
```

---

### 3. Admin ตรวจสอบและอนุมัติ

**Flow:**
```
1. Admin เข้า Tab "รายการรอตรวจสอบ"
   ↓
2. เห็นรายการที่ status = 'pending'
   ┌─────────────────────────────────────┐
   │ เบอร์โทร    | กิจกรรม      | วันที่ │
   │─────────────────────────────────────│
   │ 0812345678  | เช็คอินรายวัน | 1 พ.ย. │
   │ 0898765432  | เช็คอินรายวัน | 1 พ.ย. │
   └─────────────────────────────────────┘
   ↓
3. Admin เลือกรายการ → คลิก "ตรวจสอบ"
   ↓
4. เปิด DialogCheck แสดงรายละเอียด
   ↓
5. Admin เลือก:
   - [อนุมัติ] → status = 'approved'
   - [ปฏิเสธ] → status = 'rejected'
   ↓
6. ถ้าอนุมัติ:
   - Update tbl_setting_logs:
     * status = 'approved'
     * point = 10
     * approveDate = NOW
   - Update tbl_client_point:
     * point += 10
   - Create tbl_point_logs:
     * operation = '+'
     * point = 10
     * title = 'เช็คอินรายวัน'
```

---

## Page Structure

### Dashboard Page (2 Tabs)

```typescript
// src/app/(dashboard)/dashboard/setting/page.tsx

const Page = () => {
  const [value, setValue] = useState(0)

  const handleChange = (event, newValue) => {
    setValue(newValue)
  }

  return (
    <>
      <Tabs value={value} onChange={handleChange}>
        <Tab label="ตั้งค่าการทำงาน" />   {/* Tab 0: จัดการกิจกรรม */}
        <Tab label="รายการรอตรวจสอบ" />   {/* Tab 1: ตรวจสอบรายการ */}
      </Tabs>

      {value === 0 && <MainSetting />}         {/* CRUD กิจกรรม */}
      {value === 1 && <MainLogSetting />}      {/* ตรวจสอบ Logs */}
    </>
  )
}
```

---

## Components

### MainSetting (Tab 1)

จัดการกิจกรรมแบบ CRUD

```typescript
const structure = {
  title: 'เพิ่มข้อมูล',
  table: 'tbl_setting',
  field: [
    { id: 'title', type: 'text', label: 'หัวข้อ' },
    { id: 'detail', type: 'multiline', label: 'รายละเอียด' },
    { id: 'point', type: 'number', label: 'คะแนน' },
    {
      id: 'status',
      type: 'select',
      value: ['publish', 'pending'],
      label: 'สถานะ'
    }
  ]
}
```

### MainLogSetting (Tab 2)

ตรวจสอบและอนุมัติรายการรอ

```typescript
const MainLogSetting = () => {
  const logs = useReadKey('tbl_setting_logs', 'status', 'pending')

  return (
    <TableLogSetting
      items={logs.data}
      onApprove={handleApprove}
      onReject={handleReject}
    />
  )
}
```

### DialogCheck (Approve/Reject)

```typescript
const DialogCheck = ({ log, onClose }) => {
  const handleApprove = async () => {
    // 1. Update log status
    await actionUpdate('tbl_setting_logs', {
      _id: log._id,
      status: 'approved',
      point: log.settingDetails.point,
      approveDate: new Date()
    })

    // 2. Update client point
    await actionPoint('tbl_client_point', {
      userId: log.userId,
      tel: log.tel,
      point: log.settingDetails.point,
      operation: '+'
    })

    // 3. Create point log
    await actionCreate('tbl_point_logs', {
      userId: log.userId,
      tel: log.tel,
      point: log.settingDetails.point,
      operation: '+',
      title: log.settingDetails.title,
      createDate: new Date()
    })

    toast.success('อนุมัติเรียบร้อย')
    onClose()
  }

  const handleReject = async () => {
    await actionUpdate('tbl_setting_logs', {
      _id: log._id,
      status: 'rejected'
    })

    toast.info('ปฏิเสธรายการแล้ว')
    onClose()
  }

  return (
    <Dialog open onClose={onClose}>
      <DialogTitle>ตรวจสอบรายการ</DialogTitle>
      <DialogContent>
        <p>เบอร์โทร: {log.tel}</p>
        <p>กิจกรรม: {log.settingDetails.title}</p>
        <p>คะแนน: {log.settingDetails.point}</p>
        <p>วันที่: {formatDate(log.createDate)}</p>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleReject} color="error">
          ปฏิเสธ
        </Button>
        <Button onClick={handleApprove} color="success">
          อนุมัติ
        </Button>
      </DialogActions>
    </Dialog>
  )
}
```

---

## LIFF User Interface

```typescript
// src/app/(liff)/liff/setting/page.tsx

const Page = () => {
  const { userId } = useContext(LineProfile)
  const settings = useReadKey('tbl_setting', 'status', 'publish')
  const profile = useReadBy('tbl_client', userId)
  const logs = useReadKey('tbl_setting_logs', 'tel', profile.data?.tel)

  const handleJoin = async (settingId) => {
    // ตรวจสอบว่าเคยเข้าร่วมวันนี้หรือไม่
    const today = new Date().toISOString().split('T')[0]
    const todayLog = logs.data?.find(log =>
      log.setting_id === settingId &&
      log.createDate.startsWith(today)
    )

    if (todayLog) {
      toast.warn('คุณได้เข้าร่วมวันนี้แล้ว')
      return
    }

    // สร้าง log
    await actionCreate('tbl_setting_logs', {
      userId,
      tel: profile.data.tel,
      setting_id: settingId,
      status: 'pending'
    })

    toast.success('บันทึกเรียบร้อย รอการตรวจสอบ')
  }

  return (
    <>
      {settings.data?.map(setting => (
        <SettingCard
          key={setting._id}
          setting={setting}
          onJoin={() => handleJoin(setting._id)}
          hasJoinedToday={checkHasJoinedToday(setting._id, logs.data)}
        />
      ))}
    </>
  )
}
```

---

## Features

### ✅ Daily Check-in
- ผู้ใช้เข้าร่วมได้วันละ 1 ครั้ง
- รอ Admin อนุมัติ

### ✅ Manual Approval
- Admin ตรวจสอบและอนุมัติด้วยตนเอง
- ป้องกันการโกง

### ✅ Point Distribution
- ให้ Point เมื่ออนุมัติเท่านั้น
- บันทึก Log ครบถ้วน

---

## State Flow

```
ผู้ใช้เข้าร่วม → status: 'pending'
       ↓
Admin ตรวจสอบ
       ↓
   ┌───┴───┐
   │       │
อนุมัติ  ปฏิเสธ
   │       │
status:  status:
approved rejected
   │
 รับ Point
```

---

## Use Cases

### UC-1: ผู้ใช้เช็คอินรายวัน

```
1. ผู้ใช้เปิดหน้า Setting
2. เห็นกิจกรรม "เช็คอินรายวัน"
3. คลิก "เข้าร่วม"
4. ระบบบันทึก (status: pending)
5. แสดง "รอการตรวจสอบ"
```

### UC-2: Admin อนุมัติรายการ

```
1. Admin เข้า Tab "รายการรอตรวจสอบ"
2. เห็นรายการ pending
3. คลิก "ตรวจสอบ"
4. เลือก "อนุมัติ"
5. ระบบ:
   - Update log → approved
   - เพิ่ม Point ให้ผู้ใช้
   - บันทึก Point Log
```

---

**Related Modules:**
- [03-MISSION.md](./03-MISSION.md) - ระบบภารกิจ (คล้ายกัน แต่ไม่ต้องรอ approve)
- [07-POINT.md](./07-POINT.md) - ระบบคะแนน
