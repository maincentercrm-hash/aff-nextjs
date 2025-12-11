import Image from "next/image";

import type { TypeMarketing } from "@/types/typeMarketing";
import GetDateTimeOnly from "@/views/getDateTimeOnly";

type propsContent = {
  data: TypeMarketing;
}

function ContentPage({ data }: propsContent) {
  return (
    <>
      <Image src={data.thumbnail} alt={data.title} layout="responsive" width={80} height={80} />
      <div className='py-2 px-4'>
        <p className="text-sm flex"><i className="tabler-calendar-clock text-[18px]"></i><span className="my-auto"><GetDateTimeOnly isoDate={data.createDate.toLocaleString()} /></span></p>
        <h3>{data.title}</h3>

        <p className="mt-4">{data.detail}</p>
      </div>
    </>

  )
}

export default ContentPage

export const dynamic = "force-dynamic";
