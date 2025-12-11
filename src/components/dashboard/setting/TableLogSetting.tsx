import { useContext, useEffect, useMemo, useRef, useState } from 'react'



// MUI Imports

import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import TablePagination from '@mui/material/TablePagination'
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
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { ColumnFiltersState, FilterFn, ColumnDef } from '@tanstack/react-table'
import type { RankingInfo } from '@tanstack/match-sorter-utils'

import IconButton from '@mui/material/IconButton'


import TablePaginationComponent from '@components/TablePaginationComponent'

import ChevronRight from '@/@menu/svg/ChevronRight'
import CustomTextField from '@/@core/components/mui/TextField'
import styles from '@core/styles/table.module.css'


import { ItemsContext } from './MainLogsetting'
import type { TypeSettingLog } from '@/types/typeSetting'
import GetStatus from '@/views/getStatus'
import GetDateTimeOnly from '@/views/getDateTimeOnly'

declare module '@tanstack/table-core' {
  interface FilterFns {
    fuzzy: FilterFn<unknown>
  }
  interface FilterMeta {
    itemRank: RankingInfo
  }
}


const columnHelper = createColumnHelper<TypeSettingLog>()

const fuzzyGlobalFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  // Normalize the search value
  const normalizedValue = String(value).toLowerCase();

  // Combine relevant fields for a broad search
  const searchData = [
    row.original.title,
    row.original.point,
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
  items: TypeSettingLog[]
}

const TableLogSetting = ({ items }: DataTable) => {

  const { open, setSelect, setOpenCheck, openCheck } = useContext(ItemsContext);

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [data, setData] = useState(items);

  const handleClickOpenCheck = (data: TypeSettingLog) => () => {

    console.log('openCheck', openCheck)
    setSelect(data)
    setOpenCheck(true)
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

  const truncateUrl = (url: string, maxLength: number = 50) => {
    if (url.length <= maxLength) return url;

    return url.substring(0, maxLength) + '...';
  };

  const isValidUrl = (urlString: string): boolean => {
    try {
      new URL(urlString);

      return true;
    } catch (err) {
      return false;
    }
  }

  const columns = useMemo<ColumnDef<TypeSettingLog, any>[]>(
    () => [

      columnHelper.accessor('tel', {
        cell: info => info.getValue(),
        header: 'Username'
      }),
      columnHelper.accessor('settingTitle', {
        cell: info => info.getValue(),
        header: 'ประเภทกิจกรรม'
      }),

      columnHelper.accessor('url', {
        cell: info => {
          const value = info.getValue();

          if (isValidUrl(value)) {
            const linkProps = {
              href: value,
              target: "_blank",
              rel: "noopener noreferrer",
              className: "text-blue-500 hover:underline"
            };

            return (
              <a {...linkProps}>
                {truncateUrl(value)}
              </a>
            );
          } else {
            return (
              <span>
                {truncateUrl(value)}
              </span>
            );
          }
        },
        header: 'ข้อมูล'
      }),

      columnHelper.accessor('point', {
        cell: info => `${info.getValue()} Point`,
        header: 'คะแนน'
      }),

      columnHelper.accessor('status', {
        cell: info => (
          <GetStatus status={info.getValue()} />
        ),
        header: 'สถานะ'
      }),

      columnHelper.accessor('createDate', {
        cell: info => (<GetDateTimeOnly isoDate={info.getValue()} />),
        header: 'วันที่ส่ง'
      }),

      {
        accessor: 'actions',
        cell: info => (
          <div className='flex gap-0'>
            <IconButton aria-label='capture screenshot' size='large' onClick={handleClickOpenCheck(info.row.original)}>
              <i className='tabler-edit text-[28px]' />
            </IconButton>
          </div>
        ),
        header: 'จัดการ'
      }
    ],
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

export default TableLogSetting;
