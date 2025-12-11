import type { ReactNode } from "react"

type propsContainer = {
  children?: ReactNode;
  bg?: string;  // เปลี่ยนเป็น optional prop โดยใส่ ?
}

const LiffBox = ({ children, bg }: propsContainer) => {
  // สร้าง style object ตามเงื่อนไขการมี bg
  const containerStyle = bg ? {
    backgroundImage: `url("${bg}")`,
    backgroundSize: 'cover',
    backgroundPosition: 'top'
  } : undefined;

  return (
    <div
      className="block my-auto min-h-auto bg-gray-200 p-6"
      style={containerStyle}
    >
      <div className="grid gap-4">
        {children}
      </div>
    </div>
  )
}

export default LiffBox
