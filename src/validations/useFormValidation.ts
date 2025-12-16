import { useState, useCallback } from 'react'

import type { z } from 'zod'

interface ValidationResult {
  isValid: boolean
  errors: Record<string, string>
}

/**
 * Custom hook สำหรับ validate form data ด้วย Zod schema
 *
 * @example
 * const { validate, getError, hasErrors } = useFormValidation(missionSchema)
 *
 * const handleSubmit = () => {
 *   const { isValid } = validate(formData)
 *   if (!isValid) return
 *   // proceed with submission
 * }
 */
export function useFormValidation<T extends z.ZodType<any, any>>(schema: T) {
  const [errors, setErrors] = useState<Record<string, string>>({})

  /**
   * Validate data และอัปเดต errors state
   */
  const validate = useCallback((data: unknown): ValidationResult => {
    // Debug: แสดงข้อมูลที่ส่งมา validate
    console.log('📝 Form Data:', data)

    const result = schema.safeParse(data)

    if (result.success) {
      console.log('✅ Validation passed')
      setErrors({})

      return { isValid: true, errors: {} }
    }

    const newErrors: Record<string, string> = {}

    result.error.issues.forEach((err) => {
      const path = err.path.join('.')

      // เก็บเฉพาะ error แรกของแต่ละ field
      if (!newErrors[path]) {
        newErrors[path] = err.message
      }
    })

    // Debug: แสดง errors ที่เกิดขึ้น
    console.log('❌ Validation errors:', newErrors)
    console.log('📋 Raw issues:', result.error.issues)

    setErrors(newErrors)

    return { isValid: false, errors: newErrors }
  }, [schema])

  /**
   * Validate เฉพาะ field เดียว
   */
  const validateField = useCallback((fieldName: string, value: unknown): string | null => {
    // สร้าง partial object สำหรับ validate
    const partialData = { [fieldName]: value }
    const result = schema.safeParse(partialData)

    if (result.success) {
      // ลบ error ของ field นี้ออก
      setErrors(prev => {
        const newErrors = { ...prev }

        delete newErrors[fieldName]

        return newErrors
      })

      return null
    }

    // หา error ของ field นี้
    const fieldError = result.error.issues.find(err => err.path.join('.') === fieldName)

    if (fieldError) {
      setErrors(prev => ({
        ...prev,
        [fieldName]: fieldError.message
      }))

      return fieldError.message
    }

    return null
  }, [schema])

  /**
   * ล้าง errors ทั้งหมด
   */
  const clearErrors = useCallback(() => {
    setErrors({})
  }, [])

  /**
   * ล้าง error ของ field เดียว
   */
  const clearFieldError = useCallback((fieldName: string) => {
    setErrors(prev => {
      const newErrors = { ...prev }

      delete newErrors[fieldName]

      return newErrors
    })
  }, [])

  /**
   * ดึง error message ของ field
   */
  const getError = useCallback((fieldName: string): string => {
    return errors[fieldName] || ''
  }, [errors])

  /**
   * ตรวจสอบว่า field มี error หรือไม่
   */
  const hasFieldError = useCallback((fieldName: string): boolean => {
    return !!errors[fieldName]
  }, [errors])

  return {
    validate,
    validateField,
    errors,
    getError,
    hasFieldError,
    clearErrors,
    clearFieldError,
    hasErrors: Object.keys(errors).length > 0
  }
}

/**
 * Validate data โดยไม่ใช้ hook (สำหรับใช้ใน API routes)
 */
export function validateData<T extends z.ZodType<any, any>>(
  schema: T,
  data: unknown
): { isValid: boolean; errors: Record<string, string>; data?: z.infer<T> } {
  const result = schema.safeParse(data)

  if (result.success) {
    return { isValid: true, errors: {}, data: result.data }
  }

  const errors: Record<string, string> = {}

  result.error.issues.forEach((err) => {
    const path = err.path.join('.')

    if (!errors[path]) {
      errors[path] = err.message
    }
  })

  return { isValid: false, errors }
}
