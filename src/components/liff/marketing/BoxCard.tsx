
import type { TypeMarketing } from "@/types/typeMarketing"
import DialogMarketing from "./DialogMarketing"

import LinkDownload from "./LinkDownload"

type propsBoxCard = {
  items: TypeMarketing[]
}

const BoxCard = ({ items }: propsBoxCard) => {


  return (
    <>
      {
        items.map((item, index) => (
          <div key={index} className="grid shadow-sm border-[1px] border-gray-200 rounded-md overflow-hidden">
            <DialogMarketing data={item} />
            <div className="p-2 grid grid-cols-[80%_20%]">
              <div className="block">
                <p className="text-[12px] font-bold">{item.title}</p>
                <p className="text-xs">{item.excerpt}</p>
              </div>
              <div className="flex relative">


                <LinkDownload url={item.file_download ? item.file_download : item.thumbnail} />


              </div>
            </div>
          </div>
        ))
      }
    </>
  )
}

export default BoxCard
