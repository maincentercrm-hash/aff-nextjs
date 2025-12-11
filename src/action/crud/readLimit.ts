import { useQuery } from "@tanstack/react-query";

const useReadLimit = (table: string) => {

  return useQuery({
    queryKey: [table, 'chart'],
    queryFn: async () => {
      const response = await fetch(`/api/readLimit/${table}`);

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      return response.json();
    }
  });

};


export default useReadLimit;
