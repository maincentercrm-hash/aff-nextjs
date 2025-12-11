import { useContext, useEffect, useMemo, useRef, useState } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import TablePagination from '@mui/material/TablePagination'
import Switch from '@mui/material/Switch'
import Chip from '@mui/material/Chip'
import type { TextFieldProps } from '@mui/material/TextField'

// Third-party Imports
import classnames from 'classnames'
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFacetedMinMaxValues,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper
} from '@tanstack/react-table'
import { rankItem } from '@tanstack/match-sorter-utils'
import type { ColumnFiltersState, FilterFn, ColumnDef, Table } from '@tanstack/react-table'
import type { RankingInfo } from '@tanstack/match-sorter-utils'

// Components Imports
import { useQueryClient } from '@tanstack/react-query'

import TablePaginationComponent from '@components/TablePaginationComponent'
import ChevronRight from '@/@menu/svg/ChevronRight'
import CustomTextField from '@/@core/components/mui/TextField'
import styles from '@core/styles/table.module.css'

import GetDateTimeOnly from '@/views/getDateTimeOnly'

// Context and Types
import { ItemsContext } from './MainPointLog'
import type { TypePointLog } from '@/types/typePointLog'
import updatePointStatus from '@/action/point/updateStatus'


declare module '@tanstack/table-core' {
  interface FilterFns {
    fuzzy: FilterFn<unknown>
  }
  interface FilterMeta {
    itemRank: RankingInfo
  }
}

const columnHelper = createColumnHelper<TypePointLog>()

const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value)

  addMeta({ itemRank })

  return itemRank.passed
}

// DebouncedInput Component
const DebouncedInput = ({
  value: initialValue,
  onChange,
  debounce = 500,
  ...props
}: {
  value: string | number
  onChange: (value: string | number) => void
  debounce?: number
} & TextFieldProps) => {
  const [value, setValue] = useState(initialValue)

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value)
    }, debounce)


    return () => clearTimeout(timeout)
  }, [value, debounce, onChange])

  return <CustomTextField {...props} value={value} onChange={e => setValue(e.target.value)} />
}

type DataTable = {
  items: TypePointLog[]
}

const TablePointLog = ({ items }: DataTable) => {



  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [data, setData] = useState(items)

  const queryClient = useQueryClient() // ใช้ hook แทน
  const { setUpdate, open } = useContext(ItemsContext)

  const handleStatusChange = async (id: string, checked: boolean) => {
    try {
      const result = await updatePointStatus(
        id,
        checked ? 'complete' : 'pending'
      );

      if (result.type === 'success') {
        // invalidate query และเรียกใช้ setUpdate เพื่อ force re-render
        await queryClient.invalidateQueries({
          queryKey: ['tbl_point_logs', 'operation', '-']
        });
        setUpdate((prev: any) => !prev);
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const descriptionElementRef = useRef<HTMLElement>(null)

  useEffect(() => {

    if (open) {
      const { current: descriptionElement } = descriptionElementRef

      if (descriptionElement !== null) {
        descriptionElement.focus()
      }
    }

  }, [open])

  useEffect(() => {
    setData(items)
  }, [items])

  const columns = useMemo<ColumnDef<TypePointLog, any>[]>(
    () => [
      columnHelper.accessor('tel', {
        cell: info => info.getValue(),
        header: 'เบอร์โทร'
      }),

      columnHelper.accessor('title', {
        cell: info => info.getValue(),
        header: 'รายการ'
      }),

      columnHelper.accessor('point', {
        cell: info => (
          <span className={info.row.original.operation === '-' ? 'text-red-500' : 'text-green-500'}>
            {info.row.original.operation}{info.getValue()} Point
          </span>
        ),
        header: 'จำนวนพ้อยต์'
      }),

      columnHelper.accessor('type', {
        cell: info => {
          const type = info.getValue()

          return (
            <Chip
              label={type === 'credit' ? 'เครดิต' : 'ทั่วไป'}
              color={type === 'credit' ? 'success' : 'default'}
              size="small"
              variant="outlined"
            />
          )
        },
        header: 'ประเภท'
      }),

      columnHelper.accessor('createDate', {
        cell: info => <GetDateTimeOnly isoDate={info.getValue()} />,
        header: 'วันที่ทำรายการ'
      }),

      columnHelper.accessor('status', {
        cell: info => {
          const row = info.row.original
          const isCredit = row.type === 'credit'
          const status = row.status

          // ถ้าเป็น credit type → แสดง Chip แทน Switch
          if (isCredit) {
            if (status === 'pending') {
              return <Chip label="รอยืนยันจากระบบ" color="warning" size="small" />
            } else if (status === 'rejected') {
              return <Chip label="ถูกปฏิเสธ (คืน Points)" color="error" size="small" />
            } else if (status === 'complete') {
              return <Chip label="สำเร็จ" color="success" size="small" />
            }
          }

          // ถ้าเป็น default type → แสดง Switch เหมือนเดิม
          return (
            <Switch
              checked={status === 'complete'}
              onChange={(e) => handleStatusChange(row._id, e.target.checked)}
              color="success"
            />
          )
        },
        header: 'สถานะ'
      })
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  const table = useReactTable({
    data,
    columns,
    filterFns: {
      fuzzy: fuzzyFilter
    },
    state: {
      columnFilters,
      globalFilter
    },
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues()
  })

  return (
    <Card className='mt-4'>
      <CardHeader
        title='ประวัติการแลกพ้อยต์'
        action={
          <DebouncedInput
            value={globalFilter ?? ''}
            onChange={value => setGlobalFilter(String(value))}
            placeholder='ค้นหาจากข้อมูลทั้งหมด...'
          />
        }
      />
      <div className='overflow-x-auto'>
        <table className={styles.table}>
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th key={header.id}>
                    {header.isPlaceholder ? null : (
                      <div
                        className={classnames({
                          'flex items-center': header.column.getIsSorted(),
                          'cursor-pointer select-none': header.column.getCanSort()
                        })}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {{
                          asc: <ChevronRight fontSize='1.25rem' className='-rotate-90' />,
                          desc: <ChevronRight fontSize='1.25rem' className='rotate-90' />
                        }[header.column.getIsSorted() as 'asc' | 'desc'] ?? null}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          {table.getFilteredRowModel().rows.length === 0 ? (
            <tbody>
              <tr>
                <td colSpan={table.getVisibleFlatColumns().length} className='text-center'>
                  ไม่พบข้อมูล
                </td>
              </tr>
            </tbody>
          ) : (
            <tbody>
              {table.getRowModel().rows.map(row => (
                <tr key={row.id}>
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          )}
        </table>
      </div>

      <TablePagination
        component={() => <TablePaginationComponent table={table as unknown as Table<unknown>} />}
        count={table.getFilteredRowModel().rows.length}
        rowsPerPage={table.getState().pagination.pageSize}
        page={table.getState().pagination.pageIndex}
        onPageChange={(_, page) => {
          table.setPageIndex(page)
        }}
      />
    </Card>
  )
}

export default TablePointLog
