
const actionCreateBy = async (table: string, data: any, key: string) => {
  try {

    const response = await fetch("/api/createBy", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ table, data, key })
    });

    if (!response.ok) {
      throw new Error('Failed Create');
    }

    const responseData = await response.json();


    return responseData;
  } catch (error) {
    console.error('Error Create:', error);
    throw error;
  }
};

export default actionCreateBy;
