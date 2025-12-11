

const actionCampaignUpdate = async (table: string, campaign: string, key: string, userId: string) => {
  try {

    const response = await fetch("/api/campaignUpdate", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ table, campaign, key, userId })
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

export default actionCampaignUpdate;
