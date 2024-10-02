/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { useEffect, useRef } from 'react'

interface DateInputProps {
  value?: Date
  onChange: (date: Date) => void
}

interface DateParts {
  day: number
  month: number
  year: number
}

const DateInput: React.FC<DateInputProps> = ({ value, onChange }) => {
  const [date, setDate] = React.useState<DateParts>(() => {
    const d = value ? new Date(value) : new Date()
    return {
      day: d.getDate(),
      month: d.getMonth() + 1, // JavaScript months are 0-indexed
      year: d.getFullYear()
    }
  })

  const monthRef = useRef<HTMLInputElement | null>(null)
  const dayRef = useRef<HTMLInputElement | null>(null)
  const yearRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    const d = value ? new Date(value) : new Date()
    setDate({
      day: d.getDate(),
      month: d.getMonth() + 1,
      year: d.getFullYear()
    })
  }, [value])

  const validateDate = (field: keyof DateParts, value: number): boolean => {
    if (
      (field === 'day' && (value < 1 || value > 31)) ||
      (field === 'month' && (value < 1 || value > 12)) ||
      (field === 'year' && (value < 1000 || value > 9999))
    ) {
      return false
    }

    const newDate = { ...date, [field]: value }
    const d = new Date(newDate.year, newDate.month - 1, newDate.day)
    return d.getFullYear() === newDate.year &&
           d.getMonth() + 1 === newDate.month &&
           d.getDate() === newDate.day
  }

  const handleInputChange =
    (field: keyof DateParts) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = Number(e.target.value)
      const isValid = validateDate(field, newValue)

      const newDate = { ...date, [field]: newValue }
      setDate(newDate)

      if (isValid) {
        onChange(new Date(newDate.year, newDate.month - 1, newDate.day))
      }
    }

  const handleBlur = (field: keyof DateParts) => (e: React.FocusEvent<HTMLInputElement>): void => {
    if (!e.target.value) {
      // @ts-ignore
      setDate((prev) => ({ ...prev, [field]: value ? new Date(value)[field]() : new Date()[field]() }))
    } else {
      const newValue = Number(e.target.value)
      const isValid = validateDate(field, newValue)

      if (!isValid) {
        // @ts-ignore
        setDate((prev) => ({ ...prev, [field]: value ? new Date(value)[field]() : new Date()[field]() }))
      }
    }
  }

  const handleKeyDown = (field: keyof DateParts) => (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.metaKey || e.ctrlKey) {
      return
    }

    if (
      !/^[0-9]$/.test(e.key) &&
      !['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Delete', 'Tab', 'Backspace', 'Enter'].includes(e.key)
    ) {
      e.preventDefault()
      return
    }

    let newDate = { ...date }

    if (e.key === 'ArrowUp') {
      e.preventDefault()

      if (field === 'day') {
        if (date.day === new Date(date.year, date.month, 0).getDate()) {
          newDate = { ...newDate, day: 1, month: (date.month % 12) + 1 }
          if (newDate.month === 1) newDate.year += 1
        } else {
          newDate.day += 1
        }
      }

      if (field === 'month') {
        if (date.month === 12) {
          newDate = { ...newDate, month: 1, year: date.year + 1 }
        } else {
          newDate.month += 1
        }
      }

      if (field === 'year') {
        newDate.year += 1
      }

      setDate(newDate)
      onChange(new Date(newDate.year, newDate.month - 1, newDate.day))
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()

      if (field === 'day') {
        if (date.day === 1) {
          newDate.month -= 1
          if (newDate.month === 0) {
            newDate.month = 12
            newDate.year -= 1
          }
          newDate.day = new Date(newDate.year, newDate.month, 0).getDate()
        } else {
          newDate.day -= 1
        }
      }

      if (field === 'month') {
        if (date.month === 1) {
          newDate = { ...newDate, month: 12, year: date.year - 1 }
        } else {
          newDate.month -= 1
        }
      }

      if (field === 'year') {
        newDate.year -= 1
      }

      setDate(newDate)
      onChange(new Date(newDate.year, newDate.month - 1, newDate.day))
    }
  }

  return (
    <div className="flex border rounded-lg items-center text-sm px-1">
      <input
        type="text"
        ref={dayRef}
        max={31}
        maxLength={2}
        value={date.day.toString()}
        onChange={handleInputChange('day')}
        onKeyDown={handleKeyDown('day')}
        onBlur={handleBlur('day')}
        className="p-0 outline-none w-7 border-none text-center bg-transparent"
        placeholder="D"
      />
      <span className="opacity-20 -mx-px">/</span>
      <input
        type="text"
        ref={monthRef}
        max={12}
        maxLength={2}
        value={date.month.toString()}
        onChange={handleInputChange('month')}
        onKeyDown={handleKeyDown('month')}
        onBlur={handleBlur('month')}
        className="p-0 outline-none w-6 border-none text-center bg-transparent"
        placeholder="M"
      />
      <span className="opacity-20 -mx-px">/</span>
      <input
        type="text"
        ref={yearRef}
        max={9999}
        maxLength={4}
        value={date.year.toString()}
        onChange={handleInputChange('year')}
        onKeyDown={handleKeyDown('year')}
        onBlur={handleBlur('year')}
        className="p-0 outline-none w-12 border-none text-center bg-transparent"
        placeholder="YYYY"
      />
    </div>
  )
}

DateInput.displayName = 'DateInput'

export { DateInput }
