import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Calendar } from 'react-native-calendars';

const CalendarScreen = ({ projects }) => {
  const markedDates = {};

  projects.forEach(project => {
    project.todos.forEach(todo => {
      if (todo.dueDate) {
        markedDates[todo.dueDate] = { marked: true };
      }
    });
  });

  return (
    <View style={styles.container}>
      <Calendar
        markedDates={markedDates}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingTop: 50,
  },
});

export default CalendarScreen;
