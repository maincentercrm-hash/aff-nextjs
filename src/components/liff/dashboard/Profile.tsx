import { useEffect } from "react";

import Image from "next/image";

import { useSearchParams } from 'next/navigation'

import PhoneInput from "./PhoneInput";

import actionCampaignUpdate from "@/action/crud/campaignUpdate";


type profileProps = {
  pictureUrl: string;
  tel: string;
  displayName: string;
  userId: string;
}

const Profile = ({ pictureUrl, tel, displayName, userId }: profileProps) => {




  const searchParams = useSearchParams()
  const campaign = searchParams.get('campaign')


  useEffect(() => {



    if (campaign) {

      // console.log('have campaign')

      const handleCampaign = async () => {
        await actionCampaignUpdate('tbl_campaign', campaign, 'click', userId)

        //console.log(res)
      }

      handleCampaign()
    }



  }, [])


  return (
    <div className="block text-center mt-4">

      <Image src={pictureUrl} width={100} height={100} alt={displayName} className=" rounded-full shadow-sm"></Image>

      {
        (tel === undefined || tel === null) ? (
          <>
            <PhoneInput campaign={campaign} activeId={userId} />

            <p className="text-2xl font-bold">กรุณาผูกเบอร์โทรศัพท์</p>
          </>

        ) : (
          <p className="text-4xl font-bold text-white">{tel}</p>
        )
      }

      <p className="text-sm text-white">{displayName}</p>

    </div>
  )
}

export default Profile


