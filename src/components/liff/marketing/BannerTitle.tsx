

type propsBannerTitle = {
  init: {
    img?: string;
    title?: string;
    excerpt?: string;
  }
}

const BannerTitle = ({ init }: propsBannerTitle) => {
  return (
    <div className={`text-center pb-16 text-white`}>
      {init.img &&
        <img src={init.img} alt={init.title || ''} className="w-[150px]" />
      }
      <h1 className="text-2xl font-bold">{init.title}</h1>
      <p className="text-xl font-bold">{init.excerpt}</p>
    </div>
  )
}

export default BannerTitle
