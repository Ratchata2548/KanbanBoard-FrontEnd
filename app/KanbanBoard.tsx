import { useState, useEffect } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  ActivityIndicator,
  ScrollView
} from "react-native";
import { KanbanBoardTask, User, Status } from "../types/KanbanBoard"; 

const API_BASE_URL = "http://localhost:5221/api/tasks";

export default function KanbanBoard() {
  const [tasks, setTasks] = useState<KanbanBoardTask[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [loading, setLoading] = useState(true);

  // States สำหรับ Form เพิ่ม Task
  const [title, setTitle] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedStatusId, setSelectedStatusId] = useState<number>(1); // ค่าเริ่มต้น 1: To Do
  
  // States สำหรับ Modal แก้ไข
  const [editTarget, setEditTarget] = useState<KanbanBoardTask | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editUserId, setEditUserId] = useState<number | null>(null);
  const [editStatusId, setEditStatusId] = useState<number>(1);

  
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [resTasks, resUsers, resStatuses] = await Promise.all([
        fetch(`${API_BASE_URL}`),
        fetch(`${API_BASE_URL}/users`),
        fetch(`${API_BASE_URL}/statuses`)
      ]);

      if (resTasks.ok) setTasks(await resTasks.json());
      if (resUsers.ok) setUsers(await resUsers.json());
      if (resStatuses.ok) setStatuses(await resStatuses.json());
      
    } catch (error) {
      console.error("Error loading data:", error);
      Alert.alert("ข้อผิดพลาด", "ไม่สามารถดึงข้อมูลจากเซิร์ฟเวอร์ได้");
    } finally {
      setLoading(false);
    }
  };

  const addTask = async () => {
    if (title.trim() === "") return;

    const payload = {
      title: title.trim(),
      userId: selectedUserId,
      statusId: selectedStatusId
    };

    try {
      const res = await fetch(`${API_BASE_URL}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        await fetchInitialData(); 
        setTitle("");
        setSelectedUserId(null);
        setSelectedStatusId(1);
      } else {
        Alert.alert("ข้อผิดพลาด", "ไม่สามารถบันทึกงานได้");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const deleteTask = async (id: number) => {
    try {
      const res = await fetch(`${API_BASE_URL}/${id}`, { 
        method: "DELETE" 
      });

      if (res.ok) {
        setTasks(tasks.filter((task) => task.id !== id));
      } else {
        Alert.alert("ข้อผิดพลาด", "ไม่สามารถลบงานได้");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const openEdit = (task: KanbanBoardTask) => {
    setEditTarget(task);
    setEditTitle(task.title);
    setEditUserId(task.userId);
    setEditStatusId(task.statusId);
  };

  // ── 💾 บันทึกการอัปเดต (PUT ไปที่ api/tasks/{id}) ──
  const saveEdit = async () => {
    if (!editTarget || editTitle.trim() === "") return;

    const updatedPayload = {
      id: editTarget.id,
      title: editTitle.trim(),
      userId: editUserId,
      statusId: editStatusId
    };

    try {
      const res = await fetch(`${API_BASE_URL}/${editTarget.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedPayload)
      });

      if (res.ok) {
        await fetchInitialData(); 
        setEditTarget(null);
      } else {
        Alert.alert("ข้อผิดพลาด", "ไม่สามารถอัปเดตงานได้");
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📋 Kanban Board</Text>

      <View style={styles.inputCard}>
        <TextInput
          style={styles.input}
          placeholder="ระบุหัวข้องาน..."
          value={title}
          onChangeText={setTitle}
        />
        
        <View style={styles.selectionRow}>
          <Text style={styles.label}>มอบหมายให้: </Text>
          {users.map(u => (
            <TouchableOpacity 
              key={u.id} 
              style={[styles.miniButton, selectedUserId === u.id && styles.activeButton]}
              onPress={() => setSelectedUserId(selectedUserId === u.id ? null : u.id)}
            >
              <Text style={selectedUserId === u.id ? styles.activeText : styles.inactiveText}>{u.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.addButtonSubmit} onPress={addTask}>
          <Text style={styles.addButtonText}>➕ เพิ่มงานลงบอร์ด</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#6200ee" style={{ marginTop: 20 }} />
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.boardContainer}>
          {statuses.map((status) => {
            const columnTasks = tasks.filter((t) => t.statusId === status.id);
            
            return (
              <View key={status.id} style={styles.column}>
                {/* หัวคอลัมน์ (ชื่อสถานะ + จำนวนงาน) */}
                <View style={styles.columnHeader}>
                  <Text style={styles.columnTitle}>
                    {status.name} ({columnTasks.length})
                  </Text>
                </View>

                {/* รายการงานในคอลัมน์ */}
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
                  {columnTasks.map((item) => (
                    <View key={item.id} style={styles.taskCard}>
                      <Text style={styles.todoText}>{item.title}</Text>
                      <Text style={styles.subText}>👤 ผู้รับผิดชอบ: {item.assigneeName || "ยังไม่มีผู้รับผิดชอบ"}</Text>
                      <Text style={[styles.statusTag, { backgroundColor: item.statusId === 3 ? "#e8f5e9" : "#fff3e0" }]}>
                        📍 สถานะ: {item.statusName || "To Do"}
                      </Text>
                      
                      {/* ปุ่ม Action มุมขวาล่าง */}
                      <View style={styles.actionRow}>
                        <TouchableOpacity onPress={() => openEdit(item)}>
                          <Text style={styles.editBtn}>✏️</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => deleteTask(item.id)}>
                          <Text style={styles.deleteBtn}>🗑️</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                  
                  {columnTasks.length === 0 && (
                    <Text style={styles.empty}>ไม่มีงานในสถานะนี้</Text>
                  )}
                </ScrollView>
              </View>
            );
          })}
        </ScrollView>
      )}

      {/* Edit Modal ฟอร์มแก้ไขรายละเอียดงาน */}
      <Modal visible={editTarget !== null} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>แก้ไขรายละเอียดงาน</Text>
            
            <TextInput
              style={styles.input}
              value={editTitle}
              onChangeText={setEditTitle}
            />

            <Text style={styles.modalLabel}>เปลี่ยนผู้รับผิดชอบ:</Text>
            <View style={styles.selectionRow}>
              {users.map(u => (
                <TouchableOpacity 
                  key={u.id} 
                  style={[styles.miniButton, editUserId === u.id && styles.activeButton]}
                  onPress={() => setEditUserId(editUserId === u.id ? null : u.id)}
                >
                  <Text style={editUserId === u.id ? styles.activeText : styles.inactiveText}>{u.name}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.modalLabel}>อัปเดตสถานะงาน:</Text>
            <View style={styles.selectionRow}>
              {statuses.map(s => (
                <TouchableOpacity 
                  key={s.id} 
                  style={[styles.miniButton, editStatusId === s.id && styles.activeButton]}
                  onPress={() => setEditStatusId(s.id)}
                >
                  <Text style={editStatusId === s.id ? styles.activeText : styles.inactiveText}>{s.name}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setEditTarget(null)}>
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

// ── Styles (อัปเดตสำหรับ Kanban Board) ──
const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f8f9fa" },
  title: { fontSize: 26, fontWeight: "bold", marginBottom: 16, color: "#212529" },
  inputCard: { backgroundColor: "#fff", padding: 16, borderRadius: 12, marginBottom: 16, elevation: 2, gap: 10 },
  input: { backgroundColor: "#f1f3f5", borderRadius: 8, padding: 12, fontSize: 16, borderWidth: 1, borderColor: "#dee2e6" },
  selectionRow: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 6, marginVertical: 4 },
  label: { fontSize: 14, color: "#495057" },
  modalLabel: { fontSize: 14, fontWeight: "bold", marginTop: 8, color: "#495057" },
  miniButton: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, borderWidth: 1, borderColor: "#ced4da", backgroundColor: "#fff" },
  activeButton: { backgroundColor: "#6200ee", borderColor: "#6200ee" },
  activeText: { color: "#fff", fontSize: 12, fontWeight: "bold" },
  inactiveText: { color: "#495057", fontSize: 12 },
  addButtonSubmit: { backgroundColor: "#6200ee", padding: 12, borderRadius: 8, alignItems: "center", marginTop: 4 },
  addButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  
  // 💡 Styles ใหม่สำหรับ Kanban
  boardContainer: { flex: 1, flexDirection: "row" },
  column: {
    width: 280, // กำหนดความกว้างคอลัมน์
    backgroundColor: "#ebecf0", // สีพื้นหลังคอลัมน์สไตล์ Kanban
    borderRadius: 10,
    padding: 12,
    marginRight: 16, // ระยะห่างระหว่างคอลัมน์
  },
  columnHeader: {
    paddingBottom: 10,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderColor: "#dcdfe3",
  },
  columnTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#172b4d",
  },
  taskCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    elevation: 2, // เงาสำหรับ Android
    shadowColor: "#000", // เงาสำหรับ iOS
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
  },
  todoText: { fontSize: 16, fontWeight: "600", color: "#212529", marginBottom: 8 },
  subText: { fontSize: 13, color: "#6c757d", marginBottom: 4 },
  statusTag: { 
    fontSize: 12, 
    fontWeight: "bold", 
    color: "#495057", 
    marginTop: 4, 
    alignSelf: "flex-start", 
    paddingVertical: 4, 
    paddingHorizontal: 8, 
    borderRadius: 6,
    overflow: "hidden"
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "flex-end", // ดันปุ่มไปทางขวา
    marginTop: 8,
    gap: 12,
  },
  editBtn: { fontSize: 18 },
  deleteBtn: { fontSize: 18 },
  empty: { textAlign: "center", color: "#8a94a5", marginTop: 20, fontSize: 14 },
  
  // Modal Styles (เหมือนเดิม)
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  modalBox: { backgroundColor: "#fff", borderRadius: 16, padding: 24, width: "85%", gap: 14 },
  modalTitle: { fontSize: 20, fontWeight: "bold" },
  modalButtons: { flexDirection: "row", justifyContent: "flex-end", gap: 10, marginTop: 10 },
  cancelButton: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, borderWidth: 1, borderColor: "#dee2e6" },
  cancelText: { color: "#495057" },
  saveButton: { backgroundColor: "#6200ee", paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8 },
  saveText: { color: "#fff", fontWeight: "bold" },
});