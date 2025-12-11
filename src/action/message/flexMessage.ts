const flexMessage = async (userId: string, data: any) => {

  try {
    const response = await fetch("/api/flexMessage", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId: userId,
        data: data
      })
    });

    if (!response.ok) {
      throw new Error('Failed to Flex Message');
    }

    const responseData = await response.json();


    return responseData;

  } catch (error) {
    console.error('Error Flex Message:', error);
    throw error;
  }


};

export default flexMessage;
