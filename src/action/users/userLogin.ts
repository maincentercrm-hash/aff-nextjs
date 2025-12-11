'use server'

//import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation';



const userLogin = async (userLogin: any) => {

  // console.log(`${process.env.NEXT_PUBLIC_APP_URL}/api/users/login`)

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userLogin)
    });


    if (!response.ok) {
      throw new Error('Failed Login');
    }

    const responseData = await response.json();

    // console.log('data response : ', responseData)

    if (responseData.token) {
      cookies().set('token', responseData.token);
      // eslint-disable-next-line import/no-named-as-default-member
      redirect('/dashboard');
    }

    return responseData;
  } catch (error) {
    console.error('Error Login User:', error);
    throw error;
  }

};

export default userLogin;
