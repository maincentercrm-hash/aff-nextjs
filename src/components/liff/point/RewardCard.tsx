
import Image from "next/image"

import type { TypePoint } from "@/types/typePoint"
import DialogReward from "./DialogReward";

type propsRewardCard = {
  items: TypePoint[]
  currentPoint: number;
  tel: string;
  userId: string;
}

const RewardCard = ({ items, currentPoint, tel, userId }: propsRewardCard) => {
  return (
    <>
      {
        items.map((item, index) => (
          <div key={index} className="grid shadow-sm border-[1px] border-gray-200 rounded-md overflow-hidden">
            <Image src={item.thumbnail} alt={item.title} layout="responsive" width={80} height={80} />
            <div className="p-2 grid grid-cols-[80%_20%]">
              <div className="block">
                <p className="text-[12px] font-bold">{item.title}</p>
                <p className="text-xs font-bold">{item.point} P</p>
              </div>
              <div className="flex">

                <DialogReward data={item} currentPoint={currentPoint} tel={tel} userId={userId} />


              </div>
            </div>
          </div>
        ))
      }
    </>
  )
}

export default RewardCard
