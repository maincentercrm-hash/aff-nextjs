// ส่วนของ imports คงเดิม
import type { ChangeEvent, KeyboardEvent } from "react";
import React, { useContext, useRef, useState } from "react";

import Link from "next/link";

import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import { useQueryClient } from "@tanstack/react-query";

import { usePhoneValidation } from "@/action/client/usePhoneValidation";
import actionUpdate from "@/action/crud/update";
import { LineProfile } from "@/components/liffLogin/VerifyProfile";
import actionCreateBy from "@/action/crud/createBy";
import actionCampaignUpdate from "@/action/crud/campaignUpdate";

type PropsCampaign = {
  campaign: string | null;
  activeId: string;
}

const PhoneInput = ({ campaign, activeId }: PropsCampaign) => {
  const queryClient = useQueryClient();
  const { userId, userIdLine } = useContext(LineProfile);
  const { validatePhone, isLoading, error, setError } = usePhoneValidation();

  const [inputValues, setInputValues] = useState<string[]>(Array(10).fill(""));
  const [allInputsFilled, setAllInputsFilled] = useState(false);
  const [registerCheck, setRegisterCheck] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>(Array.from({ length: 10 }));

  const handleInputChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, index: number) => {
    const { value } = event.target;

    // Only take the first digit if multiple digits are pasted
    const newValue = value.replace(/\D/g, '').slice(0, 1);

    // Create a new array with the updated value
    const newInputValues = [...inputValues];

    newInputValues[index] = newValue;
    setInputValues(newInputValues);

    // Move to next input if a value was entered and there's a next field
    if (newValue !== "" && index < 9) {
      inputRefs.current[index + 1]?.focus();
    }

    // Check if all inputs are filled
    setAllInputsFilled(newInputValues.every(val => val !== ""));

    // Reset error when user starts typing
    if (error) {
      setError(null);
    }
  };

  const handleInputKeyDown = (event: KeyboardEvent, index: number) => {
    // Handle backspace
    if (event.key === 'Backspace') {
      if (inputValues[index] === '' && index > 0) {
        // Move to previous input if current is empty
        const newInputValues = [...inputValues];

        newInputValues[index - 1] = '';
        setInputValues(newInputValues);
        inputRefs.current[index - 1]?.focus();
      } else {
        // Clear current input
        const newInputValues = [...inputValues];

        newInputValues[index] = '';
        setInputValues(newInputValues);
      }
    }
  };

  const handleInputFocus = (index: number) => {
    // Select all text when focusing
    if (inputRefs.current[index]) {
      inputRefs.current[index]?.select();
    }

    // Reset error when user focuses on an input
    if (error) {
      setError(null);
    }
  };

  const handlePaste = (event: React.ClipboardEvent, startIndex: number) => {
    event.preventDefault();

    const pastedData = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, 10 - startIndex);

    if (pastedData) {
      const newInputValues = [...inputValues];

      // Fill in the values
      [...pastedData].forEach((char, index) => {
        const arrayIndex = startIndex + index;

        if (arrayIndex < 10) {
          newInputValues[arrayIndex] = char;
        }
      });

      setInputValues(newInputValues);

      // Focus the next empty input or the last input if all are filled
      const nextEmptyIndex = newInputValues.findIndex((value, index) => index >= startIndex && value === '');
      const focusIndex = nextEmptyIndex === -1 ? 9 : nextEmptyIndex;

      inputRefs.current[focusIndex]?.focus();

      setAllInputsFilled(newInputValues.every(val => val !== ''));
    }
  };

  const handleUpdate = async () => {
    const tel = inputValues.join("");

    if (tel.length < 10) {
      setError('กรุณากรอกเบอร์โทรศัพท์ให้ครบ 10 หลัก');

      return;
    }

    try {
      const validationResult = await validatePhone(tel, userIdLine);

      if (!validationResult.isValid) {
        if (validationResult.shouldRedirect) {
          setRegisterCheck(true);

          return;
        }


        return;
      }

      const telData = {
        _id: userId,
        tel: tel
      };

      const clientData = {
        tel: tel,
        client_id: userId,
        userId: userIdLine,
        point: 0
      };

      await actionUpdate('tbl_client', telData);
      await actionCreateBy('tbl_client_point', clientData, 'tel');

      setRegisterCheck(false);

      if (campaign) {
        await actionCampaignUpdate('tbl_campaign', campaign, 'active', activeId);
        const baseUrl = window.location.origin + window.location.pathname;

        window.history.replaceState({}, document.title, baseUrl);
      }

      queryClient.invalidateQueries({ queryKey: ['tbl_client', userId] });
      setError('บันทึกข้อมูลเรียบร้อยแล้ว');

    } catch (err) {
      console.error('Error updating phone:', err);
      setError('เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง');
    }
  };

  return (
    <div className="p-4">
      <div className="grid grid-cols-10 gap-1">
        {inputRefs.current.map((_, index) => (
          <TextField
            key={index}
            fullWidth
            type="text"
            disabled={isLoading}
            value={inputValues[index]}
            sx={{
              '& .MuiOutlinedInput-root': {
                padding: 0,  // ลบ padding ของ root element
              },
              '& .MuiOutlinedInput-input': {
                padding: '8px 0',  // กำหนด padding เฉพาะบนล่าง
                textAlign: 'center',
                fontSize: '20px',
                fontWeight: 'bold',
                height: '20px',  // กำหนดความสูงที่แน่นอน
                minHeight: 'unset',  // ป้องกัน min-height จาก MUI
                width: '100%',  // ให้กว้างเต็ม container
              },

              // ปรับขนาด container ให้พอดี
              width: '100%',
              '& .MuiInputBase-root': {
                height: '46px',  // กำหนดความสูงของ input container
              }
            }}
            inputProps={{
              maxLength: 1,
              pattern: "[0-9]*",
              inputMode: "numeric",
              style: {
                padding: 0,  // ป้องกัน padding จาก inputProps
              }
            }}
            onKeyDown={(e) => handleInputKeyDown(e as unknown as KeyboardEvent, index)}
            onChange={(e) => handleInputChange(e, index)}
            onFocus={() => handleInputFocus(index)}
            onPaste={(e) => handlePaste(e, index)}
            inputRef={(el) => (inputRefs.current[index] = el)}
          />
        ))}
      </div>

      {error && (
        <Alert
          severity={error.includes('บันทึกข้อมูลเรียบร้อย') ? 'success' : 'error'}
          className="mt-4"
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}

      {registerCheck && (
        <div>
          <Link href={`${process.env.NEXT_PUBLIC_BASE_REGISTER_URL}`} target="_blank" title="กรุณาลงทะเบียนในระบบก่อน">
            <Button
              className='mt-4 text-base'
              variant='contained'
              color='success'
              fullWidth={true}
              disabled={isLoading}
              startIcon={<i className='tabler-user-pentagon text-[20px]' />}
            >
              กรุณาลงทะเบียนในระบบก่อน
            </Button>
          </Link>
        </div>
      )}

      {allInputsFilled && (
        <Button
          className='mt-4 text-base'
          variant='contained'
          color='primary'
          fullWidth={true}
          disabled={isLoading}
          startIcon={<i className='tabler-phone-check text-[20px]' />}
          onClick={handleUpdate}
        >
          {isLoading ? 'กำลังตรวจสอบ...' : 'บันทึกเบอร์โทรศัพท์'}
        </Button>
      )}
    </div>
  );
};

export default PhoneInput;
