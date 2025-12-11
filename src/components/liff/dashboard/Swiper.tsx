import { useState, useEffect } from 'react'

import Image from 'next/image'
import Link from 'next/link'

import { useKeenSlider } from 'keen-slider/react'

import type { Config } from '@/types/typeConfig'

type propsSwiper = {
  configs: Config | null;
}

const Swiper = ({ configs }: propsSwiper) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [currentSlide, setCurrentSlide] = useState(0)
  const [loaded, setLoaded] = useState(false)

  const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>({
    slides: {
      perView: 1.2,
      spacing: 20,
    },
    initial: 0,
    loop: true, // เพิ่ม loop
    dragSpeed: 1,
    slideChanged(slider) {
      setCurrentSlide(slider.track.details.rel)
    },
    created() {
      setLoaded(true)
    },
  })

  // Auto play
  useEffect(() => {
    if (loaded && instanceRef.current) {
      const interval = setInterval(() => {
        instanceRef.current?.next()
      }, 3000) // auto slide ทุก 3 วินาที

      // Cleanup interval เมื่อ component unmount
      return () => {
        clearInterval(interval)
      }
    }
  }, [loaded, instanceRef])

  // ถ้าไม่มี slider config ไม่ต้องแสดง component
  if (!configs?.slider || Object.keys(configs.slider).length === 0) {
    return null
  }

  return (
    <div ref={sliderRef} className='keen-slider flex overflow-hidden p-4'>
      {Object.entries(configs.slider).map(([key, slider]) => (
        <Link
          key={key}
          href={slider.url}
          className="keen-slider__slide rounded-lg overflow-hidden"
        >
          <Image
            src={slider.image}
            alt={`Slide ${key}`}
            width={600}
            height={300}
            className="w-full h-auto object-cover"
            priority={true}  // เพิ่ม priority เพื่อให้โหลดรูปเร็วขึ้น
          />
        </Link>
      ))}
    </div>
  )
}

export default Swiper
