import { useQuery } from "@tanstack/react-query";

const useRead = (table: string) => {

  return useQuery({
    queryKey: [table],
    queryFn: async () => {
      const response = await fetch(`/api/read/${table}`);

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      return response.json();
    }
  });

};


export default useRead;
