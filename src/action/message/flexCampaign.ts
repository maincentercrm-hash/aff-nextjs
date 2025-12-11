const flexCampaign = async (data: any, id: string, thumbnail: string) => {

  try {
    const response = await fetch("/api/flexCampaign", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        data: data,
        id: id,
        thumbnail: thumbnail,
      })
    });

    if (!response.ok) {
      throw new Error('Failed to Flex Campaign');
    }

    const responseData = await response.json();


    return responseData;

  } catch (error) {
    console.error('Error Flex Campaign:', error);
    throw error;
  }


};

export default flexCampaign;
