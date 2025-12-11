# Support Module (ระบบช่วยเหลือ/FAQ)

## ภาพรวม

Support Module เป็นคลังความรู้และคำถามที่พบบ่อย (FAQ) สำหรับช่วยเหลือผู้ใช้ รองรับเนื้อหาแบบ Rich Text ด้วย Draft.js Editor

---

## Collection: `tbl_support`

### Schema

```typescript
interface Support {
  _id: ObjectId
  thumbnail: string       // รูปภาพปก
  title: string           // หัวข้อ
  detail: string          // เนื้อหาแบบ Rich Text (HTML/JSON)
  status: string          // 'publish' | 'pending'
  createDate: Date
}
```

---

## ไฟล์และที่ตั้ง

### Dashboard
```
src/app/(dashboard)/dashboard/support/
  └── page.tsx

src/components/dashboard/support/
  ├── MainSupport.tsx                   # Component หลัก
  ├── TableSupport.tsx                  # ตารางบทความ
  ├── DialogCreate.tsx                  # สร้างบทความ
  ├── DialogEdit.tsx                    # แก้ไขบทความ
  ├── DialogDelete.tsx                  # ลบบทความ
  ├── Editor.tsx                        # Rich Text Editor wrapper
  ├── EditorControlled.tsx              # Controlled Editor
  ├── AppReactDraftWysiwyg.tsx          # Draft.js component
  └── fileUpload.tsx                    # Upload รูปภาพ
```

### LIFF
```
src/app/(liff)/liff/support/
  └── page.tsx                          # หน้าแสดงบทความ
```

---

## Rich Text Editor (Draft.js)

### Dependencies

```json
{
  "draft-js": "^0.11.7",
  "react-draft-wysiwyg": "^1.15.0"
}
```

### Editor Features

```typescript
// Toolbar options
const toolbarOptions = {
  options: [
    'inline',      // Bold, Italic, Underline
    'blockType',   // H1, H2, H3, Paragraph
    'fontSize',    // Font size
    'list',        // Ordered/Unordered list
    'textAlign',   // Left, Center, Right
    'colorPicker', // Text color
    'link',        // Insert link
    'image',       // Insert image
    'history'      // Undo/Redo
  ],
  inline: {
    options: ['bold', 'italic', 'underline', 'strikethrough']
  },
  blockType: {
    options: ['Normal', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6']
  },
  list: {
    options: ['unordered', 'ordered']
  }
}
```

---

## การทำงาน

### 1. Admin สร้างบทความช่วยเหลือ

**Flow:**
```
1. Admin เข้า /dashboard/support
   ↓
2. คลิก "เพิ่มข้อมูล"
   ↓
3. กรอกข้อมูลใน DialogCreate:
   ┌──────────────────────────────────────┐
   │ • Upload รูปภาพปก                    │
   │ • หัวข้อ: "วิธีแลก Point"            │
   │ • เนื้อหา: [Rich Text Editor]       │
   │   ┌────────────────────────────────┐ │
   │   │ [B] [I] [U] H1 H2 • 1. [Link] │ │
   │   │ ────────────────────────────── │ │
   │   │                                │ │
   │   │ # วิธีแลก Point                │ │
   │   │                                │ │
   │   │ 1. เข้าหน้า Point              │ │
   │   │ 2. เลือกของรางวัล              │ │
   │   │ 3. กดแลก                       │ │
   │   │                                │ │
   │   └────────────────────────────────┘ │
   │ • สถานะ: Publish                    │
   └──────────────────────────────────────┘
   ↓
4. บันทึกลง tbl_support
   - detail จะเก็บเป็น HTML หรือ JSON
   ↓
5. แสดงใน LIFF ทันที
```

---

### 2. ผู้ใช้ดูบทความ

**Flow:**
```
1. ผู้ใช้เข้า /liff/support
   ↓
2. ดึงข้อมูล tbl_support ที่ status = 'publish'
   ↓
3. แสดงเป็น Card List:
   ┌──────────────────────────────────┐
   │ [รูปภาพ]                         │
   │ วิธีแลก Point                    │
   │ คำถามที่พบบ่อยเกี่ยวกับ...       │
   │              [อ่านต่อ]           │
   └──────────────────────────────────┘
   ↓
4. คลิก "อ่านต่อ"
   ↓
5. แสดงเนื้อหาเต็ม (Render HTML/Rich Text)
```

---

## Component Structure

### DialogCreate

