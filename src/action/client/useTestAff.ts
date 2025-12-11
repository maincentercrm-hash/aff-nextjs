import { useEffect, useState } from 'react';

// Types จากของเดิม
interface PlayerBet {
  username: string;
  last_seen: string;
  created_at: string;
  bet_amount: number;
  commission_amount: number;
  affiliated_players: any | null;
  parent_commission_amount: number;
  child_commission_amount: number;
  parent_bet_amount: number;
  child_bet_amount: number;
}

interface AffiliateData {
  code: string;
  commissionPercent: number;
  deepCommissionPercent: number;
  playerCount: number;
  playerDeepCount: number;
  playerBetsSummary: number;
  playerBetsDeepSummary: number;
  commission: number;
  commissionDeep: number;
  wallet: number;
  playerBets: PlayerBet[];
  amountSummaries: { date: string; amount: number; }[];
  playerSummaries: { date: string; amount: number; }[];
  playerSummariesByDate: {
    date: string;
    players: {
      playerID: string;
      username: string;
      bet_amount: number;
      amount: number;
    }[];
  }[];
  playerIncomeByDate: {
    date: string;
    data: {
      username: string;
      bet_amount: number;
      commission_amount: number;
      affiliated_players: any[];
    }[];
  }[];
}

// สร้างข้อมูล Mock
const generateMockData = (startDate: Date): AffiliateData => {
  const dates = Array.from({ length: 30 }, (_, i) => {
    const date = new Date(startDate);

    date.setDate(date.getDate() - i);

    return date;
  });

  const users = [
    "0625922563", "0645571756", "0891234567",
    "0823456789", "0634567890", "0945678901"
  ];

  const playerBets: PlayerBet[] = dates.flatMap(date => {
    // สุ่มจำนวน users ต่อวัน (2-5 คน)
    const dailyUsers = users
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.floor(Math.random() * 4) + 2);

    return dailyUsers.map(username => ({
      username,
      last_seen: date.toISOString(),
      created_at: date.toISOString(),
      bet_amount: Math.floor(Math.random() * 5000) + 1000, // 1000-6000
      commission_amount: Math.floor(Math.random() * 200) + 50, // 50-250
      affiliated_players: null,
      parent_commission_amount: Math.floor(Math.random() * 200) + 50,
      child_commission_amount: 0,
      parent_bet_amount: Math.floor(Math.random() * 5000) + 1000,
      child_bet_amount: 0
    }));
  });

  // คำนวณ total commission และ wallet
  const totalCommission = playerBets.reduce((sum, bet) => sum + bet.commission_amount, 0);

  return {
    code: "Awj75n7zrM",
    commissionPercent: 5,
    deepCommissionPercent: 1,
    playerCount: playerBets.length,
    playerDeepCount: 0,
    playerBetsSummary: playerBets.reduce((sum, bet) => sum + bet.bet_amount, 0),
    playerBetsDeepSummary: 0,
    commission: totalCommission,
    commissionDeep: 0,
    wallet: totalCommission,
    playerBets,
    amountSummaries: dates.map(date => ({
      date: date.toISOString(),
      amount: Math.floor(Math.random() * 8) + 2 // 2-10 users per day
    })),
    playerSummaries: dates.map(date => ({
      date: date.toISOString(),
      amount: Math.floor(Math.random() * 8) + 2
    })),
    playerSummariesByDate: dates.map(date => {
      const dailyPlayers = playerBets
        .filter(bet => new Date(bet.created_at).toDateString() === date.toDateString())
        .map(bet => ({
          playerID: Math.random().toString(36).substring(7),
          username: bet.username,
          bet_amount: bet.bet_amount,
          amount: bet.commission_amount
        }));

      return {
        date: date.toISOString().split('T')[0],
        players: dailyPlayers
      };
    }),
    playerIncomeByDate: dates.map(date => {
      const dailyBets = playerBets
        .filter(bet => new Date(bet.created_at).toDateString() === date.toDateString());

      return {
        date: date.toLocaleDateString('th-TH'),
        data: dailyBets.map(bet => ({
          username: bet.username,
          bet_amount: bet.bet_amount,
          commission_amount: bet.commission_amount,
          affiliated_players: []
        }))
      };
    })
  };
};

interface UseAffiliateOptions {
  enabled?: boolean;
}

export const useTestAff = (
  lineId: string,
  testDate: Date,
  options: UseAffiliateOptions = {}
) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AffiliateData | null>(null);

  // สร้างฟังก์ชัน format amount
  const formatAmount = (amount: number): string => {
    return new Intl.NumberFormat('th-TH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  // จำลองการเรียก API
  useEffect(() => {
    if (options.enabled === false) {
      setIsLoading(false);

      return;
    }

    const fetchData = async () => {
      setIsLoading(true);

      try {
        // จำลองการดึงข้อมูล
        await new Promise(resolve => setTimeout(resolve, 1000));
        const mockData = generateMockData(testDate);

        setData(mockData);
        setError(null);
      } catch (err) {
        setError('Failed to fetch affiliate data');
        setData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [lineId, testDate, options.enabled]);

  const getCommissionByDate = (date: Date) => {
    if (!data?.playerIncomeByDate) return 0;
    const formattedDate = date.toLocaleDateString('th-TH');
    const dayData = data.playerIncomeByDate.find(day => day.date === formattedDate);

    if (!dayData) return 0;

    return dayData.data.reduce((sum, player) => sum + player.commission_amount, 0);
  };

  const getCommissionBetweenDates = (startDate: Date, endDate: Date) => {
    let total = 0;
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      total += getCommissionByDate(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }


    return total;
  };

  // สร้าง chart data
  const chartData = {
    affiliateData: data?.playerSummariesByDate?.map(day => day.players.length) || [],
    profitData: data?.playerSummariesByDate?.map(day =>
      day.players.reduce((sum, player) => sum + player.amount, 0)
    ) || [],
    categories: data?.playerSummariesByDate?.map(day => {
      const date = new Date(day.date);


      return new Intl.DateTimeFormat('th-TH', {
        day: 'numeric',
        month: 'short'
      }).format(date);
    }) || []
  };

  return {
    data,
    isLoading,
    error,
    todayCommission: getCommissionByDate(testDate),
    getCommissionByDate,
    getCommissionBetweenDates,
    totalCommission: data?.commission || 0,
    wallet: data?.wallet || 0,
    affiliateCode: data?.code || '',
    playerCount: data?.playerCount || 0,
    chartData,
    formatAmount,
    debugData: {
      availableDates: data?.playerIncomeByDate?.map(d => d.date) || [],
      currentFormattedDate: testDate.toLocaleDateString('th-TH')
    }
  };
};

export type { AffiliateData };
