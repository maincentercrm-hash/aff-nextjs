const actionDelete = async (table: string, id: string) => {

  try {

    const response = await fetch("/api/delete", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ table: table, id: id })
    });

    if (!response.ok) {
      throw new Error("Failed Delete");
    }

    const responseData = await response.json();

    return responseData;
  } catch (error) {
    console.error("Error Delete:", error);
    throw error;
  }

};


export default actionDelete;
