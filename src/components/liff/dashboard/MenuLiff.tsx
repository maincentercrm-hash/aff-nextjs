import Image from "next/image";
import Link from "next/link";


type propsMenuLiff = {
  menuItems: {
    title: string;
    img: string;
    url: string;
  }[]
}

const MenuLiff = ({ menuItems }: propsMenuLiff) => {




  return (
    <div className="mt-12 grid grid-cols-3 gap-6 text-center">
      {menuItems.map((item, index) => (
        <Link key={index} href={item.url} title={item.title} className="">
          <Image src={item.img} width={80} height={80} alt={item.title} />
          <p className="text-sm">{item.title}</p>

        </Link>
      ))}
    </div>
  )
}

export default MenuLiff
