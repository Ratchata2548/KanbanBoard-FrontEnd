import { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Todo } from "../types/todo";
import ModalTodo from "../components/modalTodo";
import FlatListTodo from "../components/FlatListTodo";

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
      <FlatListTodo
      todos={todos}
      onToggle={toggleDone}
      onEdit={openEdit}
      onDelete={deleteTodo}
      />
      <ModalTodo
      visible={editTarget !== null}
      editText={editText}
      onChangeText={setEditText}
      onSave={saveEdit}
      onCancel={() => setEditTarget(null)}
      />
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
});