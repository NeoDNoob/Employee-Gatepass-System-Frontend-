"use client"

import * as React from "react"
import { addDays, format, setHours, setMinutes } from "date-fns"
import { CalendarIcon, Clock } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

const DateTimeRangePicker = ({ className, value, onChange }) => {
  const [dateRange, setDateRange] = React.useState({
    from: value?.from || new Date(),
    to: value?.to || addDays(new Date(), 1),
  })

  const [startTime, setStartTime] = React.useState({
    hours: "07",
    minutes: "00",
    period: "AM",
  })

  const [endTime, setEndTime] = React.useState({
    hours: "05",
    minutes: "00",
    period: "PM",
  })

  // Sync internal state with value prop when it changes
  React.useEffect(() => {
    if (value?.from) {
      setDateRange({
        from: value.from ? new Date(value.from) : new Date(),
        to: value.to ? new Date(value.to) : addDays(new Date(), 1),
      })
      // Set start time
      const fromDate = new Date(value.from)
      let startHour = fromDate.getHours()
      let startPeriod = startHour >= 12 ? "PM" : "AM"
      if (startHour === 0) startHour = 12
      else if (startHour > 12) startHour -= 12
      setStartTime({
        hours: startHour.toString().padStart(2, "0"),
        minutes: fromDate.getMinutes().toString().padStart(2, "0"),
        period: startPeriod,
      })
      // Set end time
      const toDate = value.to ? new Date(value.to) : new Date(value.from)
      let endHour = toDate.getHours()
      let endPeriod = endHour >= 12 ? "PM" : "AM"
      if (endHour === 0) endHour = 12
      else if (endHour > 12) endHour -= 12
      setEndTime({
        hours: endHour.toString().padStart(2, "0"),
        minutes: toDate.getMinutes().toString().padStart(2, "0"),
        period: endPeriod,
      })
    }
  }, [value])

  // When user selects a new date range, preserve the time pickers
  const handleDateRangeChange = (newRange) => {
    setDateRange({
      from: newRange?.from || null,
      to: newRange?.to || (newRange?.from ? newRange.from : null),
    })
  }

  // Update parent component when values change
  React.useEffect(() => {
    if (dateRange?.from) {
      const fullRange = getFullDateTimeRange()
      onChange(fullRange)
    }
  }, [dateRange, startTime, endTime])

  // Combine date and time
  const getFullDateTimeRange = () => {
    if (!dateRange?.from) {
      return { from: undefined, to: undefined }
    }

    let fromDateTime = new Date(dateRange.from)
    // Convert 12-hour to 24-hour format for internal use
    let startHour = Number.parseInt(startTime.hours)
    if (startTime.period === "PM" && startHour < 12) startHour += 12
    if (startTime.period === "AM" && startHour === 12) startHour = 0

    fromDateTime = setHours(fromDateTime, startHour)
    fromDateTime = setMinutes(fromDateTime, Number.parseInt(startTime.minutes))

    let toDateTime = dateRange.to ? new Date(dateRange.to) : new Date(dateRange.from)
    // Convert 12-hour to 24-hour format for internal use
    let endHour = Number.parseInt(endTime.hours)
    if (endTime.period === "PM" && endHour < 12) endHour += 12
    if (endTime.period === "AM" && endHour === 12) endHour = 0

    toDateTime = setHours(toDateTime, endHour)
    toDateTime = setMinutes(toDateTime, Number.parseInt(endTime.minutes))

    return {
      from: fromDateTime,
      to: toDateTime,
    }
  }

  const fullDateTimeRange = getFullDateTimeRange()

  // Generate hours and minutes options for 12-hour format
  const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, "0"))
  const minutes = ["00", "15", "30", "45"]
  const periods = ["AM", "PM"]

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn("w-full justify-start text-left font-normal", !dateRange && "text-muted-foreground")}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {fullDateTimeRange.from ? (
              fullDateTimeRange.to ? (
                <>
                  {format(fullDateTimeRange.from, "LLL dd, y h:mm a")} -{" "}
                  {format(fullDateTimeRange.to, "LLL dd, y h:mm a")}
                </>
              ) : (
                format(fullDateTimeRange.from, "LLL dd, y h:mm a")
              )
            ) : (
              <span>Pick a date and time range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 z-[9999] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-300 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 align-start">
          <div className="p-4 border-b">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateRange?.from}
              selected={dateRange}
              onSelect={handleDateRangeChange}
              numberOfMonths={2}
            />
          </div>

          <div className="p-4 grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center">
                  <Clock className="mr-2 h-4 w-4" />
                  <Label htmlFor="start-time">Start Time</Label>
                </div>
                <div className="flex gap-2">
                  <Select
                    value={startTime.hours}
                    onValueChange={(value) => setStartTime({ ...startTime, hours: value })}
                  >
                    <SelectTrigger id="start-hours" className="w-full">
                      <SelectValue placeholder="Hour" />
                    </SelectTrigger>
                    <SelectContent>
                      {hours.map((hour) => (
                        <SelectItem key={`start-hour-${hour}`} value={hour}>
                          {hour}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <span className="flex items-center">:</span>
                  <Select
                    value={startTime.minutes}
                    onValueChange={(value) => setStartTime({ ...startTime, minutes: value })}
                  >
                    <SelectTrigger id="start-minutes" className="w-full">
                      <SelectValue placeholder="Min" />
                    </SelectTrigger>
                    <SelectContent>
                      {minutes.map((minute) => (
                        <SelectItem key={`start-minute-${minute}`} value={minute}>
                          {minute}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={startTime.period}
                    onValueChange={(value) => setStartTime({ ...startTime, period: value })}
                  >
                    <SelectTrigger id="start-period" className="w-[70px]">
                      <SelectValue placeholder="AM/PM" />
                    </SelectTrigger>
                    <SelectContent>
                      {periods.map((period) => (
                        <SelectItem key={`start-period-${period}`} value={period}>
                          {period}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center">
                  <Clock className="mr-2 h-4 w-4" />
                  <Label htmlFor="end-time">End Time</Label>
                </div>
                <div className="flex gap-2">
                  <Select value={endTime.hours} onValueChange={(value) => setEndTime({ ...endTime, hours: value })}>
                    <SelectTrigger id="end-hours" className="w-full">
                      <SelectValue placeholder="Hour" />
                    </SelectTrigger>
                    <SelectContent>
                      {hours.map((hour) => (
                        <SelectItem key={`end-hour-${hour}`} value={hour}>
                          {hour}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <span className="flex items-center">:</span>
                  <Select value={endTime.minutes} onValueChange={(value) => setEndTime({ ...endTime, minutes: value })}>
                    <SelectTrigger id="end-minutes" className="w-full">
                      <SelectValue placeholder="Min" />
                    </SelectTrigger>
                    <SelectContent>
                      {minutes.map((minute) => (
                        <SelectItem key={`end-minute-${minute}`} value={minute}>
                          {minute}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={endTime.period} onValueChange={(value) => setEndTime({ ...endTime, period: value })}>
                    <SelectTrigger id="end-period" className="w-[70px]">
                      <SelectValue placeholder="AM/PM" />
                    </SelectTrigger>
                    <SelectContent>
                      {periods.map((period) => (
                        <SelectItem key={`end-period-${period}`} value={period}>
                          {period}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

export default DateTimeRangePicker

