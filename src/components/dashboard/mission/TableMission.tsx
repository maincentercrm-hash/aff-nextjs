import { useContext, useEffect, useMemo, useRef, useState } from 'react'



// MUI Imports

import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import TablePagination from '@mui/material/TablePagination'
import type { TextFieldProps } from '@mui/material/TextField'

import Chip from '@mui/material/Chip';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';

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
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { ColumnFiltersState, FilterFn, ColumnDef } from '@tanstack/react-table'
import type { RankingInfo } from '@tanstack/match-sorter-utils'

import IconButton from '@mui/material/IconButton'

import TablePaginationComponent from '@components/TablePaginationComponent'

import ChevronRight from '@/@menu/svg/ChevronRight'
import CustomTextField from '@/@core/components/mui/TextField'
import styles from '@core/styles/table.module.css'
import type { TypeMission } from '@/types/typeMission'
import GetStatus from '@/views/getStatus'
import { ItemsContext } from './MainMission'
import GetDateTimeOnly from '@/views/getDateTimeOnly'

declare module '@tanstack/table-core' {
  interface FilterFns {
    fuzzy: FilterFn<unknown>
  }
  interface FilterMeta {
    itemRank: RankingInfo
  }
}

// Add getTimeStatus function
const getTimeStatus = (startDate: string, endDate: string) => {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (now < start) {
    return {
      label: 'ยังไม่เริ่ม',
      color: 'warning',
      icon: <AccessTimeIcon sx={{ fontSize: 16 }} />
    };
  } else if (now > end) {
    return {
      label: 'หมดเวลา',
      color: 'error',
      icon: <ErrorIcon sx={{ fontSize: 16 }} />
    };
  }


  return {
    label: 'กำลังดำเนินการ',
    color: 'success',
    icon: <CheckCircleIcon sx={{ fontSize: 16 }} />
  };
};

const columnHelper = createColumnHelper<TypeMission>()

const fuzzyGlobalFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  // Normalize the search value
  const normalizedValue = String(value).toLowerCase();

  // Combine relevant fields for a broad search
  const searchData = [
    row.original.title,
    row.original.session
  ].join(' ').toLowerCase();

  // Rank the combined data fields
  const itemRank = rankItem(searchData, normalizedValue);

  // Store the itemRank info for possible use in rendering/filter diagnostics
  addMeta({
    itemRank
  });

  // Return whether the search criteria are met
  return itemRank.passed;
};


const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {

  // Handle other columns normally
  const itemRank = rankItem(row.getValue(columnId), value);

  addMeta({
    itemRank
  });

  return itemRank.passed;
};


// A debounced input react component
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
  // States
  const [value, setValue] = useState(initialValue)

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value)
    }, debounce)

    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  return <CustomTextField {...props} value={value} onChange={e => setValue(e.target.value)} />
}

type DataTable = {
  items: TypeMission[]
}

const TableMission = ({ items }: DataTable) => {

  const { open, setSelect, setOpenDel, setOpenEdit } = useContext(ItemsContext);

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [data, setData] = useState(items);

  const handleClickOpenEdit = (data: TypeMission) => () => {
    setSelect(data)
    setOpenEdit(true)
  };

  const handleClickOpenDel = (data: TypeMission) => () => {
    setSelect(data)
    setOpenDel(true)
  };


  // Refs
  const descriptionElementRef = useRef<HTMLElement>(null)

  useEffect(() => {
    // console.log('restart')
    setData(items)
  }, [items])


  useEffect(() => {

    if (open) {
      const { current: descriptionElement } = descriptionElementRef

      if (descriptionElement !== null) {
        descriptionElement.focus()
      }
    }

  }, [open])



  const columns = useMemo<ColumnDef<TypeMission, any>[]>(
    () => [

      {
        // Custom accessor for combined title
        accessor: 'thumbnail',
        cell: info => (
          <img src={info.row.original.thumbnail} className='w-full' alt={info.row.original.title} />
        ),
        header: 'ภาพปก'
      },


      columnHelper.accessor('title', {
        cell: info => info.getValue(),
        header: 'หัวข้อ'
      }),

      columnHelper.accessor('point', {
        cell: info => (info.getValue() + 'P'),
        header: 'รางวัล'
      }),





      columnHelper.accessor('session', {
        cell: info => (
          <>
            <p>ชื่อ : {info.getValue()}</p>
            <p>ประเภท : {info.row.original.type}</p>
            <p>เงื่อนไข : {info.row.original.condition}</p>
          </>
        ),
        header: 'ชื่อประเภท'
      }),

      {
        accessor: 'timeline',
        cell: info => {
          const timeStatus = getTimeStatus(
            info.row.original.start_date,
            info.row.original.end_date
          );

          return (
            <div className='grid'>
              <p>เริ่ม : <GetDateTimeOnly isoDate={info.row.original.start_date} /></p>
              <p>สิ้นสุด : <GetDateTimeOnly isoDate={info.row.original.end_date} /></p>
              <Chip
                icon={timeStatus.icon}
                label={timeStatus.label}
                color={timeStatus.color as any}
                size="small"
                variant="outlined"
                className="mt-1 w-fit"
              />
            </div>
          );
        },
        header: 'ระยะเวลา'
      },

      columnHelper.accessor('createDate', {
        cell: info => (
          <GetDateTimeOnly isoDate={info.getValue()} />
        ),
        header: 'วันที่สร้าง'
      }),

      columnHelper.accessor('status', {
        cell: info => (
          <GetStatus status={info.getValue()} />
        ),
        header: 'สถานะ'
      }),

      {
        // Custom accessor for combined title
        accessor: 'more_detail',
        cell: info => (
          <div className='flex gap-0'>

            <IconButton aria-label='capture screenshot' size='large' onClick={handleClickOpenEdit(info.row.original)}>
              <i className='tabler-edit text-[28px]' />
            </IconButton>

            <IconButton aria-label='capture screenshot' size='large' color='error' onClick={handleClickOpenDel(info.row.original)}>
              <i className='tabler-trash text-[28px]' />
            </IconButton>


          </div >
        ),
        header: 'จัดการข้อมูล',

      }

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
    globalFilterFn: fuzzyGlobalFilter, // Update this to use the new function
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues()
  });

  useEffect(() => {

    if (table.getState().columnFilters[0]?.id === 'title') {
      if (table.getState().sorting[0]?.id !== 'title') {
        table.setSorting([{ id: 'title', desc: false }]);

      }
    }
  }, [table]);

  return (


    <Card className='mt-4'>
      <CardHeader
        title='ข้อมูลทั้งหมด'
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
                {headerGroup.headers.map(header => {
                  return (
                    <th key={header.id}>
                      {header.isPlaceholder ? null : (
                        <>
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

                        </>
                      )}
                    </th>
                  )
                })}
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
              {table.getRowModel().rows.map(row => {
                return (
                  <tr key={row.id}>
                    {row.getVisibleCells().map(cell => {
                      return <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                    })}
                  </tr>
                )
              })}
            </tbody>
          )}
        </table>

      </div>


      <TablePagination
        component={() => <TablePaginationComponent table={table} />}
        count={table.getFilteredRowModel().rows.length}
        rowsPerPage={table.getState().pagination.pageSize}
        page={table.getState().pagination.pageIndex}
        onPageChange={(_, page) => {
          table.setPageIndex(page)
        }}
      />
    </Card >
  );
};

export default TableMission;
