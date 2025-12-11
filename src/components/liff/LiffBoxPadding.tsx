import type { ReactNode } from "react"



type propsContainer = {
  children?: ReactNode;
  cols?: number;
}

const LiffBoxPadding = ({ children, cols }: propsContainer) => {
  return (
    <div className="block my-auto min-h-auto px-6 relative">
      <div className={`grid bg-white shadow-xl gap-4 p-4 rounded-lg  max-h-[100%] grid-cols-${cols || 1}`}>
        {children}
      </div>
    </div >
  )
}

export default LiffBoxPadding
