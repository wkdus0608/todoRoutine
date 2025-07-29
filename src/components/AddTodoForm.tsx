import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
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
  const [isProjectPickerVisible, setProjectPickerVisible] = useState(false);
  const [projectPickerPosition, setProjectPickerPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
  });
  const projectButtonRef = useRef(null);

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
    const mappedDateInfo = {
      dueDate: newDateInfo.date,
      dateRange: newDateInfo.range,
      repeatSettings: newDateInfo.repeat,
    };
    setDateInfo(mappedDateInfo);
    setDatePickerVisibility(false);
  };

  const getFormattedDate = () => {
    if (dateInfo.dueDate)
      return new Date(dateInfo.dueDate).toLocaleDateString('ko-KR');
    if (dateInfo.dateRange?.start)
      return `${new Date(dateInfo.dateRange.start).toLocaleDateString(
        'ko-KR',
      )} - ${new Date(dateInfo.dateRange.end).toLocaleDateString('ko-KR')}`;
    if (dateInfo.repeatSettings) return '반복 설정됨';
    return 'No Date';
  };

  const findProjectName = (
    id: string | null,
    projectList: Project[],
  ): string => {
    for (const project of projectList) {
      if (project.id === id) return project.name;
      if (project.children) {
        const found = findProjectName(id, project.children);
        if (found) return found;
      }
    }
    return '프로젝트 선택';
  };

  const currentProjectName = findProjectName(selectedProjectId, projects);

  const openProjectPicker = () => {
    projectButtonRef.current?.measureInWindow((x, y, width, height) => {
      setProjectPickerPosition({ top: y + height, left: x, width });
      setProjectPickerVisible(true);
    });
  };

  const renderProjectItem = (project: Project, level = 0) => (
    <View key={project.id}>
      <TouchableOpacity
        style={[styles.projectPickerItem, { paddingLeft: 16 + level * 5 }]} // Reduced indentation
        onPress={() => {
          setSelectedProjectId(project.id);
          setProjectPickerVisible(false);
        }}
      >
        <Text style={styles.projectPickerItemText}>{project.name}</Text>
        {selectedProjectId === project.id && (
          <Icon name="check" size={20} color="#3B82F6" />
        )}
      </TouchableOpacity>
      {project.children &&
        project.children.map(child => renderProjectItem(child, level + 1))}
    </View>
  );

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
            ref={projectButtonRef}
            style={styles.button}
            onPress={openProjectPicker}
          >
            <Icon name="folder-open" size={16} color="#555" />
            <Text style={styles.buttonText}>{currentProjectName}</Text>
            <Icon name="arrow-drop-down" size={16} color="#555" />
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
            <Text style={styles.cancelButtonText}>취소</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.addButton} onPress={handleAddPress}>
            <Text style={styles.addButtonText}>추가</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Date Picker Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isDatePickerVisible}
        onRequestClose={() => setDatePickerVisibility(false)}
      >
        <View style={{ flex: 1, justifyContent: 'flex-end' }}>
          <TouchableOpacity
            style={styles.sheetBackdrop}
            onPress={() => setDatePickerVisibility(false)}
          />
          <DatePickerSheet
            onClose={() => setDatePickerVisibility(false)}
            onConfirm={handleConfirmDate}
          />
        </View>
      </Modal>

      {/* Project Picker Dropdown Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isProjectPickerVisible}
        onRequestClose={() => setProjectPickerVisible(false)}
      >
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          onPress={() => setProjectPickerVisible(false)}
        >
          <View
            style={[
              styles.projectPickerDropdown,
              {
                top: projectPickerPosition.top,
                left: projectPickerPosition.left,
                width: projectPickerPosition.width,
              },
            ]}
          >
            <ScrollView>
              {projects.map(project => renderProjectItem(project))}
            </ScrollView>
          </View>
        </TouchableOpacity>
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
  buttonsContainer: { flexDirection: 'row', marginBottom: 16, zIndex: 1 },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 10,
  },
  buttonText: { marginLeft: 8, fontSize: 14, color: '#333' },
  footer: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 20 },
  cancelButton: {
    backgroundColor: '#e0e0e0',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginRight: 10,
  },
  cancelButtonText: { color: '#333', fontWeight: 'bold', fontSize: 16 },
  addButton: {
    backgroundColor: '#4F8EF7',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  addButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  sheetBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  projectPickerDropdown: {
    position: 'absolute',
    backgroundColor: 'white',
    borderRadius: 8,
    borderColor: '#E5E7EB',
    borderWidth: 1,
    maxHeight: 200,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  projectPickerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  projectPickerItemText: {
    fontSize: 16,
  },
});

export default AddTodoForm;
