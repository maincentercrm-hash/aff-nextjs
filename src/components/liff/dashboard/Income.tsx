import isNumber from "@/fn/isNumber";



type propsIncom = {
  today: number;
  total: number;
}

const Income = ({ today, total }: propsIncom) => {


  return (

    <div className="grid grid-cols-2 text-center bg-white rounded-xl p-4 mb-auto shadow-xs">

      <div className=" border-r-2 border-solid border-r-gray-200">
        <p>รายได้วันนี้</p>
        <p className="text-2xl font-bold">{isNumber(today)}</p>
        <p className="text-sm font-bold">บาท</p>
      </div>

      <div className="">
        <p>รายได้ทั้งหมด</p>
        <p className="text-2xl font-bold">{isNumber(total)}</p>
        <p className="text-sm font-bold">บาท</p>
      </div>

    </div>

  )
}

export default Income
