
import Image from "next/image"

type propsContainer = {
  img: string;
  obj: string;
}

const LiffBoxImg = ({ img, obj }: propsContainer) => {
  return (
    <div className='block my-auto w-full min-h-auto relative'>
      <Image src={img} alt='' layout="responsive" width={100} height={100}></Image>
      <img src={obj} className=" absolute -translate-y-1/2 -translate-x-1/2 top-[35%] left-1/2"></img>
    </div >
  )
}

export default LiffBoxImg
