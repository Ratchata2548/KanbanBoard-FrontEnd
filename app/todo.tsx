import { useState } from "react";
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Todo } from "../types/todo";

export default function TodoScreen() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [text, setText] = useState("");
  const [editTarget, setEditTarget] = useState<Todo | null>(null);
  const [editText, setEditText] = useState("");

  // ── สร้าง ──────────────────────────────────────
  const addTodo = () => {
    if (text.trim() === "") return; // ไม่เพิ่มถ้าว่าง
    const newTodo: Todo = {
      id: Date.now(),
      text: text.trim(),
      done: false,
    };
    setTodos([...todos, newTodo]);
    setText("");
  };

  // ── ลบ ─────────────────────────────────────────
  const deleteTodo = (id: number) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  // ── Mark Done ──────────────────────────────────
  const toggleDone = (id: number) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, done: !todo.done } : todo
      )
    );
  };

  // ── เปิด Modal แก้ไข ───────────────────────────
  const openEdit = (todo: Todo) => {
    setEditTarget(todo);
    setEditText(todo.text);
  };

  // ── บันทึกการแก้ไข ─────────────────────────────
  const saveEdit = () => {
    if (editText.trim() === "") return;
    setTodos(
      todos.map((todo) =>
        todo.id === editTarget?.id ? { ...todo, text: editText.trim() } : todo
      )
    );
    setEditTarget(null);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📝 Todo List</Text>

      {/* Input เพิ่ม Todo */}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="เพิ่มรายการ..."
          value={text}
          onChangeText={setText}
        />
        <TouchableOpacity style={styles.addButton} onPress={addTodo}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      <FlatList
        data={todos}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.todoItem}>
            {/* Mark Done */}
            <TouchableOpacity onPress={() => toggleDone(item.id)}>
              <Text style={styles.check}>{item.done ? "✅" : "⬜"}</Text>
            </TouchableOpacity>

            {/* ข้อความ */}
            <Text style={[styles.todoText, item.done && styles.doneText]}>
              {item.text}
            </Text>

            {/* ปุ่มแก้ไข */}
            <TouchableOpacity onPress={() => openEdit(item)}>
              <Text style={styles.editBtn}>✏️</Text>
            </TouchableOpacity>

            {/* ปุ่มลบ */}
            <TouchableOpacity onPress={() => deleteTodo(item.id)}>
              <Text style={styles.deleteBtn}>🗑️</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>ยังไม่มีรายการ กด + เพื่อเพิ่ม</Text>
        }
      />

      {/* Modal แก้ไข */}
      <Modal visible={editTarget !== null} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>แก้ไขรายการ</Text>
            <TextInput
              style={styles.input}
              value={editText}
              onChangeText={setEditText}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setEditTarget(null)}
              >
                <Text style={styles.cancelText}>ยกเลิก</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={saveEdit}>
                <Text style={styles.saveText}>บันทึก</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: "#f5f5f5" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 16 },
  inputRow: { flexDirection: "row", gap: 8, marginBottom: 16 },
  input: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  addButton: {
    backgroundColor: "#6200ee",
    width: 48,
    height: 48,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  addButtonText: { color: "#fff", fontSize: 28, fontWeight: "bold" },
  todoItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    gap: 8,
  },
  check: { fontSize: 20 },
  todoText: { flex: 1, fontSize: 16 },
  doneText: { textDecorationLine: "line-through", color: "#aaa" },
  editBtn: { fontSize: 18 },
  deleteBtn: { fontSize: 18 },
  empty: { textAlign: "center", color: "#aaa", marginTop: 40, fontSize: 16 },
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