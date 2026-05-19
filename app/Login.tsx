import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useRouter } from "expo-router";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("แจ้งเตือน", "กรุณากรอกอีเมลและรหัสผ่านให้ครบถ้วน");
      return;
    }

    try {
      const res = await fetch("http://localhost:5221/api/Auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      if (res.ok) {
        router.replace("/KanbanBoard"); 
      } else {
        const errorData = await res.json();
        Alert.alert("เข้าสู่ระบบไม่สำเร็จ", errorData.message || "อีเมลหรือรหัสผ่านไม่ถูกต้อง");
      }

    } catch (error) {
      console.error("Login Error:", error);
      Alert.alert("ข้อผิดพลาด", "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
    }
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>ยินดีต้อนรับ 👋</Text>
        <Text style={styles.subtitle}>เข้าสู่ระบบ Kanban Board</Text>

        <TextInput
          style={styles.input}
          placeholder="อีเมล"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
        
        <TextInput
          style={styles.input}
          placeholder="รหัสผ่าน"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity style={styles.primaryButton} onPress={handleLogin}>
          <Text style={styles.primaryButtonText}>เข้าสู่ระบบ</Text>
        </TouchableOpacity>

        <View style={styles.footerRow}>
          <Text style={styles.footerText}>ยังไม่มีบัญชีใช่ไหม? </Text>
          <TouchableOpacity onPress={() => router.push("/Register")}>
            <Text style={styles.linkText}>สมัครสมาชิก</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20, backgroundColor: "#f8f9fa" },
  card: { backgroundColor: "#fff", padding: 24, borderRadius: 16, elevation: 4, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 10 },
  title: { fontSize: 28, fontWeight: "bold", color: "#212529", marginBottom: 8, textAlign: "center" },
  subtitle: { fontSize: 16, color: "#6c757d", marginBottom: 24, textAlign: "center" },
  input: { backgroundColor: "#f1f3f5", borderRadius: 8, padding: 14, fontSize: 16, borderWidth: 1, borderColor: "#dee2e6", marginBottom: 16 },
  primaryButton: { backgroundColor: "#6200ee", padding: 14, borderRadius: 8, alignItems: "center", marginTop: 8 },
  primaryButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  footerRow: { flexDirection: "row", justifyContent: "center", marginTop: 20 },
  footerText: { color: "#6c757d", fontSize: 14 },
  linkText: { color: "#6200ee", fontSize: 14, fontWeight: "bold" },
});