'use client'

import { useState, useEffect, useMemo } from 'react'
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormControl from '@mui/material/FormControl'
import FormLabel from '@mui/material/FormLabel'
import TextField from '@mui/material/TextField'
import Chip from '@mui/material/Chip'
import Box from '@mui/material/Box'

type SessionSelectorProps = {
  sessions: string[]
  sessionCounts: Record<string, number>
  value: string
  onChange: (value: string) => void
  error?: boolean
  helperText?: string
}

const SessionSelector = ({
  sessions,
  sessionCounts,
  value,
  onChange,
  error,
  helperText
}: SessionSelectorProps) => {

  const [mode, setMode] = useState<'existing' | 'new'>('existing')
  const [newSessionName, setNewSessionName] = useState('')

  // ถ้า value ไม่อยู่ใน sessions ที่มีอยู่ = กำลังสร้างใหม่
  useEffect(() => {
    if (value && sessions.length > 0) {
      if (sessions.includes(value)) {
        setMode('existing')
      } else {
        setMode('new')
        setNewSessionName(value)
      }
    }
  }, [])

  const handleModeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedValue = event.target.value

    if (selectedValue === '__new__') {
      setMode('new')
      onChange(newSessionName)
    } else {
      setMode('existing')
      onChange(selectedValue)
    }
  }

  const handleNewSessionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value
    setNewSessionName(newValue)
    onChange(newValue)
  }

  return (
    <FormControl fullWidth error={error} className="mb-4">
      <FormLabel className="mb-2 text-sm font-medium">
        ชื่อภารกิจ (Session)
      </FormLabel>

      <Box className="border rounded-md p-3 bg-gray-50 dark:bg-gray-800">
        <RadioGroup
          value={mode === 'new' ? '__new__' : value}
          onChange={handleModeChange}
        >
          {/* แสดง sessions ที่มีอยู่ */}
          {sessions.length > 0 ? (
            sessions.map((session) => (
              <FormControlLabel
                key={session}
                value={session}
                control={<Radio size="small" />}
                label={
                  <Box className="flex items-center gap-2">
                    <span className="font-medium">{session}</span>
                    <Chip
                      size="small"
                      label={`${sessionCounts[session] || 0} missions`}
                      color="primary"
                      variant="outlined"
                    />
                  </Box>
                }
                className="mb-1"
              />
            ))
          ) : (
            <Box className="text-gray-500 text-sm mb-2 p-2">
              ยังไม่มี session ในระบบ
            </Box>
          )}

          {/* ตัวเลือกสร้างใหม่ */}
          <FormControlLabel
            value="__new__"
            control={<Radio size="small" />}
            label={
              <Box className="flex items-center gap-2 w-full">
                <span className="font-medium text-primary">+ สร้างใหม่</span>
              </Box>
            }
            className="mt-2 border-t pt-2"
          />
        </RadioGroup>

        {/* TextField สำหรับพิมพ์ชื่อใหม่ */}
        {mode === 'new' && (
          <TextField
            fullWidth
            size="small"
            placeholder="พิมพ์ชื่อ session ใหม่..."
            value={newSessionName}
            onChange={handleNewSessionChange}
            className="mt-2 ml-8"
            autoFocus
            error={error && !newSessionName}
            helperText={!newSessionName ? 'กรุณากรอกชื่อ session' : ''}
          />
        )}
      </Box>

      {helperText && (
        <Box className="text-red-500 text-xs mt-1 ml-3">
          {helperText}
        </Box>
      )}
    </FormControl>
  )
}

export default SessionSelector
