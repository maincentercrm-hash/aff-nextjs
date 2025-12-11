'use server'

import { cookies } from 'next/headers'

const userLogout = async () => {

  cookies().delete('token')

  return;
};

export default userLogout;
