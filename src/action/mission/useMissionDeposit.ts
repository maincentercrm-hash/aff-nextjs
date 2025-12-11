import { useQuery } from '@tanstack/react-query';

interface DepositResponse {
  deposit: number;
}

interface DepositData {
  totalDeposit: number;
  rawData?: DepositResponse;
}

interface DepositOptions {
  enabled?: boolean;
  staleTime?: number;
  refetchInterval?: number | false;
}

export const useMissionDeposit = (
  userId: string, // เปลี่ยนจาก lineId เป็น tel ตาม requirement
  lineAt: string,
  startDate: string,
  endDate: string,
  options: DepositOptions = {}
) => {
  // สร้าง query key ที่เป็น unique และครบถ้วน
  const queryKey = ['missionDeposit', userId, lineAt, startDate, endDate];

  return useQuery<DepositData>({
    queryKey,
    queryFn: async (): Promise<DepositData> => {
      // Validate inputs
      if (!startDate || !endDate || !userId || !lineAt) {
        console.warn('Missing required parameters:', { userId, lineAt, startDate, endDate });

        return { totalDeposit: 0 };
      }

      try {
        const headers = new Headers();

        headers.append("api-key", process.env.NEXT_PUBLIC_BASE_API_KEY as string);

        const missionStart = new Date(startDate);
        const missionEnd = new Date(endDate);

        if (isNaN(missionStart.getTime()) || isNaN(missionEnd.getTime())) {
          console.error('Invalid date provided:', { startDate, endDate });

          return { totalDeposit: 0 };
        }

        const startTimestamp = Math.floor(missionStart.getTime() / 1000);
        const endTimestamp = Math.floor(missionEnd.getTime() / 1000);

        /*
        console.log('Fetching deposit data:', {
          userId,
          lineAt,
          startTimestamp,
          endTimestamp,
          queryKey
        });

        */

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_API_URL}/players/v1/line/deposit?line_id=${userId}&line_at=${lineAt}&start_date=${startTimestamp}&end_date=${endTimestamp}`,
          {
            method: "GET",
            headers,

            // เพิ่ม cache control headers
            cache: 'no-cache'
          }
        );

        if (!response.ok) {
          throw new Error(`Network response was not ok: ${response.status}`);
        }

        const data: DepositResponse = await response.json();
        const totalDeposit = data.deposit;

        /*   console.log('Deposit data received:', {
             totalDeposit,
             rawData: data,
             queryKey
           });
           */

        return {
          totalDeposit,
          rawData: data
        };
      } catch (error) {
        console.error('Deposit mission data fetch error:', error);
        throw error;
      }
    },

    // React Query configuration
    staleTime: options.staleTime ?? 30 * 1000, // Default to 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: options.refetchInterval ?? 30 * 1000, // Auto refetch every 30 seconds
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: (failureCount) => {
      // Retry logic
      if (failureCount < 3) return true;

      return false;
    },
    enabled: options.enabled !== false && Boolean(startDate && endDate && userId && lineAt),
  });
};
