import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, View, Text } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { loadTodos } from '../storage/dataManager';
import { Todo } from '../types';
import { useFocusEffect } from '@react-navigation/native';

LocaleConfig.locales['ko'] = {
  monthNames: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
  monthNamesShort: ['1.', '2.', '3.', '4.', '5.', '6.', '7.', '8.', '9.', '10.', '11.', '12.'],
  dayNames: ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'],
  dayNamesShort: ['일', '월', '화', '수', '목', '금', '토'],
  today: '오늘'
};
LocaleConfig.defaultLocale = 'ko';

const CalendarScreen = () => {
  const [todos, setTodos] = React.useState<Todo[]>([]);

  useFocusEffect(
    React.useCallback(() => {
      const fetchTodos = async () => {
        const allTodos = await loadTodos();
        setTodos(allTodos);
      };
      fetchTodos();
    }, [])
  );

  const markedDates = {};

  todos.forEach(todo => {
    const date = todo.dueDate ? new Date(todo.dueDate).toISOString().split('T')[0] : null;
    if (date) {
      if (!markedDates[date]) {
        markedDates[date] = { dots: [] };
      }
      markedDates[date].dots.push({
        key: todo.id,
        name: todo.text,
      });
    }
  });

  const renderDay = ({ date, state }) => {
    const dayData = markedDates[date.dateString];

    return (
      <View style={styles.dayContainer}>
        <Text style={[styles.dayText, state === 'today' ? styles.todayText : {}]}>
          {date.day}
        </Text>
        <View style={styles.dotsContainer}>
          {dayData && dayData.dots.map(dot => (
            <View key={dot.key} style={styles.todoContainer}>
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
        dayComponent={renderDay}
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
    color: 'black',
    fontSize: 10,
  },
});

export default CalendarScreen;