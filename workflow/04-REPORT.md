# Report Module (ระบบรายงาน)

## ภาพรวม

Report Module เป็นระบบสำหรับแสดงสถิติและรายงานการทำภารกิจ (Mission) ของผู้ใช้ทั้งหมดในช่วงเวลาที่กำหนด

---

## API Endpoint

### `/api/reports/missions`

**Method:** GET

**Query Parameters:**
```typescript
{
  start: string  // ISO Date String (วันเริ่มต้น)
  end: string    // ISO Date String (วันสิ้นสุด)
}
```

**Response:**
```typescript
{
  summary: {
    totalMissions: number       // จำนวนภารกิจทั้งหมด
    totalPoints: number         // คะแนนรวมที่แจก
    completedMissions: number   // ภารกิจที่สำเร็จ
    pendingMissions: number     // ภารกิจที่กำลังทำ
  },
  dailyReports: [
    {
      date: string,  // วันที่
      summary: {
        totalMissions: number
        totalPoints: number
        completedMissions: number
        pendingMissions: number
      },
      missions: [
        {
          _id: string
          tel: string
          title: string
          type: string
          point: number
          status: string
          createDate: string
          completeDate?: string
          condition: string
        }
      ]
    }
  ]
}
```

---

## ไฟล์และที่ตั้ง

### Dashboard
```
src/app/(dashboard)/dashboard/report/
  └── page.tsx                          # หน้าหลัก

src/components/dashboard/report/
  ├── MainReport.tsx                    # Component หลัก
  ├── PickersRange.tsx                  # Date Range Picker
  └── AppReactDatepicker.tsx            # Date picker component

src/app/api/reports/missions/
  └── route.ts                          # API endpoint
```

### Actions
```
src/action/mission/
  └── useMissionReport.ts               # React Query Hook
```

---

## การทำงาน

### 1. Dashboard - ดูรายงาน

**Flow:**
```
1. Admin เข้าหน้า /dashboard/report
   ↓
2. เลือกช่วงเวลา:
   - Start Date (วันเริ่มต้น)
   - End Date (วันสิ้นสุด)
   ↓
3. กด "ดูรายงาน"
   ↓
4. เรียก API GET /api/reports/missions
   ?start=2025-11-01T00:00:00.000Z
   &end=2025-11-30T23:59:59.999Z
   ↓
5. แสดงรายงาน:
   ┌────────────────────────────────────┐
   │ สรุปภาพรวม                         │
   │ • ภารกิจทั้งหมด: 150 ภารกิจ        │
   │ • สำเร็จ: 100 ภารกิจ               │
   │ • กำลังทำ: 50 ภารกิจ               │
   │ • คะแนนรวม: 15,000 Point           │
   └────────────────────────────────────┘

   ┌────────────────────────────────────┐
   │ รายงานรายวัน                       │
   │                                    │
   │ 📅 1 พ.ย. 2568                     │
   │ • ภารกิจ: 10 | สำเร็จ: 7           │
   │ • คะแนน: 700 Point                 │
   │                                    │
   │ 📅 2 พ.ย. 2568                     │
   │ • ภารกิจ: 12 | สำเร็จ: 8           │
   │ • คะแนน: 850 Point                 │
   │                                    │
   │ ...                                │
   └────────────────────────────────────┘
```

---

## Component Structure

### MainReport Component

```typescript
const MainReport = () => {
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)

  const { data, isLoading, error } = useMissionReport(startDate, endDate)

  return (
    <>
      <PickersRange
        startDate={startDate}
        endDate={endDate}
        onStartChange={setStartDate}
        onEndChange={setEndDate}
      />

      {isLoading && <Loading />}
      {error && <Error message="ไม่สามารถดึงข้อมูลได้" />}

      {data && (
        <>
          {/* Summary Section */}
          <SummaryCard summary={data.summary} />

          {/* Daily Reports */}
          {data.dailyReports.map(dailyReport => (
            <DailyReportCard
              key={dailyReport.date}
              dailyReport={dailyReport}
            />
          ))}
        </>
      )}
    </>
  )
}
```

---

## useMissionReport Hook

```typescript
// src/action/mission/useMissionReport.ts

export type MissionDetail = {
  _id: string
  tel: string
  title: string
  type: string
  point: number
  status: string
  createDate: string
  completeDate?: string
  condition: string
}

export type DailyReport = {
  date: string
  summary: {
    totalMissions: number
    totalPoints: number
    completedMissions: number
    pendingMissions: number
  }
  missions: MissionDetail[]
}

export type MissionReportData = {
  summary: {
    totalMissions: number
    totalPoints: number
    completedMissions: number
    pendingMissions: number
  }
  dailyReports: DailyReport[]
}

const useMissionReport = (startDate: Date | null, endDate: Date | null) => {
  return useQuery({
    queryKey: ['missionReport', startDate, endDate],
    queryFn: async (): Promise<MissionReportData> => {
      if (!startDate || !endDate) {
        throw new Error('Date range is required')
      }

      const start = startDate.toISOString()
      const end = endDate.toISOString()

      const response = await fetch(
        `/api/reports/missions?start=${start}&end=${end}`
      )

      if (!response.ok) {
        throw new Error('Failed to fetch mission report')
      }

      return response.json()
    },
    enabled: !!startDate && !!endDate
  })
}
```

---

## API Implementation

### `/api/reports/missions/route.ts`

