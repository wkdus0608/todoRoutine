
import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Todo } from '../types';

type Priority = Todo['priority'];

interface EisenhowerMatrixSheetProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (priority: Priority) => void;
}

const EisenhowerMatrixSheet: React.FC<EisenhowerMatrixSheetProps> = ({
  visible,
  onClose,
  onSelect,
}) => {
  const handleSelect = (priority: Priority) => {
    onSelect(priority);
    onClose();
  };

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>중요도 선택</Text>
          <View style={styles.matrixContainer}>
            <View style={styles.row}>
              <TouchableOpacity
                style={[styles.quadrant, styles.urgentImportant]}
                onPress={() => handleSelect('urgent_important')}
              >
                <Text style={styles.quadrantText}>긴급하고 중요함</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.quadrant, styles.notUrgentImportant]}
                onPress={() => handleSelect('not_urgent_important')}
              >
                <Text style={styles.quadrantText}>긴급하지 않지만 중요함</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.row}>
              <TouchableOpacity
                style={[styles.quadrant, styles.urgentNotImportant]}
                onPress={() => handleSelect('urgent_not_important')}
              >
                <Text style={styles.quadrantText}>긴급하지만 중요하지 않음</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.quadrant, styles.notUrgentNotImportant]}
                onPress={() => handleSelect('not_urgent_not_important')}
              >
                <Text style={styles.quadrantText}>긴급하지도 중요하지도 않음</Text>
              </TouchableOpacity>
            </View>
          </View>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>닫기</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  matrixContainer: {
    width: 300,
    height: 300,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
  },
  quadrant: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
  },
  quadrantText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  urgentImportant: {
    backgroundColor: '#d32f2f', // Red
  },
  notUrgentImportant: {
    backgroundColor: '#388e3c', // Green
  },
  urgentNotImportant: {
    backgroundColor: '#fbc02d', // Yellow
  },
  notUrgentNotImportant: {
    backgroundColor: '#757575', // Grey
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: '#2196F3',
    borderRadius: 10,
    padding: 10,
    elevation: 2,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default EisenhowerMatrixSheet;
