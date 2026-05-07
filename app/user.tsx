import { useState , useEffect } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from "react-native";

type User = {
    id: number;
    name: string;
    email: string;
    phone: string;
    website: string;
    company: {
        name: string;
    }
};
export default function UserList() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await fetch("https://jsonplaceholder.typicode.com/users");
            
            if (!res.ok) throw new Error("ดึงข้อมูลไม่สำเร็จ");

            const data = await res.json();
            setUsers(data);
        } catch (err) {
            setError("เกิดข้อผิดพลาด โปรดลองใหม่อีกครั้ง")  
        } finally {
            setLoading(false);
        }
    };
    if (loading) return <ActivityIndicator size="small"/>;
    if (error) return <Text style={styles.error}>{error}</Text>;

    return (
        <View style={styles.container}>
            <Text style={styles.title}>👤 User Menu</Text>
            <FlatList
                data={users}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                <View style={styles.card}>
                    <Text style={styles.name}>👤 {item.name}</Text>
                    <Text style={styles.detail}>📧 {item.email}</Text>
                    <Text style={styles.detail}>📞 {item.phone}</Text>
                    <Text style={styles.detail}>🌐 {item.website}</Text>
                    <Text style={styles.detail}>🏢 {item.company.name}</Text>
                </View>
                )}
            ListEmptyComponent={
                <Text style={styles.empty}>ไม่มีข้อมูล</Text>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f5f5f5" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 16, color: "#e4002b" },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    elevation: 3,
  },
  name: { fontSize: 18, fontWeight: "bold" },
  detail: { fontSize: 14, color: "#666", marginTop: 4 },
  error: { color: "red", textAlign: "center", marginTop: 40 },
  empty: { textAlign: "center", color: "#aaa", marginTop: 40 },
});
