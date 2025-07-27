import React, { useState } from 'react';
import { Button } from './ui/button';
import { Calendar } from './ui/calendar';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from './ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface DateRange {
  from?: Date;
  to?: Date;
}

interface RepeatSettings {
  type: 'weekly' | 'monthly' | 'yearly';
  startDate?: Date;
  endDate?: Date;
  weekdays?: number[]; // 0=일요일, 1=월요일, ...
}

interface DatePickerSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate?: Date;
  onDateSelect: (date?: Date, range?: DateRange, repeat?: RepeatSettings) => void;
}

export function DatePickerSheet({ open, onOpenChange, selectedDate, onDateSelect }: DatePickerSheetProps) {
  const [activeTab, setActiveTab] = useState('normal');
  const [singleDate, setSingleDate] = useState<Date | undefined>(selectedDate);
  const [dateRange, setDateRange] = useState<DateRange>({});
  const [repeatSettings, setRepeatSettings] = useState<RepeatSettings>({
    type: 'weekly',
    weekdays: []
  });
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];

  const handleSingleDateSelect = (date: Date | undefined) => {
    setSingleDate(date);
  };

  const handleRangeDateSelect = (date: Date | undefined) => {
    if (!date) return;
    
    if (!dateRange.from || (dateRange.from && dateRange.to)) {
      // 첫 번째 클릭 또는 범위가 이미 설정된 경우 새로 시작
      setDateRange({ from: date, to: undefined });
    } else if (dateRange.from && !dateRange.to) {
      // 두 번째 클릭
      if (date < dateRange.from) {
        setDateRange({ from: date, to: dateRange.from });
      } else {
        setDateRange({ from: dateRange.from, to: date });
      }
    }
  };

  const handleRepeatWeekdayToggle = (dayIndex: number) => {
    const newWeekdays = repeatSettings.weekdays?.includes(dayIndex)
      ? repeatSettings.weekdays.filter(d => d !== dayIndex)
      : [...(repeatSettings.weekdays || []), dayIndex];
    
    setRepeatSettings(prev => ({
      ...prev,
      weekdays: newWeekdays
    }));
  };

  const handleConfirm = () => {
    switch (activeTab) {
      case 'normal':
        onDateSelect(singleDate);
        break;
      case 'range':
        onDateSelect(undefined, dateRange);
        break;
      case 'repeat':
        onDateSelect(undefined, undefined, repeatSettings);
        break;
    }
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      if (direction === 'prev') {
        newMonth.setMonth(prev.getMonth() - 1);
      } else {
        newMonth.setMonth(prev.getMonth() + 1);
      }
      return newMonth;
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[80vh] p-0">
        <div className="flex flex-col h-full">
          <SheetHeader className="p-4 border-b">
            <div className="flex items-center justify-between">
              <Button variant="ghost" onClick={handleCancel}>
                ✕
              </Button>
              <SheetTitle>날짜 선택</SheetTitle>
              <Button onClick={handleConfirm}>완료</Button>
            </div>
          </SheetHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-3 mx-4 mt-4">
              <TabsTrigger value="normal">일반</TabsTrigger>
              <TabsTrigger value="range">기간</TabsTrigger>
              <TabsTrigger value="repeat">반복</TabsTrigger>
            </TabsList>

            {/* 월 네비게이션 */}
            <div className="flex items-center justify-between px-4 py-2 border-b">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigateMonth('prev')}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h3 className="text-lg font-medium">
                {currentMonth.getFullYear()}년 {currentMonth.getMonth() + 1}월
              </h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigateMonth('next')}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex-1 overflow-auto">
              <TabsContent value="normal" className="p-4 m-0">
                <Calendar
                  mode="single"
                  selected={singleDate}
                  onSelect={handleSingleDateSelect}
                  month={currentMonth}
                  onMonthChange={setCurrentMonth}
                  className="w-full"
                />
              </TabsContent>

              <TabsContent value="range" className="p-4 m-0">
                <div className="mb-4 text-sm text-gray-600">
                  시작 날짜와 종료 날짜를 차례로 선택하세요
                </div>
                <Calendar
                  mode="range"
                  selected={dateRange}
                  onSelect={(range) => {
                    if (range) {
                      setDateRange(range);
                    }
                  }}
                  month={currentMonth}
                  onMonthChange={setCurrentMonth}
                  className="w-full"
                />
                {dateRange.from && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <div className="text-sm">
                      <div>시작: {dateRange.from.toLocaleDateString('ko-KR')}</div>
                      {dateRange.to && (
                        <div>종료: {dateRange.to.toLocaleDateString('ko-KR')}</div>
                      )}
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="repeat" className="p-4 m-0 space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">반복 유형</label>
                  <Select
                    value={repeatSettings.type}
                    onValueChange={(value: 'weekly' | 'monthly' | 'yearly') =>
                      setRepeatSettings(prev => ({ ...prev, type: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">매주</SelectItem>
                      <SelectItem value="monthly">매월</SelectItem>
                      <SelectItem value="yearly">매년</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {repeatSettings.type === 'weekly' && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">요일 선택</label>
                    <div className="grid grid-cols-7 gap-2">
                      {weekdays.map((day, index) => (
                        <Button
                          key={index}
                          variant={repeatSettings.weekdays?.includes(index) ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleRepeatWeekdayToggle(index)}
                          className="aspect-square"
                        >
                          {day}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium mb-2 block">시작 날짜</label>
                  <Calendar
                    mode="single"
                    selected={repeatSettings.startDate}
                    onSelect={(date) =>
                      setRepeatSettings(prev => ({ ...prev, startDate: date }))
                    }
                    month={currentMonth}
                    onMonthChange={setCurrentMonth}
                    className="w-full"
                  />
                </div>

                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Checkbox
                      id="endDate"
                      checked={!!repeatSettings.endDate}
                      onCheckedChange={(checked) => {
                        if (!checked) {
                          setRepeatSettings(prev => ({ ...prev, endDate: undefined }));
                        }
                      }}
                    />
                    <label htmlFor="endDate" className="text-sm font-medium">
                      종료 날짜 설정
                    </label>
                  </div>
                  {repeatSettings.endDate !== undefined && (
                    <Calendar
                      mode="single"
                      selected={repeatSettings.endDate}
                      onSelect={(date) =>
                        setRepeatSettings(prev => ({ ...prev, endDate: date }))
                      }
                      month={currentMonth}
                      onMonthChange={setCurrentMonth}
                      className="w-full"
                    />
                  )}
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
}