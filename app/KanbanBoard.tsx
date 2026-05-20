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
  ScrollView,
  useWindowDimensions
} from "react-native";
import { KanbanBoardTask, User, Status } from "../types/KanbanBoard"; 
// 💡 นำ useLocalSearchParams และ useRouter เข้ามาใช้จัดการเรื่องย้ายหน้าและรับค่า
import { useLocalSearchParams, useRouter } from "expo-router"; 

const API_BASE_URL = "http://localhost:5221/api/tasks";

export default function KanbanBoard() {
  const router = useRouter();
  // 🚀 ดึงชื่อผู้ใช้ที่ส่งมาจากหน้า Login
  const { currentUserName } = useLocalSearchParams<{ currentUserName: string }>();

  const [tasks, setTasks] = useState<KanbanBoardTask[]>([]);
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [loading, setLoading] = useState(true);
  
  // 💡 State สำหรับควบคุมการเปิด/ปิด เมนูโปรไฟล์และ Logout
  const [profileModalVisible, setProfileModalVisible] = useState(false);

  // States สำหรับ Form เพิ่ม Task
  const [title, setTitle] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedStatusId, setSelectedStatusId] = useState<number>(1); 
  
  // States สำหรับ Modal แก้ไข
  const [editTarget, setEditTarget] = useState<KanbanBoardTask | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editUserId, setEditUserId] = useState<number | null>(null);
  const [editStatusId, setEditStatusId] = useState<number>(1);
  
  const { width } = useWindowDimensions();
  const isLargeScreen = width > 800;
  const dynamicColumnWidth = isLargeScreen ? (width / 3) - 30 : 280;

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

  const updateTaskStatus = async (task: KanbanBoardTask, newStatusId: number) => {
    setOpenDropdownId(null); 

    if (task.statusId === newStatusId) return; 

    const updatedPayload = {
      id: task.id,
      title: task.title,
      userId: task.userId,
      statusId: newStatusId 
    };

    try {
      const res = await fetch(`${API_BASE_URL}/${task.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedPayload)
      });

      if (res.ok) {
        await fetchInitialData(); 
      } else {
        Alert.alert("ข้อผิดพลาด", "ไม่สามารถเปลี่ยนสถานะได้");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("ข้อผิดพลาด", "เชื่อมต่อเซิร์ฟเวอร์ไม่ได้");
    }
  };

  // ── 🚪 ฟังก์ชันออกจากระบบ ──
  const handleLogout = () => {
    setProfileModalVisible(false);
    // ดีดผู้ใช้กลับไปหน้า Login และล้างประวัติการย้อนกลับ
    router.replace("/Login"); 
  };

  return (
    <View style={styles.container}>
      
      {/* 💡 ส่วนหัวด้านบน (Header Row ที่มีชื่อแอป และ ปุ่มโปรไฟล์มุมขวาบน) */}
      <View style={styles.headerRowContainer}>
        <Text style={styles.title}>📋 Kanban Board</Text>
        
        {/* ปุ่มโปรไฟล์วงกลม */}
        <TouchableOpacity 
          style={styles.profileAvatarButton} 
          onPress={() => setProfileModalVisible(true)}
        >
          {/* ดึงอักษรตัวแรกของชื่อผู้ใช้มาทำเป็นโลโก้ เช่น Jane -> J */}
          <Text style={styles.profileAvatarText}>
            {currentUserName ? currentUserName.charAt(0).toUpperCase() : "U"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ฟอร์มเพิ่มงาน */}
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

      {/* บอร์ด Kanban */}
      {loading ? (
        <ActivityIndicator size="large" color="#6200ee" style={{ marginTop: 20 }} />
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.boardContainer}>
          {statuses.map((status) => {
            const columnTasks = tasks.filter((t) => t.statusId === status.id);
            
            return (
              <View key={status.id} style={[styles.column, { width: dynamicColumnWidth }]}>
                <View style={styles.columnHeader}>
                  <Text style={styles.columnTitle}>
                    {status.name} ({columnTasks.length})
                  </Text>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
                  {columnTasks.map((item) => (
                    <View key={item.id} style={styles.taskCard}>
                      <Text style={styles.todoText}>{item.title}</Text>
                      <Text style={styles.subText}>👤 ผู้รับผิดชอบ: {item.assigneeName || "ยังไม่มีผู้รับผิดชอบ"}</Text>
                      
                      <View style={styles.dropdownContainer}>
                        <TouchableOpacity 
                          style={[styles.statusTag, { backgroundColor: item.statusId === 3 ? "#e8f5e9" : "#fff3e0" }]}
                          onPress={() => setOpenDropdownId(openDropdownId === item.id ? null : item.id)}
                        >
                          <Text style={styles.statusTagText}>
                            📍 สถานะ: {item.statusName || "To Do"} {openDropdownId === item.id ? "🔼" : "🔽"}
                          </Text>
                        </TouchableOpacity>

                        {openDropdownId === item.id && (
                          <View style={styles.dropdownMenu}>
                            {statuses.map(s => (
                              <TouchableOpacity 
                                key={s.id} 
                                style={styles.dropdownItem}
                                onPress={() => updateTaskStatus(item, s.id)}
                              >
                                <Text style={styles.dropdownItemText}>{s.name}</Text>
                              </TouchableOpacity>
                            ))}
                          </View>
                        )}
                      </View>
                      <br/>
                      {item.description && item.description.trim() !== "" && (
                        <Text style={styles.descriptionText}>  {item.description}</Text>
                      )}
                      
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

      {/* 💡 3. Profile & Logout Popover Modal */}
      <Modal visible={profileModalVisible} transparent animationType="none">
        {/* กดพื้นที่ว่างนอกหน้าต่างเพื่อปิดเมนูได้ */}
        <TouchableOpacity 
          style={styles.popoverOverlay} 
          activeOpacity={1} 
          onPress={() => setProfileModalVisible(false)}
        >
          <View style={styles.popoverBox}>
            <Text style={styles.popoverUserLabel}>บัญชีผู้ใช้ปัจจุบัน:</Text>
            <Text style={styles.popoverUserName}>👤 {currentUserName || "ผู้ใช้งานระบบ"}</Text>
            
            <View style={styles.popoverDivider} />
            
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutButtonText}>🚪 ออกจากระบบ</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

    </View>
  );
}

// ── Styles ──
const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f8f9fa" },
  
  // จัดตําแหน่งชื่อแอปและโปรไฟล์ให้อยู่แถวเดียวกัน
  headerRowContainer: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center",
    marginBottom: 16 
  },
  title: { fontSize: 26, fontWeight: "bold", color: "#212529" },
  
  // สไตล์ปุ่มโปรไฟล์วงกลมมุมขวาบน
  profileAvatarButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#6200ee",
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 }
  },
  profileAvatarText: { color: "#fff", fontSize: 18, fontWeight: "bold" },

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

  boardContainer: { flex: 1, flexDirection: "row" },
  column: {
    backgroundColor: "#ebecf0", 
    borderRadius: 10,
    padding: 12,
    marginRight: 16, 
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
    elevation: 2, 
    shadowColor: "#000", 
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
  },
  todoText: { fontSize: 16, fontWeight: "600", color: "#212529", marginBottom: 8 },
  descriptionText: { 
    fontSize: 13,
    color: "#495057",
    backgroundColor: "#f1f3f5",
    padding: 8,
    borderRadius: 6,
    marginBottom: 8,
    lineHeight: 18
  },
  subText: { fontSize: 13, color: "#6c757d", marginBottom: 4 },
  
  dropdownContainer: {
    marginTop: 6,
    marginBottom: 4,
    alignSelf: "flex-start",
  },
  statusTag: { 
    marginTop: 4, 
    alignSelf: "flex-start", 
    paddingVertical: 4, 
    paddingHorizontal: 8, 
    borderRadius: 6,
    overflow: "hidden"
  },
  statusTagText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#495057",
  },
  dropdownMenu: {
    marginTop: 4,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e9ecef",
    overflow: "hidden",
  },
  dropdownItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  dropdownItemText: {
    fontSize: 12,
    color: "#495057",
  },

  actionRow: {
    flexDirection: "row",
    justifyContent: "flex-end", 
    marginTop: 8,
    gap: 12,
  },
  editBtn: { fontSize: 18 },
  deleteBtn: { fontSize: 18 },
  empty: { textAlign: "center", color: "#8a94a5", marginTop: 20, fontSize: 14 },
  
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  modalBox: { backgroundColor: "#fff", borderRadius: 16, padding: 24, width: "85%", gap: 14 },
  modalTitle: { fontSize: 20, fontWeight: "bold" },
  modalButtons: { flexDirection: "row", justifyContent: "flex-end", gap: 10, marginTop: 10 },
  cancelButton: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, borderWidth: 1, borderColor: "#dee2e6" },
  cancelText: { color: "#495057" },
  saveButton: { backgroundColor: "#6200ee", paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8 },
  saveText: { color: "#fff", fontWeight: "bold" },

  // 💡 สไตล์สําหรับเมนู Popover ขวาบน
  popoverOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.1)" },
  popoverBox: {
    position: "absolute",
    top: 70, // ตําแหน่งใต้ปุ่มโปรไฟล์พอดี
    right: 20,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    width: 200,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 }
  },
  popoverUserLabel: { fontSize: 12, color: "#6c757d", marginBottom: 2 },
  popoverUserName: { fontSize: 15, fontWeight: "bold", color: "#212529" },
  popoverDivider: { height: 1, backgroundColor: "#dee2e6", marginVertical: 12 },
  logoutButton: { flexDirection: "row", alignItems: "center", paddingVertical: 4 },
  logoutButtonText: { color: "#d32f2f", fontSize: 15, fontWeight: "600" }
});