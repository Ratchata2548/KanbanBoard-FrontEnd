import {
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { Todo } from "../types/todo";

type Props = {
    todos: Todo[];
    onToggle: (id: number) => void;
    onEdit: (id: Todo) => void;
    onDelete: (id: number) => void;
};

export default function FlatListTodo ({ todos, onToggle, onEdit, onDelete}: Props) {
    return (
        <FlatList
            data={todos}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
                <View style={styles.todoItem}>
                {/* Mark Done */}
                <TouchableOpacity onPress={() => onToggle(item.id)}>
                    <Text style={styles.check}>{item.done ? "✅" : "⬜"}</Text>
                </TouchableOpacity>

                {/* ข้อความ */}
                <Text style={[styles.todoText, item.done && styles.doneText]}>
                    {item.text}
                </Text>

                {/* ปุ่มแก้ไข */}
                <TouchableOpacity onPress={() => onEdit(item)}>
                    <Text style={styles.editBtn}>✏️</Text>
                </TouchableOpacity>

                {/* ปุ่มลบ */}
                <TouchableOpacity onPress={() => onDelete(item.id)}>
                    <Text style={styles.deleteBtn}>🗑️</Text>
                </TouchableOpacity>
                </View>
            )}
            ListEmptyComponent={
                <Text style={styles.empty}>ยังไม่มีรายการ กด + เพื่อเพิ่ม</Text>
            }
        />
    );
}

const styles = StyleSheet.create ({
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
});