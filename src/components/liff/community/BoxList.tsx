import Image from "next/image"

import Button from "@mui/material/Button";

type propsBoxList = {
  items: {
    img: string;
    title: string;
    excerpt: string;
    category: string;
    url: string;
  }[]
}



const BoxList = ({ items }: propsBoxList) => {

  const categoryImages: { [key: string]: string } = {
    facebook: '/images/social/facebook.png',
    line: '/images/social/line.png',
    telegram: '/images/social/telegram.png',
    other: '/images/social/telegram.png'
  };

  return (
    <div className="grid gap-2">
      {items.map((item, index) => (
        <div key={index} className="grid grid-cols-[15%_1fr] gap-4">


          <Image
            src={categoryImages[item.category] || item.img}
            alt={item.title}
            width={100}
            height={100}
            layout="responsive"
            className="rounded-md"
          />

          <div className="flex">
            <div className="block">
              <p className="text-md font-bold">{item.title}</p>
              <p className="text-sm">{item.excerpt}</p>
            </div>
            <Button
              variant='contained'
              size='small'
              className='my-auto ml-auto'
              href={item.url}
              target="_blank"
            >
              คลิก
            </Button>

          </div>
        </div>
      ))}
    </div>
  )
}

export default BoxList
