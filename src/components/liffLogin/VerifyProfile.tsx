'use client'

import { createContext, useEffect, useState } from "react";

import { liff } from '@line/liff'

import type { ChildrenType } from '@core/types'

import { initLiff } from '@/action/users/lineLiff'

import type { LineProfileType } from '@/types/liffType'
import actionCreateBy from "@/action/crud/createBy";

export const LineProfile = createContext<any>(null);

const VerifyProfile = ({ children }: ChildrenType) => {
  const liffId = process.env.NEXT_PUBLIC_LIFF_ID || ''; // Store your LIFF ID in environment variables


  const [userId, setUserId] = useState<LineProfileType>()

  const [userIdLine, setUserIdLine] = useState<string>('')

  useEffect(() => {
    const initializeLiff = async () => {
      await initLiff(liffId);

      if (!liff.isLoggedIn()) {
        liff.login();
      } else {
        const profile = await liff.getProfile() as LineProfileType;

        const res = await actionCreateBy('tbl_client', profile, 'userId')




        setUserIdLine(profile.userId)


        setUserId(res._id)
      }
    };

    initializeLiff();
  }, [liffId]);


  return (
    <>

      {userId &&

        <LineProfile.Provider value={{
          userId, userIdLine,
        }}>

          {children}

        </LineProfile.Provider>

      }
    </>
  )

}

export default VerifyProfile