```typescript
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const start = searchParams.get('start')
    const end = searchParams.get('end')

    if (!start || !end) {
      return NextResponse.json(
        { error: 'Start and end dates are required' },
        { status: 400 }
      )
    }

    // Connect to MongoDB
    await connectDB()

    // Query mission logs in date range
    const missionLogs = await db.collection('tbl_mission_logs').find({
      createDate: {
        $gte: new Date(start),
        $lte: new Date(end)
      }
    }).toArray()

    // Calculate summary
    const summary = {
      totalMissions: missionLogs.length,
      totalPoints: missionLogs
        .filter(log => log.status === 'complete')
        .reduce((sum, log) => sum + (log.point || 0), 0),
      completedMissions: missionLogs.filter(log => log.status === 'complete').length,
      pendingMissions: missionLogs.filter(log => log.status === 'active').length
    }

    // Group by date
    const dailyReports = groupByDate(missionLogs)

    return NextResponse.json({
      summary,
      dailyReports
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function groupByDate(logs: any[]): DailyReport[] {
  const groups = new Map<string, any[]>()

  logs.forEach(log => {
    const date = new Date(log.createDate).toISOString().split('T')[0]
    if (!groups.has(date)) {
      groups.set(date, [])
    }
    groups.get(date)!.push(log)
  })

  return Array.from(groups.entries()).map(([date, missions]) => ({
    date,
    summary: {
      totalMissions: missions.length,
      totalPoints: missions
        .filter(m => m.status === 'complete')
        .reduce((sum, m) => sum + (m.point || 0), 0),
      completedMissions: missions.filter(m => m.status === 'complete').length,
      pendingMissions: missions.filter(m => m.status === 'active').length
    },
    missions: missions.map(m => ({
      _id: m._id,
      tel: m.tel,
      title: m.missionDetails?.title || '',
      type: m.missionDetails?.type || '',
      point: m.point || 0,
      status: m.status,
      createDate: m.createDate,
      completeDate: m.completeDate,
      condition: m.missionDetails?.condition || ''
    }))
  })).sort((a, b) => b.date.localeCompare(a.date))
}
```

---

## UI Components

### Summary Card

```typescript
const SummaryCard = ({ summary }) => (
  <Card>
    <CardContent>
      <h2>สรุปภาพรวม</h2>
      <Grid container spacing={2}>
        <Grid item xs={3}>
          <Stat label="ภารกิจทั้งหมด" value={summary.totalMissions} />
        </Grid>
        <Grid item xs={3}>
          <Stat label="สำเร็จ" value={summary.completedMissions} color="success" />
        </Grid>
        <Grid item xs={3}>
          <Stat label="กำลังทำ" value={summary.pendingMissions} color="warning" />
        </Grid>
        <Grid item xs={3}>
          <Stat label="คะแนนรวม" value={summary.totalPoints.toLocaleString()} />
        </Grid>
      </Grid>
    </CardContent>
  </Card>
)
```

### Daily Report Card

```typescript
const DailyReportCard = ({ dailyReport }) => (
  <Card>
    <CardContent>
      <h3>{formatDate(dailyReport.date)}</h3>
      <p>
        ภารกิจ: {dailyReport.summary.totalMissions} |
        สำเร็จ: {dailyReport.summary.completedMissions} |
        คะแนน: {dailyReport.summary.totalPoints}
      </p>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>เบอร์โทร</TableCell>
            <TableCell>ภารกิจ</TableCell>
            <TableCell>ประเภท</TableCell>
            <TableCell>คะแนน</TableCell>
            <TableCell>สถานะ</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {dailyReport.missions.map(mission => (
            <TableRow key={mission._id}>
              <TableCell>{mission.tel}</TableCell>
              <TableCell>{mission.title}</TableCell>
              <TableCell>{mission.type}</TableCell>
              <TableCell>{mission.point}</TableCell>
              <TableCell>
                <Chip
                  label={mission.status}
                  color={mission.status === 'complete' ? 'success' : 'default'}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </CardContent>
  </Card>
)
```

---

## Features

### ✅ สรุปข้อมูลรวม
- จำนวนภารกิจทั้งหมด
- จำนวนที่สำเร็จ/กำลังทำ
- คะแนนรวมที่แจกไป

### ✅ รายงานรายวัน
- แบ่งตามวันที่
- สรุปย่อยแต่ละวัน
- รายละเอียดภารกิจแต่ละรายการ

### ✅ Export Data
- Export เป็น Excel
- Export เป็น PDF (future)
- Export เป็น CSV

### ✅ Data Visualization (Future)
- Chart แสดงจำนวนภารกิจต่อวัน
- Graph คะแนนที่แจก
- Pie Chart สัดส่วน Mission Type

---

## Use Cases

### UC-1: ดูรายงานภารกิจเดือน พฤศจิกายน

```
1. Admin เข้าหน้า Report
2. เลือก Start Date: 1 พ.ย. 2568
3. เลือก End Date: 30 พ.ย. 2568
4. กด "ดูรายงาน"
5. เห็นสรุป:
   - ภารกิจทั้งหมด 150
   - สำเร็จ 100
   - คะแนนรวม 15,000
6. เห็นรายงานรายวันตั้งแต่ 1-30 พ.ย.
```

---

**Related Modules:**
- [03-MISSION.md](./03-MISSION.md) - ระบบภารกิจ
- [07-POINT.md](./07-POINT.md) - ระบบคะแนน
