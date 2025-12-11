import { useQuery } from "@tanstack/react-query";

const useReadBy = (table: string, id: string) => {

  return useQuery({
    queryKey: [table, id],
    queryFn: async () => {
      const response = await fetch(`/api/readBy/${table}/${id}`);

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      return response.json() as Promise<any>;
    }
  });

};


export default useReadBy;
