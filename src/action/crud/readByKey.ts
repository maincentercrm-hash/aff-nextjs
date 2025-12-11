import { useQuery } from "@tanstack/react-query";

const useReadKey = (table: string, key: string, value: string) => {

  return useQuery({
    queryKey: [table, key, value],
    queryFn: async () => {
      const response = await fetch(`/api/readKey/${table}/${key}/${value}`);

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      return response.json() as Promise<any>;
    }
  });

};


export default useReadKey;
