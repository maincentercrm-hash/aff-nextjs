

type propsSectionPoint = {
  init: {
    img?: string;
    point?: number;
    title?: string;
  }
}

const SectionPoint = ({ init }: propsSectionPoint) => {



  return (
    <div className={`text-center pb-16`}>

      {init.img &&
        <img src={init.img} alt={init.title || ''} className="max-w-[150px]"></img>
      }
      <h1 className="text-2xl font-bold bg-black rounded-full max-w-[50%] mx-auto text-[#D1FF17]">{init.point} P</h1>
      <p className="text-xl font-bold">{init.title}</p>
    </div>
  )
}

export default SectionPoint
