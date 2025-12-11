import type { ReactNode } from "react"



type propsContainer = {
  children: ReactNode;
  cols?: number;
}

const LiffBoxRound = ({ children, cols }: propsContainer) => {
  return (
    <div className="block my-auto min-h-auto bg-white p-6 rounded-t-[50px] -mt-[50px]">
      <div className={`grid gap-4 grid-cols-${cols || 1}`}>
        {children}
      </div>
    </div >
  )
}

export default LiffBoxRound
