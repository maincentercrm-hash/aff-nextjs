// actions/backend/missions/useMissionReport.ts
import { useQuery } from '@tanstack/react-query';

export type MissionDetail = {
  _id: string;
  tel: string;
  title: string;
  type: string; // Can be mission type or "setting"/"point"
  point: number;
  status: string;
  createDate: string;
  completeDate?: string;
  condition: string;
}

export type DailyReport = {
  date: string;
  summary: {
    totalMissions: number;
    totalPoints: number;
    completedMissions: number;
    pendingMissions: number;
    expiredMissions: number;
  };
  missions: MissionDetail[];
}

export type MissionReportData = {
  summary: {
    totalMissions: number;
    totalPoints: number;
    completedMissions: number;
    pendingMissions: number;
    expiredMissions: number;
  };
  dailyReports: DailyReport[];
  status?: boolean;
  message?: string;
}

const useMissionReport = (startDate: Date | null, endDate: Date | null) => {
  return useQuery({
    queryKey: ['missionReport', startDate, endDate],
    queryFn: async (): Promise<MissionReportData> => {
      if (!startDate || !endDate) throw new Error('Date range is required');

      const start = startDate.toISOString();
      const end = endDate.toISOString();

      const response = await fetch(`/api/reports/missions?start=${start}&end=${end}`);

      if (!response.ok) {
        throw new Error('Failed to fetch mission report');
      }

      return response.json();
    },
    enabled: !!startDate && !!endDate
  });
};

export default useMissionReport;
