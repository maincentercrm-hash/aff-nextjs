'use client'

// components/MissionReport.tsx
import { useState, useCallback } from 'react';

import {
  TableContainer, Table, TableHead, TableBody, TableRow,
  TableCell, Box, Typography, Grid, Card, CardContent,
  Accordion, AccordionSummary, AccordionDetails,
  CircularProgress, Chip
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import PickersRange from './PickersRange';
import type { DailyReport, MissionDetail } from '@/action/mission/useMissionReport';
import useMissionReport from '@/action/mission/useMissionReport';

const MissionReport = () => {

  const getInitialDateRange = (): [Date, Date] => {
    const today = new Date();
    const startOfDay = new Date(today);

    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(today);

    endOfDay.setHours(23, 59, 59, 999);

    return [startOfDay, endOfDay];
  };


  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>(getInitialDateRange());


  const handleDateChange = useCallback((dates: [Date | null, Date | null]) => {
    // ถ้าผู้ใช้เลือกวันที่ใหม่ ให้ set เวลาเริ่มต้นและสิ้นสุดของวันนั้นๆ
    if (dates[0] && dates[1]) {
      const start = new Date(dates[0]);

      start.setHours(0, 0, 0, 0);

      const end = new Date(dates[1]);

      end.setHours(23, 59, 59, 999);

      setDateRange([start, end]);
    } else {
      setDateRange(dates);
    }
  }, []);

  const { data, isLoading, error } = useMissionReport(dateRange[0], dateRange[1]);

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('th-TH', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getMissionStatusChip = (status: string, type: string) => {
    // ถ้าเป็น setting หรือ point ให้แสดงเป็นสำเร็จเสมอ
    if (type === 'setting' || type === 'point') {
      return <Chip size="small" color="success" label="สำเร็จ" />;
    }

    // สำหรับ mission ปกติ
    const statusConfig: Record<string, { color: 'success' | 'warning' | 'error', label: string }> = {
      complete: { color: 'success', label: 'สำเร็จ' },
      pending: { color: 'warning', label: 'รอดำเนินการ' },
      active: { color: 'warning', label: 'รอดำเนินการ' },
      expire: { color: 'error', label: 'หมดเวลา' },
      rejected: { color: 'error', label: 'ไม่สำเร็จ' }
    };

    const config = statusConfig[status] || { color: 'default', label: status };


    return <Chip size="small" color={config.color} label={config.label} />;
  };

  if (error) {
    return (
      <Card sx={{ p: 3, bgcolor: 'error.light' }}>
        <Typography color="error" variant="body1">
          เกิดข้อผิดพลาด: {error instanceof Error ? error.message : 'Unknown error'}
        </Typography>
      </Card>
    );
  }

  return (
    <Box sx={{ p: 0 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <PickersRange
            value={dateRange}
            onChange={handleDateChange}
          />
        </Grid>

        {isLoading ? (
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          </Grid>
        ) : data && data.summary ? (
          <>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ pb: 1, borderColor: 'divider' }}>
                    สรุปภาพรวม Mission
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} md={3}>
                      <Card variant="outlined" sx={{ p: 2 }}>
                        <Typography variant="subtitle2" color="textSecondary">จำนวน Mission ทั้งหมด</Typography>
                        <Typography variant="h4">{data.summary.totalMissions}</Typography>
                        <Typography variant="caption" color="textSecondary">รายการ</Typography>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Card variant="outlined" sx={{ p: 2 }}>
                        <Typography variant="subtitle2" color="textSecondary">Mission สำเร็จ</Typography>
                        <Typography variant="h4" color="success.main">{data.summary.completedMissions}</Typography>
                        <Typography variant="caption" color="textSecondary">รายการ</Typography>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Card variant="outlined" sx={{ p: 2 }}>
                        <Typography variant="subtitle2" color="textSecondary">Mission รอดำเนินการ</Typography>
                        <Typography variant="h4" color="warning.main">{data.summary.pendingMissions}</Typography>
                        <Typography variant="caption" color="textSecondary">รายการ</Typography>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Card variant="outlined" sx={{ p: 2 }}>
                        <Typography variant="subtitle2" color="textSecondary">Mission หมดเวลา</Typography>
                        <Typography variant="h4" color="error.main">{data.summary.expiredMissions}</Typography>
                        <Typography variant="caption" color="textSecondary">รายการ</Typography>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Card variant="outlined" sx={{ p: 2 }}>
                        <Typography variant="subtitle2" color="textSecondary">Point รวมทั้งหมด</Typography>
                        <Typography variant="h4" color="primary">{data.summary.totalPoints}</Typography>
                        <Typography variant="caption" color="textSecondary">points</Typography>
                      </Card>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              {data.dailyReports?.map((daily: DailyReport) => (
                <Accordion key={daily.date} defaultExpanded={true}>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    sx={{
                      '&:hover': {
                        backgroundColor: 'action.hover'
                      }
                    }}
                  >
                    <Grid container alignItems="center" spacing={2}>
                      <Grid item xs={12} md={4}>
                        <Typography variant="subtitle1" fontWeight="medium">
                          {new Date(daily.date).toLocaleDateString('th-TH')}
                        </Typography>
                      </Grid>
                      <Grid item xs={6} md={4}>
                        <Typography color="textSecondary">
                          Mission: {daily.summary.completedMissions}/{daily.summary.totalMissions} รายการ
                        </Typography>
                      </Grid>
                      <Grid item xs={6} md={4}>
                        <Typography color="primary">
                          Points: {daily.summary.totalPoints} points
                        </Typography>
                      </Grid>
                    </Grid>
                  </AccordionSummary>
                  <AccordionDetails>
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>เวลา</TableCell>
                            <TableCell>เบอร์โทร</TableCell>
                            <TableCell>Mission</TableCell>
                            <TableCell>ประเภท</TableCell>
                            <TableCell>เงื่อนไข</TableCell>
                            <TableCell align="right">Point</TableCell>
                            <TableCell>สถานะ</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {daily.missions.map((mission: MissionDetail) => (
                            <TableRow key={mission._id} hover>
                              <TableCell>{formatDateTime(mission.createDate)}</TableCell>
                              <TableCell>{mission.tel}</TableCell>
                              <TableCell>{mission.title}</TableCell>
                              <TableCell>{mission.type}</TableCell>
                              <TableCell>{mission.condition}</TableCell>
                              <TableCell align="right">{mission.point || 0}</TableCell>
                              <TableCell>{getMissionStatusChip(mission.status, mission.type)}</TableCell>
                            </TableRow>
                          ))}
                          <TableRow
                            sx={{
                              '& td': {
                                fontWeight: 'bold',
                                backgroundColor: 'action.selected'
                              }
                            }}
                          >
                            <TableCell colSpan={5}>รวมประจำวัน</TableCell>
                            <TableCell align="right">{daily.summary.totalPoints}</TableCell>
                            <TableCell>{`${daily.summary.completedMissions}/${daily.summary.totalMissions}`}</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Grid>
          </>
        ) : (
          <Grid item xs={12}>
            <Typography variant="body1" sx={{ textAlign: 'center', py: 4 }}>
              ไม่พบข้อมูลในช่วงเวลาที่เลือก
            </Typography>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default MissionReport;
