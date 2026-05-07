import {Modal, View, Text, TextInput, TouchableOpacity, StyleSheet} from "react-native";

type Props = {
    visible: boolean;
    editText: string;
    onChangeText: (text: string) => void;
    onSave: () => void;
    onCancel: () => void;
}


{/* Modal แก้ไข */}
export default function ModalTodo({ visible, editText, onChangeText, onSave, onCancel }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalBox}>
          <Text style={styles.modalTitle}>แก้ไขรายการ</Text>
          <TextInput
            style={styles.input}
            value={editText}
            onChangeText={onChangeText}
          />
          <View style={styles.modalButtons}>
            <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
              <Text style={styles.cancelText}>ยกเลิก</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={onSave}>
              <Text style={styles.saveText}>บันทึก</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create ({
    modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    },
    modalBox: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 24,
        width: "80%",
        gap: 16,
    },
    modalTitle: { fontSize: 18, fontWeight: "bold" },
    input: {
        flex: 1,
        backgroundColor: "#fff",
        borderRadius: 10,
        padding: 12,
        fontSize: 16,
        borderWidth: 1,
        borderColor: "#ddd",
    },
    modalButtons: { flexDirection: "row", justifyContent: "flex-end", gap: 8 },
    cancelButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#ddd",
    },
    cancelText: { color: "#555" },
    saveButton: {
        backgroundColor: "#6200ee",
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
    },
    saveText: { color: "#fff", fontWeight: "bold" },
});