

const actionUpload = async (table: string, data: any) => {
  try {

    const response = await fetch("/api/create", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ table, data })
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

export default actionUpload;
