// actions/point/updateStatus.ts
const updatePointStatus = async (id: string, status: string) => {
  try {
    const response = await fetch("/api/update", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        table: 'tbl_point_logs',
        data: {
          _id: id,
          status: status
        }
      })
    });

    if (!response.ok) {
      throw new Error("Failed to update status");
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating status:", error);
    throw error;
  }
};

export default updatePointStatus;
