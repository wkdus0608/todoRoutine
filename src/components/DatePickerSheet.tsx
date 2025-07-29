import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Switch,
  ScrollView,
  Modal,
  TextInput,
} from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { RepeatSettings } from '../types';

LocaleConfig.locales['ko'] = {
  monthNames: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
  monthNamesShort: ['1.', '2.', '3.', '4.', '5.', '6.', '7.', '8.', '9.', '10.', '11.', '12.'],
  dayNames: ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'],
  dayNamesShort: ['일', '월', '화', '수', '목', '금', '토'],
  today: '오늘',
};
LocaleConfig.defaultLocale = 'ko';

type DateInfo = {
  date?: string;
  range?: { start?: string; end?: string };
  repeat?: RepeatSettings;
};

interface DatePickerSheetProps {
  onClose: () => void;
  onConfirm: (dateInfo: DateInfo) => void;
}

type Mode = '일반' | '기간' | '반복';
const MODES: Mode[] = ['일반', '기간', '반복'];
const WEEKDAYS = [
  { key: 'sunday', label: '일' }, { key: 'monday', label: '월' },
  { key: 'tuesday', label: '화' }, { key: 'wednesday', label: '수' },
  { key: 'thursday', label: '목' }, { key: 'friday', label: '금' },
  { key: 'saturday', label: '토' },
];
const FREQUENCY_OPTIONS = [
    { label: '매주', value: 'weekly' },
    { label: '매월', value: 'monthly' },
    { label: '매년', value: 'yearly' },
] as const;

