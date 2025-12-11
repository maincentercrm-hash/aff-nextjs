const serverRead = async (table: string, id: string) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/readBy/${table}/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed Find Link');
    }

    const responseData = await response.json();

    return responseData;
  } catch (error) {
    console.error('Error Find Link:', error);
    throw error;
  }
};


export default serverRead;

export const dynamic = "force-dynamic";
