const actionCampaign = async (target: string) => {
  try {
    const response = await fetch(`/api/campaign/${target}`);

    if (!response.ok) {
      throw new Error('Failed Campaign');
    }

    const responseData = await response.json();

    return responseData;
  } catch (error) {
    console.error('Error Campaign:', error);
    throw error;
  }
};

export default actionCampaign;
