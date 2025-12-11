// hooks/usePhoneValidation.ts
import { useState } from 'react';

interface ValidationResponse {
  lineID?: string;
  username?: string;
  balance?: number;
  code?: number;
  status?: string;
  message?: string;
  display_message?: string;
}

interface ValidationResult {
  isValid: boolean;
  shouldRedirect?: boolean;
  message?: string;
  data?: ValidationResponse;
}

export const usePhoneValidation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validatePhone = async (phoneNumber: string, lineId: string): Promise<ValidationResult> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}/players/v1/line/sync`, {
        method: 'POST',
        headers: {
          'API-KEY': process.env.NEXT_PUBLIC_BASE_API_KEY || '',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phone_number: phoneNumber,
          line_id: lineId,
          line_at: process.env.NEXT_PUBLIC_LINE_AT
        })
      });

      const data: ValidationResponse = await response.json();

      if (data.code === 400) {
        const errorMsg = 'ไม่พบเบอร์โทรศัพท์นี้ในระบบ กรุณาสมัครสมาชิกก่อนทำรายการหรือกรอกเบอร์โทรศัพท์ที่ลงทะเบียนไว้เท่านั้น';

        setError(errorMsg);

        return {
          isValid: false,
          shouldRedirect: true,
          message: errorMsg
        };
      }

      if (data.username && data.username !== phoneNumber) {
        const errorMsg = `เบอร์โทรศัพท์ไม่ถูกต้อง เบอร์ที่ถูกต้องคือ ${data.username}`;

        setError(errorMsg);

        return {
          isValid: false,
          message: errorMsg
        };
      }

      setError(null);

      return {
        isValid: true,
        data
      };

    } catch (error) {
      const errorMsg = 'เกิดข้อผิดพลาดในการตรวจสอบข้อมูล กรุณาลองใหม่อีกครั้ง';

      setError(errorMsg);

      return {
        isValid: false,
        message: errorMsg
      };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    validatePhone,
    isLoading,
    error,
    setError
  };
};
