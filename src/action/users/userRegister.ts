
import type { typeRegister } from "@/types/usersTypes"

const userRegister = async (userRegister: typeRegister) => {

  try {
    const response = await fetch("/api/users/register", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userRegister)
    });

    if (!response.ok) {
      throw new Error('Failed Register');
    }

    const responseData = await response.json();

    return responseData;
  } catch (error) {
    console.error('Error Register User:', error);
    throw error;
  }

};


export default userRegister;