```typescript
const DialogCreate = ({ structure, initDefault }) => {
  const [editorState, setEditorState] = useState(
    EditorState.createEmpty()
  )
  const [formData, setFormData] = useState({
    title: '',
    thumbnail: '',
    status: 'publish'
  })

  const handleSubmit = async () => {
    // Convert editor state to HTML
    const contentState = editorState.getCurrentContent()
    const html = convertToHTML(contentState)

    const data = {
      ...formData,
      detail: html,
      createDate: new Date()
    }

    await actionCreate('tbl_support', data)
    toast.success('บันทึกเรียบร้อย')
  }

  return (
    <Dialog open={open}>
      <DialogContent>
        <TextField
          label="หัวข้อ"
          value={formData.title}
          onChange={(e) => setFormData({...formData, title: e.target.value})}
        />

        <FileUpload
          onUpload={(url) => setFormData({...formData, thumbnail: url})}
        />

        <AppReactDraftWysiwyg
          editorState={editorState}
          onEditorStateChange={setEditorState}
          toolbar={toolbarOptions}
        />

        <Select
          value={formData.status}
          onChange={(e) => setFormData({...formData, status: e.target.value})}
        >
          <MenuItem value="publish">Publish</MenuItem>
          <MenuItem value="pending">Pending</MenuItem>
        </Select>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleSubmit}>บันทึก</Button>
      </DialogActions>
    </Dialog>
  )
}
```

---

### LIFF Support Page

```typescript
const Page = () => {
  const items = useReadKey('tbl_support', 'status', 'publish')
  const [selectedItem, setSelectedItem] = useState(null)

  if (items.status === 'pending') return <Loading />

  return (
    <>
      <NavTop title="SUPPORT" />

      {!selectedItem ? (
        // List view
        <div className="grid gap-4 p-4">
          {items.data?.map(item => (
            <Card key={item._id} onClick={() => setSelectedItem(item)}>
              <CardMedia image={item.thumbnail} />
              <CardContent>
                <h3>{item.title}</h3>
                <Button>อ่านต่อ</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        // Detail view
        <div className="p-4">
          <Image src={selectedItem.thumbnail} />
          <h1>{selectedItem.title}</h1>

          {/* Render Rich Text */}
          <div
            dangerouslySetInnerHTML={{ __html: selectedItem.detail }}
            className="prose"
          />

          <Button onClick={() => setSelectedItem(null)}>
            กลับ
          </Button>
        </div>
      )}
    </>
  )
}
```

---

## Rich Text Storage Format

### Option 1: HTML

```typescript
// Save as HTML
const html = convertToHTML(editorState.getCurrentContent())
// "<h1>หัวข้อ</h1><p>เนื้อหา...</p>"

// Display
<div dangerouslySetInnerHTML={{ __html: detail }} />
```

### Option 2: JSON (Draft.js Raw)

```typescript
// Save as JSON
const raw = convertToRaw(editorState.getCurrentContent())
const json = JSON.stringify(raw)

// Load
const contentState = convertFromRaw(JSON.parse(json))
const editorState = EditorState.createWithContent(contentState)
```

---

## Structure Definition

```typescript
const structure = {
  title: 'เพิ่มข้อมูล',
  table: 'tbl_support',
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
      id: 'detail',
      type: 'richtext',  // Special type for Rich Text Editor
      label: 'เนื้อหา'
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

## Features

### ✅ Rich Text Editor
- Bold, Italic, Underline
- Headings (H1-H6)
- Lists (Ordered/Unordered)
- Links
- Images
- Text Alignment
- Colors

### ✅ Image Support
- Upload รูปภาพปก
- Insert รูปภาพในเนื้อหา

### ✅ Category (Future)
- แยกหมวดหมู่ (FAQ, Tutorial, etc.)

### ✅ Search (Future)
- ค้นหาบทความ

---

## Use Cases

### UC-1: Admin สร้าง FAQ "วิธีแลก Point"

```
1. Admin เข้า /dashboard/support
2. คลิก "เพิ่มข้อมูล"
3. กรอก:
   - หัวข้อ: "วิธีแลก Point"
   - ใช้ Rich Text Editor เขียนขั้นตอน
   - เพิ่มรูปภาพประกอบ
4. เลือก Status: Publish
5. บันทึก
```

### UC-2: ผู้ใช้ค้นหาวิธีแลก Point

```
1. ผู้ใช้เข้า /liff/support
2. เห็นบทความ "วิธีแลก Point"
3. คลิกอ่าน
4. เห็นขั้นตอนพร้อมรูปภาพ
5. ทำตามได้
```

---

## Styling Rich Text Content

```css
/* CSS สำหรับ Rich Text */
.prose {
  /* Typography */
  font-size: 16px;
  line-height: 1.6;
  color: #333;
}

.prose h1 { font-size: 2em; font-weight: bold; margin-top: 1em; }
.prose h2 { font-size: 1.5em; font-weight: bold; margin-top: 0.8em; }
.prose h3 { font-size: 1.2em; font-weight: bold; margin-top: 0.6em; }

.prose p { margin: 1em 0; }

.prose ul, .prose ol {
  margin-left: 1.5em;
  margin-bottom: 1em;
}

.prose a {
  color: #1976d2;
  text-decoration: underline;
}

.prose img {
  max-width: 100%;
  height: auto;
  margin: 1em 0;
}
```

---

**Related Modules:**
- [01-ONLINE-MARKETING.md](./01-ONLINE-MARKETING.md) - ระบบข่าวสาร
- [02-COMMUNITY.md](./02-COMMUNITY.md) - ระบบ Community
