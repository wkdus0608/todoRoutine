import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Routine as Project, DateRange, RepeatSettings } from '../types';
import DatePickerSheet from './DatePickerSheet';

interface AddTodoFormProps {
  onTodoAdded: (
    text: string,
    dateInfo: {
      dueDate?: string;
      dateRange?: DateRange;
      repeatSettings?: RepeatSettings;
    },
    projectId?: string,
  ) => void;
  onCancel: () => void;
  projects: Project[];
  currentProjectId: string | null;
}

const AddTodoForm: React.FC<AddTodoFormProps> = ({
  onTodoAdded,
  onCancel,
  projects,
  currentProjectId,
}) => {
  const [text, setText] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    currentProjectId,
  );
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [showProjectPicker, setShowProjectPicker] = useState(false);

  const [dateInfo, setDateInfo] = useState<{
    dueDate?: string;
    dateRange?: DateRange;
    repeatSettings?: RepeatSettings;
  }>({});

  useEffect(() => {
    setSelectedProjectId(currentProjectId);
  }, [currentProjectId]);

  const handleAddPress = () => {
    if (text.trim() === '') return;
    onTodoAdded(text.trim(), dateInfo, selectedProjectId || undefined);
  };

  const handleConfirmDate = (newDateInfo: any) => {
    setDateInfo(newDateInfo);
    setDatePickerVisibility(false);
  };

  const getFormattedDate = () => {
    if (dateInfo.dueDate) {
      return new Date(dateInfo.dueDate).toLocaleDateString('ko-KR');
    }
    if (dateInfo.dateRange?.start && dateInfo.dateRange?.end) {
      const start = new Date(dateInfo.dateRange.start).toLocaleDateString('ko-KR');
      const end = new Date(dateInfo.dateRange.end).toLocaleDateString('ko-KR');
      return `${start} - ${end}`;
    }
    if (dateInfo.repeatSettings) {
        const { frequency, weekdays } = dateInfo.repeatSettings;
        let repeatText = '';
        if (frequency === 'weekly') {
            const selectedDays = Object.entries(weekdays || {})
                .filter(([, value]) => value)
                .map(([key]) => key.substring(0, 1).toUpperCase())
                .join(', ');
            repeatText = `매주 ${selectedDays}`;
        } else if (frequency === 'monthly') {
            repeatText = '매월';
        } else if (frequency === 'yearly') {
            repeatText = '매년';
        }
        return repeatText;
    }
    return 'No Date';
  };

  const currentProjectName =
    projects.find(p => p.id === selectedProjectId)?.name || '프로젝트 선택';

  return (
    <>
      <View style={styles.container}>
        <Text style={styles.title}>새로운 할 일 추가</Text>
        <TextInput
          style={styles.input}
          placeholder="할 일을 입력하세요..."
          value={text}
          onChangeText={setText}
          autoFocus
        />
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => setDatePickerVisibility(true)}
          >
            <Icon name="calendar-today" size={16} color="#555" />
            <Text style={styles.buttonText}>{getFormattedDate()}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() => setShowProjectPicker(!showProjectPicker)}
          >
            <Icon name="folder-open" size={16} color="#555" />
            <Text style={styles.buttonText}>{currentProjectName}</Text>
            <Icon name="arrow-drop-down" size={16} color="#555" />
          </TouchableOpacity>
        </View>

        {showProjectPicker && (
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedProjectId}
              onValueChange={itemValue => setSelectedProjectId(itemValue)}
            >
              {projects.map(project => (
                <Picker.Item
                  key={project.id}
                  label={project.name}
                  value={project.id}
                />
              ))}
            </Picker>
          </View>
        )}

        <View style={styles.footer}>
          <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
            <Text style={styles.cancelButtonText}>취소</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.addButton} onPress={handleAddPress}>
            <Text style={styles.addButtonText}>추가</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isDatePickerVisible}
        onRequestClose={() => setDatePickerVisibility(false)}
      >
        <View style={{flex: 1, justifyContent: 'flex-end'}}>
            <TouchableOpacity style={styles.sheetBackdrop} onPress={() => setDatePickerVisibility(false)} />
            <DatePickerSheet
              onClose={() => setDatePickerVisibility(false)}
              onConfirm={handleConfirmDate}
            />
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
    container: {
      backgroundColor: 'white',
      padding: 20,
      borderRadius: 16,
      width: '100%',
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 20,
      textAlign: 'center',
    },
    input: {
      backgroundColor: '#f0f0f0',
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      marginBottom: 16,
    },
    buttonsContainer: {
      flexDirection: 'row',
      marginBottom: 16,
    },
    button: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#f0f0f0',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
      marginRight: 10,
    },
    buttonText: {
      marginLeft: 8,
      fontSize: 14,
      color: '#333',
    },
    pickerContainer: {
      backgroundColor: '#f0f0f0',
      borderRadius: 8,
      marginBottom: 16,
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      marginTop: 20,
    },
    cancelButton: {
      backgroundColor: '#e0e0e0',
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 8,
      marginRight: 10,
    },
    cancelButtonText: {
      color: '#333',
      fontWeight: 'bold',
      fontSize: 16,
    },
    addButton: {
      backgroundColor: '#4F8EF7',
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 8,
    },
    addButtonText: {
      color: 'white',
      fontWeight: 'bold',
      fontSize: 16,
    },
    sheetBackdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.4)',
    }
  });
  
  export default AddTodoForm;