const DatePickerSheet: React.FC<DatePickerSheetProps> = ({ onClose, onConfirm }) => {
  const [mode, setMode] = useState<Mode>('일반');
  
  const [selectedDate, setSelectedDate] = useState<string | undefined>();
  const [time, setTime] = useState('09:00'); // Default time
  const [dateRange, setDateRange] = useState<{ start?: string; end?: string }>({});
  
  const [repeatFrequency, setRepeatFrequency] = useState<'weekly' | 'monthly' | 'yearly'>('weekly');
  const [selectedWeekdays, setSelectedWeekdays] = useState<any>({ monday: true }); // Default to Monday
  const [repeatStartDate, setRepeatStartDate] = useState<string | undefined>(new Date().toISOString().split('T')[0]);
  const [isEndDateEnabled, setIsEndDateEnabled] = useState(false);
  const [repeatEndDate, setRepeatEndDate] = useState<string | undefined>();
  const [selectingDateFor, setSelectingDateFor] = useState<'start' | 'end' | null>(null);

  const [isFrequencyPickerVisible, setFrequencyPickerVisible] = useState(false);
  const frequencyButtonRef = useRef(null);
  const [frequencyPickerPosition, setFrequencyPickerPosition] = useState({ top: 0, left: 0, width: 0 });

  const [markedDates, setMarkedDates] = useState({});

  const handleDayPress = (day: { dateString: string }) => {
    const { dateString } = day;
    if (selectingDateFor) { // Handle date selection for repeat start/end
        if (selectingDateFor === 'start') setRepeatStartDate(dateString);
        if (selectingDateFor === 'end') setRepeatEndDate(dateString);
        setSelectingDateFor(null); // Close calendar after selection
        return;
    }

    if (mode === '일반') {
      setSelectedDate(dateString);
      setMarkedDates({ [dateString]: { selected: true, selectedColor: '#3B82F6' } });
    } else if (mode === '기간') {
      if (!dateRange.start || dateRange.end) {
        const newRange = { start: dateString, end: undefined };
        setDateRange(newRange);
        setMarkedDates({ [dateString]: { startingDay: true, color: '#3B82F6', textColor: 'white' } });
      } else {
        const start = new Date(dateRange.start);
        const end = new Date(dateString);
        setDateRange({ start: dateRange.start, end: dateString });
        
        const newMarked = {};
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            const ds = d.toISOString().split('T')[0];
            newMarked[ds] = {
                color: ds === dateRange.start || ds === dateString ? '#3B82F6' : '#D6E4FF',
                textColor: ds === dateRange.start || ds === dateString ? 'white' : '#3B82F6',
                startingDay: ds === dateRange.start,
                endingDay: ds === dateString,
            };
        }
        setMarkedDates(newMarked);
      }
    }
  };

  const toggleWeekday = (dayKey: string) => {
    setSelectedWeekdays(prev => ({ ...prev, [dayKey]: !prev[dayKey] }));
  };

  const handleConfirmPress = () => {
    let result: DateInfo = {};
    if (mode === '일반' && selectedDate) {
      const [hours, minutes] = time.split(':').map(Number);
      const combinedDate = new Date(selectedDate);
      combinedDate.setHours(hours, minutes);
      result = { date: combinedDate.toISOString() };
    } else if (mode === '기간') {
      result = { range: dateRange };
    } else if (mode === '반복' && repeatStartDate) {
      result = {
        repeat: {
          frequency: repeatFrequency,
          startDate: repeatStartDate,
          endDate: isEndDateEnabled ? repeatEndDate : undefined,
          weekdays: repeatFrequency === 'weekly' ? selectedWeekdays : undefined,
        },
      };
    }
    onConfirm(result);
  };

  const openFrequencyPicker = () => {
    frequencyButtonRef.current?.measureInWindow((x, y, width, height) => {
        setFrequencyPickerPosition({ top: y + height, left: x, width });
        setFrequencyPickerVisible(true);
    });
  };

  const renderRepeatContent = () => (
    <ScrollView>
      <Text style={styles.label}>반복 유형</Text>
      <TouchableOpacity
        ref={frequencyButtonRef}
        style={styles.dropdownButton}
        onPress={openFrequencyPicker}>
        <Text>{FREQUENCY_OPTIONS.find(opt => opt.value === repeatFrequency)?.label}</Text>
        <Icon name="arrow-drop-down" size={24} color="#6B7280" />
      </TouchableOpacity>

      {repeatFrequency === 'weekly' && (
        <>
          <Text style={styles.label}>요일 선택</Text>
          <View style={styles.weekdaySelector}>
            {WEEKDAYS.map(day => (
              <TouchableOpacity
                key={day.key}
                style={[styles.weekdayButton, selectedWeekdays[day.key] && styles.selectedWeekdayButton]}
                onPress={() => toggleWeekday(day.key)}>
                <Text style={[styles.weekdayText, selectedWeekdays[day.key] && styles.selectedWeekdayText]}>{day.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      <Text style={styles.label}>시작 날짜</Text>
      <TouchableOpacity style={styles.dateInput} onPress={() => setSelectingDateFor(prev => prev === 'start' ? null : 'start')}>
        <Text>{repeatStartDate || '날짜를 선택하세요'}</Text>
      </TouchableOpacity>
      {selectingDateFor === 'start' && <Calendar onDayPress={handleDayPress} />}

      <View style={styles.endDateRow}>
        <Text style={styles.label}>종료 날짜 설정</Text>
        <Switch value={isEndDateEnabled} onValueChange={setIsEndDateEnabled} />
      </View>
      
      {isEndDateEnabled && (
         <TouchableOpacity style={styles.dateInput} onPress={() => setSelectingDateFor(prev => prev === 'end' ? null : 'end')}>
            <Text>{repeatEndDate || '날짜를 선택하세요'}</Text>
         </TouchableOpacity>
      )}
      {isEndDateEnabled && selectingDateFor === 'end' && <Calendar onDayPress={handleDayPress} />}
    </ScrollView>
  );

  return (
    <View style={styles.sheetContainer}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>날짜 선택</Text>
        <TouchableOpacity onPress={onClose}>
          <Icon name="close" size={24} />
        </TouchableOpacity>
      </View>

      <View style={styles.modeSelector}>
        {MODES.map(m => (
          <TouchableOpacity
            key={m}
            style={[styles.modeButton, mode === m && styles.selectedModeButton]}
            onPress={() => setMode(m)}>
            <Text style={[styles.modeText, mode === m && styles.selectedModeText]}>{m}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {mode === '반복' ? renderRepeatContent() : (
        <>
          <Calendar
              onDayPress={handleDayPress}
              markingType={mode === '기간' ? 'period' : 'custom'}
              markedDates={markedDates}
              theme={{
                  arrowColor: '#3B82F6',
                  todayTextColor: '#3B82F6',
              }}
          />
          {mode === '일반' && (
            <View style={styles.timeInputContainer}>
              <Text style={styles.label}>시간</Text>
              <TextInput
                style={styles.timeInput}
                value={time}
                onChangeText={setTime}
                placeholder="HH:MM"
                maxLength={5}
                keyboardType="numeric"
              />
            </View>
          )}
        </>
      )}

      <View style={styles.footer}>
        <TouchableOpacity style={styles.footerButton} onPress={onClose}><Text>취소</Text></TouchableOpacity>
        <TouchableOpacity style={[styles.footerButton, styles.confirmButton]} onPress={handleConfirmPress}>
            <Text style={styles.confirmButtonText}>완료</Text>
        </TouchableOpacity>
      </View>

      <Modal
        transparent={true}
        visible={isFrequencyPickerVisible}
        onRequestClose={() => setFrequencyPickerVisible(false)}>
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={() => setFrequencyPickerVisible(false)}>
            <View style={[styles.frequencyPicker, { top: frequencyPickerPosition.top, left: frequencyPickerPosition.left, width: frequencyPickerPosition.width }]}>
                {FREQUENCY_OPTIONS.map(opt => (
                    <TouchableOpacity
                        key={opt.value}
                        style={styles.frequencyPickerItem}
                        onPress={() => {
                            setRepeatFrequency(opt.value);
                            setFrequencyPickerVisible(false);
                        }}>
                        <Text>{opt.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
    sheetContainer: { backgroundColor: 'white', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 16, height: '90%' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 16 },
    headerTitle: { fontSize: 20, fontWeight: 'bold' },
    modeSelector: { flexDirection: 'row', justifyContent: 'center', backgroundColor: '#F3F4F6', borderRadius: 8, marginBottom: 16 },
    modeButton: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 6, margin: 4 },
    selectedModeButton: { backgroundColor: 'white', elevation: 2, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 1.41 },
    modeText: { fontSize: 16, fontWeight: '500', color: '#6B7280' },
    selectedModeText: { color: '#1F2937' },
    label: { fontSize: 16, fontWeight: '500', color: '#374151', marginTop: 16, marginBottom: 8 },
    dropdownButton: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: 8, padding: 12 },
    weekdaySelector: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 8 },
    weekdayButton: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F3F4F6' },
    selectedWeekdayButton: { backgroundColor: '#3B82F6' },
    weekdayText: { fontWeight: 'bold', color: '#374151' },
    selectedWeekdayText: { color: 'white' },
    endDateRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
    dateInput: { backgroundColor: '#F3F4F6', borderRadius: 8, padding: 12, marginVertical: 4 },
    footer: { flexDirection: 'row', justifyContent: 'flex-end', paddingTop: 16, borderTopWidth: 1, borderTopColor: '#E5E7EB', marginTop: 'auto' },
    footerButton: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8 },
    confirmButton: { backgroundColor: '#1F2937', marginLeft: 8 },
    confirmButtonText: { color: 'white', fontWeight: 'bold' },
    frequencyPicker: { position: 'absolute', backgroundColor: 'white', borderRadius: 8, borderColor: '#E5E7EB', borderWidth: 1, elevation: 5 },
    frequencyPickerItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
    timeInputContainer: {
        marginTop: 16,
    },
    timeInput: {
        backgroundColor: '#F3F4F6',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        textAlign: 'center',
    },
});

export default DatePickerSheet;
