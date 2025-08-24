import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, View, Text } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { Todo, Routine as Project } from '../types';
import {
  eachDayOfInterval,
  format,
  addDays,
  addMonths,
  addYears,
  isWithinInterval,
  parseISO,
} from 'date-fns';

LocaleConfig.locales['ko'] = {
  monthNames: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
  monthNamesShort: ['1.', '2.', '3.', '4.', '5.', '6.', '7.', '8.', '9.', '10.', '11.', '12.'],
  dayNames: ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'],
  dayNamesShort: ['일', '월', '화', '수', '목', '금', '토'],
  today: '오늘'
};
LocaleConfig.defaultLocale = 'ko';

const CalendarScreen = ({ projects }: { projects: Project[] }) => {

  const getAllTodos = (projects: Project[]): Todo[] => {
    let allTodos: Todo[] = [];
    projects.forEach(project => {
      allTodos = allTodos.concat(project.todos);
      if (project.children) {
        allTodos = allTodos.concat(getAllTodos(project.children));
      }
    });
    return allTodos;
  };

  const todos = getAllTodos(projects);
  const markedDates = {};

  todos.forEach(todo => {
    // Handle single due date
    if (todo.dueDate) {
      const date = format(parseISO(todo.dueDate), 'yyyy-MM-dd');
      if (!markedDates[date]) {
        markedDates[date] = { dots: [] };
      }
      markedDates[date].dots.push({
        key: todo.id,
        color: 'blue',
        name: todo.text,
      });
    }

    // Handle date range
    if (todo.dateRange && todo.dateRange.startDate && todo.dateRange.endDate) {
        const start = parseISO(todo.dateRange.startDate);
        const end = parseISO(todo.dateRange.endDate);
        const interval = eachDayOfInterval({ start, end });

        interval.forEach((day, index) => {
            const dateString = format(day, 'yyyy-MM-dd');
            if (!markedDates[dateString]) {
                markedDates[dateString] = {};
            }
            markedDates[dateString].startingDay = index === 0;
            markedDates[dateString].endingDay = index === interval.length - 1;
            markedDates[dateString].color = 'lightblue';
            markedDates[dateString].textColor = 'black';
        });
    }

    // Handle weekly repetition
    if (todo.repeatSettings && todo.repeatSettings.frequency === 'weekly') {
        const { startDate, endDate, weekdays } = todo.repeatSettings;
        const start = parseISO(startDate);
        const end = endDate ? parseISO(endDate) : addDays(new Date(), 365); // Default to 1 year for repetition

        let currentDay = start;
        while (currentDay <= end) {
            const dayOfWeek = currentDay.getDay(); // 0 for Sunday, 1 for Monday, etc.
            const dateString = format(currentDay, 'yyyy-MM-dd');

            if (
                (weekdays.sunday && dayOfWeek === 0) ||
                (weekdays.monday && dayOfWeek === 1) ||
                (weekdays.tuesday && dayOfWeek === 2) ||
                (weekdays.wednesday && dayOfWeek === 3) ||
                (weekdays.thursday && dayOfWeek === 4) ||
                (weekdays.friday && dayOfWeek === 5) ||
                (weekdays.saturday && dayOfWeek === 6)
            ) {
                if (!markedDates[dateString]) {
                    markedDates[dateString] = { dots: [] };
                }
                if (!markedDates[dateString].dots) {
                    markedDates[dateString].dots = [];
                }
                markedDates[dateString].dots.push({
                    key: todo.id,
                    color: 'red',
                    name: todo.text,
                });
            }
            currentDay = addDays(currentDay, 1);
        }
    }

    // Handle monthly repetition
    if (todo.repeatSettings && todo.repeatSettings.frequency === 'monthly') {
        const { startDate, endDate } = todo.repeatSettings;
        const start = parseISO(startDate);
        const end = endDate ? parseISO(endDate) : addYears(new Date(), 5); // Default to 5 years for repetition

        let currentMonth = start;
        while (currentMonth <= end) {
            const dateString = format(currentMonth, 'yyyy-MM-dd');
            if (!markedDates[dateString]) {
                markedDates[dateString] = { dots: [] };
            }
            if (!markedDates[dateString].dots) {
                markedDates[dateString].dots = [];
            }
            markedDates[dateString].dots.push({
                key: todo.id,
                color: 'green',
                name: todo.text,
            });
            currentMonth = addMonths(currentMonth, 1);
        }
    }

    // Handle yearly repetition
    if (todo.repeatSettings && todo.repeatSettings.frequency === 'yearly') {
        const { startDate, endDate } = todo.repeatSettings;
        const start = parseISO(startDate);
        const end = endDate ? parseISO(endDate) : addYears(new Date(), 20); // Default to 20 years for repetition

        let currentYear = start;
        while (currentYear <= end) {
            const dateString = format(currentYear, 'yyyy-MM-dd');
            if (!markedDates[dateString]) {
                markedDates[dateString] = { dots: [] };
            }
            if (!markedDates[dateString].dots) {
                markedDates[dateString].dots = [];
            }
            markedDates[dateString].dots.push({
                key: todo.id,
                color: 'purple',
                name: todo.text,
            });
            currentYear = addYears(currentYear, 1);
        }
    }
  });

  const renderDay = (day, item) => {
    const dayData = markedDates[day.dateString];
    const dayStyle: any = [styles.dayContainer];
    if (dayData && dayData.color) {
        dayStyle.push({backgroundColor: dayData.color});
    }

    return (
      <View style={dayStyle}>
        <Text style={[styles.dayText, day.state === 'today' ? styles.todayText : {}]}>
          {day.day}
        </Text>
        <View style={styles.dotsContainer}>
          {dayData && dayData.dots && dayData.dots.map(dot => (
            <View key={dot.key} style={[styles.todoContainer, {backgroundColor: dot.color}]}>
              <Text style={styles.todoText} numberOfLines={1}>{dot.name}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Calendar
        markedDates={markedDates}
        dayComponent={({date, state, marking}) => renderDay(date, marking)}
        theme={{
          backgroundColor: '#ffffff',
          calendarBackground: '#ffffff',
          textSectionTitleColor: '#2d4150',
          selectedDayBackgroundColor: '#00adf5',
          selectedDayTextColor: '#ffffff',
          todayTextColor: '#00adf5',
          dayTextColor: '#2d4150',
          textDisabledColor: '#d9e1e8',
          dotColor: '#00adf5',
          selectedDotColor: '#ffffff',
          arrowColor: 'black',
          monthTextColor: 'black',
          indicatorColor: 'blue',
          textDayFontWeight: '300',
          textMonthFontWeight: 'bold',
          textDayHeaderFontWeight: '300',
          textDayFontSize: 16,
          textMonthFontSize: 20,
          textDayHeaderFontSize: 16,
          'stylesheet.calendar.header': {
            header: {
              backgroundColor: 'white',
              flexDirection: 'row',
              justifyContent: 'space-between',
              paddingLeft: 10,
              paddingRight: 10,
              marginTop: 6,
              alignItems: 'center'
            },
            monthText: {
              color: 'black',
              fontWeight: 'bold',
              fontSize: 20
            },
            dayHeader: {
              marginTop: 2,
              marginBottom: 7,
              width: 32,
              textAlign: 'center',
              fontSize: 14,
              color: 'black'
            },
          },
          'stylesheet.calendar.main': {
            container: {
              paddingLeft: 5,
              paddingRight: 5,
              backgroundColor: 'white'
            },
            week: {
              marginTop: 7,
              marginBottom: 7,
              flexDirection: 'row',
              justifyContent: 'space-around'
            },
          },
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  dayContainer: {
    backgroundColor: 'white',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    padding: 4,
    minHeight: 80,
    width: '100%',
  },
  dayText: {
    color: 'black',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 4,
  },
  todayText: {
    color: '#00adf5',
    fontWeight: 'bold',
  },
  dotsContainer: {
  },
  todoContainer: {
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    paddingVertical: 3,
    paddingHorizontal: 5,
    marginVertical: 1,
  },
  todoText: {
    color: 'white',
    fontSize: 10,
  },
});

export default CalendarScreen;