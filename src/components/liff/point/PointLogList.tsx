import { useState } from 'react'

import Pagination from '@mui/material/Pagination'

import GetDateTimeOnly from '@/views/getDateTimeOnly'

type PointLog = {
  _id: string
  userId: string
  tel: string
  point: number
  operation: string
  title: string
  createDate: string
}

type PropsPointLogList = {
  logs: PointLog[]
}

const PointLogList = ({ logs }: PropsPointLogList) => {
  const [page, setPage] = useState(1)
  const ITEMS_PER_PAGE = 10

  const handleChangePage = (_event: any, newPage: number) => {
    setPage(newPage)
  }

  const startIndex = (page - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const slicedLogs = logs.slice(startIndex, endIndex)

  if (!logs || logs.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        <i className="tabler-history text-4xl mb-2 block"></i>
        <p>ยังไม่มีประวัติ Point</p>
      </div>
    )
  }

  return (
    <div className="p-4">
      <div className="space-y-2">
        {slicedLogs.map((log) => (
          <div
            key={log._id}
            className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm border border-gray-100"
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  log.operation === '+' ? 'bg-green-100' : 'bg-red-100'
                }`}
              >
                <i
                  className={`text-lg ${
                    log.operation === '+'
                      ? 'tabler-plus text-green-600'
                      : 'tabler-minus text-red-600'
                  }`}
                ></i>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">{log.title}</p>
                <p className="text-xs text-gray-500">
                  <GetDateTimeOnly isoDate={log.createDate} />
                </p>
              </div>
            </div>
            <div
              className={`text-right font-bold ${
                log.operation === '+' ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {log.operation === '+' ? '+' : '-'}{log.point} P
            </div>
          </div>
        ))}
      </div>

      {logs.length > ITEMS_PER_PAGE && (
        <Pagination
          count={Math.ceil(logs.length / ITEMS_PER_PAGE)}
          page={page}
          shape="rounded"
          color="primary"
          onChange={handleChangePage}
          className="mt-4 flex justify-center"
        />
      )}
    </div>
  )
}

export default PointLogList
