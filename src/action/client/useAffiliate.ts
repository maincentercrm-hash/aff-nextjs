// hooks/useAffiliate.ts
import { useState, useEffect } from 'react';

// Interfaces เดิมทั้งหมดคงไว้
interface ChartData {
  affiliateData: number[];
  profitData: number[];
  categories: string[];
}

interface SummaryData {
  today: number;
  total: number;
  playerCount: number;
  affiliateCode: string;
}

interface AffiliatedPlayer {
  username: string;
  bet_amount: number;
  commission_amount: number;
  affiliated_players: AffiliatedPlayer[];
}

interface PlayerIncomeData {
  username: string;
  bet_amount: number;
  commission_amount: number;
  affiliated_players: AffiliatedPlayer[];
}

interface PlayerIncomeByDate {
  date: string;
  data: PlayerIncomeData[];
}

interface PlayerSummaryData {
  playerID: string;
  username: string;
  bet_amount: number;
  amount: number;
}

interface PlayerSummaryByDate {
  date: string;
  players: PlayerSummaryData[];
}

interface AmountSummary {
  date: string;
  amount: number;
}

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
  amountSummaries: AmountSummary[];
  playerSummaries: AmountSummary[];
  playerSummariesByDate: PlayerSummaryByDate[];
  playerIncomeByDate: PlayerIncomeByDate[];
}

// เพิ่ม interface สำหรับ options
interface UseAffiliateOptions {
  enabled?: boolean;
}

export const useAffiliate = (
  lineId: string,
  testDate?: Date,
  options: UseAffiliateOptions = {}
) => {
  const [data, setData] = useState<AffiliateData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false); // เริ่มต้นเป็น false
  const [error, setError] = useState<string | null>(null);

  // ฟังก์ชันฟอร์แมตตัวเลขเป็นเงิน (คงเดิม)
  const formatAmount = (amount: number): string => {
    return new Intl.NumberFormat('th-TH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  // ฟังก์ชันฟอร์แมตวันที่สำหรับ API (คงเดิม)
  const formatDate = (date: Date): string => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();


    return `${day}-${month}-${year}`;
  };

  // ฟังก์ชันดึงข้อมูลสำหรับกราฟ (คงเดิม)
  const getChartData = (): ChartData => {
    if (!data?.playerSummariesByDate) {
      return {
        affiliateData: [],
        profitData: [],

        //  dates: [],
        categories: []
      };
    }

    const sortedData = [...data.playerSummariesByDate].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    return {
      affiliateData: sortedData.map(day => day.players.length),
      profitData: sortedData.map(day =>
        day.players.reduce((sum, player) => sum + player.amount, 0)
      ),

      // dates: sortedData.map(day => formatDate(new Date(day.date))),
      categories: sortedData.map(day => {
        const date = new Date(day.date);


        return new Intl.DateTimeFormat('th-TH', {
          day: 'numeric',
          month: 'short'
        }).format(date);
      })
    };
  };

  // ฟังก์ชันดึงข้อมูลสรุป (คงเดิม)
  const getSummaryData = (): SummaryData => {
    if (!data) return {
      today: 0,
      total: 0,
      playerCount: 0,
      affiliateCode: ''
    };

    return {
      today: getCommissionByDate(testDate || new Date()),
      total: data.commission,
      playerCount: data.playerCount,
      affiliateCode: data.code
    };
  };

  // ฟังก์ชันเดิม (คงเดิม)
  const getCommissionByDate = (date: Date = new Date()): number => {
    if (!data?.playerIncomeByDate) return 0;

    const formattedDate = formatDate(date);
    const targetData = data.playerIncomeByDate.find(item => item.date === formattedDate);

    if (!targetData) return 0;

    return targetData.data.reduce((sum, player) => sum + player.commission_amount, 0);
  };

  const getCommissionBetweenDates = (startDate: Date, endDate: Date): number => {
    if (!data?.playerIncomeByDate) return 0;

    let total = 0;
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      total += getCommissionByDate(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return total;
  };

  // ปรับ Effect
  useEffect(() => {
    // ถ้า enabled เป็น false ให้ return เลย
    if (options.enabled === false) {
      setIsLoading(false);
      setError(null);

      return;
    }

    const fetchAffiliate = async () => {
      if (!lineId) {
        setError('ไม่พบ Line ID');
        setIsLoading(false);

        return;
      }

      setIsLoading(true);

      try {
        const myHeaders = new Headers();

        myHeaders.append("API-KEY", process.env.NEXT_PUBLIC_BASE_API_KEY || '');

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_API_URL}/games/players/line/affiliate?line_id=${lineId}&line_at=${process.env.NEXT_PUBLIC_LINE_AT}`,
          {
            method: "GET",
            headers: myHeaders,
            redirect: "follow"
          }
        );

        if (!response.ok) {
          throw new Error('เกิดข้อผิดพลาดในการดึงข้อมูล');
        }

        const result = await response.json();

        setData(result);
        setError(null);

      } catch (err) {
        console.error('Affiliate fetch error:', err);
        setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการดึงข้อมูล');
        setData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAffiliate();
  }, [lineId, options.enabled]); // เพิ่ม options.enabled เข้าไปใน dependencies

  // Return ทั้งหมด (คงเดิม)
  return {
    data,
    isLoading,
    error,
    todayCommission: getCommissionByDate(testDate || new Date()),
    getCommissionByDate,
    getCommissionBetweenDates,
    totalCommission: data?.commission || 0,
    wallet: data?.wallet || 0,
    affiliateCode: data?.code || '',
    playerCount: data?.playerCount || 0,
    chartData: getChartData(),
    summaryData: getSummaryData(),
    formatAmount,
    debugData: {
      availableDates: data?.playerIncomeByDate?.map(d => d.date) || [],
      currentFormattedDate: formatDate(testDate || new Date())
    }
  } as const;
};

export type { ChartData, SummaryData };
