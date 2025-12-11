const actionPoint = async (table: string, data: any) => {

  try {

    const response = await fetch("/api/point", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ table: table, data: data })
    });


    if (!response.ok) {
      throw new Error("Failed Update");
    }

    const responseData = await response.json();


    return responseData;
  } catch (error) {
    console.error("Error Update:", error);
    throw error;
  }
};

export default actionPoint;
