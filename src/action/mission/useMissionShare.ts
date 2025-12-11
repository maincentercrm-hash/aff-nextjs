import { useQuery } from '@tanstack/react-query';

// Interface definitions
interface PlayerBet {
  username: string;
  last_seen: string;
  created_at: string;
  bet_amount: number;
  commission_amount: number;
  affiliated_players: null | any;
  parent_commission_amount: number;
  child_commission_amount: number;
  parent_bet_amount: number;
  child_bet_amount: number;
}

interface PlayerSummary {
  date: string;
  amount: number;
}

interface ShareResponse {
  code: string;
  playerBets: PlayerBet[];
  playerSummaries: PlayerSummary[];
  [key: string]: any; // for other fields
}

interface ShareData {
  totalPlayers: number;
  rawData?: ShareResponse;
  debug?: {
    timeframe: {
      original: { start: string; end: string };
      adjusted: { startDay: string; endDay: string };
    };
    summaries: {
      all: PlayerSummary[];
      filtered: PlayerSummary[];
      dailyBreakdown: Array<{
        date: string;
        amount: number;
        included: boolean;
      }>;
    };
    calculation: {
      totalAmount: number;
      daysInRange: number;
    };
  };
}

interface ShareOptions {
  enabled?: boolean;
  staleTime?: number;
  retries?: number;
  refetchInterval?: number | false;
}

export const useMissionShare = (
  userId: string, // Changed from lineId to tel
  lineAt: string,
  missionStartDate: string,
  missionEndDate: string,
  options: ShareOptions = {}
) => {
  // Create a stable query key
  const queryKey = ['missionShare', userId, lineAt, missionStartDate, missionEndDate];

  return useQuery<ShareData>({
    queryKey,
    queryFn: async (): Promise<ShareData> => {
      // Validate required parameters
      if (!missionStartDate || !missionEndDate || !userId || !lineAt) {
        console.warn('Missing required parameters:', { userId, lineAt, missionStartDate, missionEndDate });

        return {
          totalPlayers: 0,
          debug: {
            timeframe: {
              original: { start: '', end: '' },
              adjusted: { startDay: '', endDay: '' }
            },
            summaries: {
              all: [],
              filtered: [],
              dailyBreakdown: []
            },
            calculation: {
              totalAmount: 0,
              daysInRange: 0
            }
          }
        };
      }

      try {
        const headers = new Headers();

        headers.append("API-KEY", process.env.NEXT_PUBLIC_BASE_API_KEY as string);

        /*  console.log('Fetching share data:', {
            userId,
            lineAt,
            missionStartDate,
            missionEndDate,
            queryKey
          });
  */
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_API_URL}/games/players/line/affiliate?line_id=${userId}&line_at=${lineAt}`,
          {
            method: "GET",
            headers,
            cache: 'no-cache' // Prevent browser caching
          }
        );

        if (!response.ok) {
          throw new Error(`API error: ${response.status} ${response.statusText}`);
        }

        const data: ShareResponse = await response.json();

        // Convert mission dates
        const missionStart = new Date(missionStartDate);
        const missionEnd = new Date(missionEndDate);

        if (isNaN(missionStart.getTime()) || isNaN(missionEnd.getTime())) {
          throw new Error('Invalid date format provided');
        }

        // Process unique players within timeframe
        const uniquePlayers = new Set(
          data.playerBets
            .filter(player => {
              const createdAt = new Date(player.created_at);


              return createdAt >= missionStart && createdAt <= missionEnd;
            })
            .map(player => player.username)
        );

        const totalPlayers = uniquePlayers.size;
        const daysInRange = Math.ceil((missionEnd.getTime() - missionStart.getTime()) / (1000 * 60 * 60 * 24));

        // Create daily breakdown
        const dailyBreakdown = data.playerBets
          .filter(player => {
            const createdAt = new Date(player.created_at);


            return createdAt >= missionStart && createdAt <= missionEnd;
          })
          .map(player => ({
            date: player.created_at,
            amount: 1,
            included: true
          }));

        // Create filtered summaries
        const filteredSummaries = Array.from(uniquePlayers).map(username => ({
          date: data.playerBets.find(player => player.username === username)?.created_at || '',
          amount: 1
        }));

        // Debug information
        const debugInfo = {
          timeframe: {
            original: {
              start: missionStart.toISOString(),
              end: missionEnd.toISOString()
            },
            adjusted: {
              startDay: missionStart.toISOString(),
              endDay: missionEnd.toISOString()
            }
          },
          summaries: {
            all: data.playerSummaries || [],
            filtered: filteredSummaries,
            dailyBreakdown
          },
          calculation: {
            totalAmount: totalPlayers,
            daysInRange
          }
        };

        /*  console.log('Share data processed:', {
            totalPlayers,
            debugInfo,
            queryKey
          });
  */
        return {
          totalPlayers,
          rawData: data,
          debug: debugInfo
        };

      } catch (error) {
        console.error('Share mission data fetch error:', error);
        throw error instanceof Error
          ? error
          : new Error('Unknown error occurred while fetching share mission data');
      }
    },

    // React Query configuration
    staleTime: options.staleTime ?? 30 * 1000, // Default 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: options.refetchInterval ?? 30 * 1000, // Auto refetch every 30 seconds
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: (failureCount) => {
      if (failureCount < (options.retries ?? 3)) return true;

      return false;
    },
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    enabled: options.enabled !== false && Boolean(missionStartDate && missionEndDate && userId && lineAt),
  });
};

// Export types
export type { ShareResponse, ShareData, ShareOptions, PlayerSummary };
