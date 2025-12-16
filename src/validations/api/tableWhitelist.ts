/**
 * Whitelist ของ table names ที่อนุญาตให้ใช้ใน CRUD operations
 * ป้องกัน NoSQL Injection โดยการตรวจสอบ table name ก่อนใช้งาน
 */

export const ALLOWED_TABLES = [
  'tbl_mission',
  'tbl_campaign',
  'tbl_community',
  'tbl_point',
  'tbl_online_marketings',
  'tbl_medias',
  'tbl_support',
  'tbl_setting',
  'tbl_client',
  'tbl_pointlog',
  'tbl_users'
] as const

export type AllowedTable = typeof ALLOWED_TABLES[number]

/**
 * ตรวจสอบว่า table name อยู่ใน whitelist หรือไม่
 */
export function isValidTable(table: string): table is AllowedTable {
  return ALLOWED_TABLES.includes(table as AllowedTable)
}

/**
 * ตรวจสอบและ return table name ที่ปลอดภัย
 * ถ้าไม่อยู่ใน whitelist จะ throw error
 */
export function getSafeTableName(table: string): AllowedTable {
  if (!isValidTable(table)) {
    throw new Error(`Invalid table name: ${table}`)
  }
  return table
}
