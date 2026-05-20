import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from "react-native";
import { useRouter } from "expo-router";


export default function RegisterScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleRegister = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!name || !email || !password) {
      setErrorMessage("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    try {
      const res = await fetch("http://localhost:5221/api/Auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }) 
      });

      if (res.ok) {
        setErrorMessage(null);
        setSuccessMessage("สมัครสมาชิกเรียบร้อยแล้ว");
        router.replace("/Login");
        // Optionally clear the form fields here
      } else {
        const errorData = await res.json();
        setErrorMessage(errorData.message || "เกิดข้อผิดพลาดในการสมัครสมาชิก");
      }

    } catch (error) {
      console.error("Register Error:", error);
      setErrorMessage("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.card}>
        <Text style={styles.title}>สร้างบัญชีใหม่ 📝</Text>
        <Text style={styles.subtitle}>เพื่อเริ่มต้นจัดการงานของคุณ</Text>

        <TextInput
          style={styles.input}
          placeholder="ชื่อ - นามสกุล"
          value={name}
          onChangeText={setName}
        />

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

        <TouchableOpacity style={styles.primaryButton} onPress={handleRegister}>
          <Text style={styles.primaryButtonText}>สมัครสมาชิก</Text>
        </TouchableOpacity>
        <br/>
        {errorMessage && 
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        }
        {successMessage && (
          <View style={styles.successBox}>
            <Text style={styles.successText}>{successMessage}</Text>
          </View>
        )}

        <View style={styles.footerRow}>
          <Text style={styles.footerText}>มีบัญชีอยู่แล้ว? </Text>
              <TouchableOpacity onPress={() => router.push("/Login")}>  
            <Text style={styles.linkText}>เข้าสู่ระบบ</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa"},
  scrollContainer: {flexGrow: 1,justifyContent: "center",padding: 20},
  card: { backgroundColor: "#fff", padding: 24, borderRadius: 16, elevation: 4, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 10 },
  title: { fontSize: 28, fontWeight: "bold", color: "#212529", marginBottom: 8, textAlign: "center" },
  subtitle: { fontSize: 16, color: "#6c757d", marginBottom: 24, textAlign: "center" },
  input: { backgroundColor: "#f1f3f5", borderRadius: 8, padding: 14, fontSize: 16, borderWidth: 1, borderColor: "#dee2e6", marginBottom: 16 },
  primaryButton: { backgroundColor: "#6200ee", padding: 14, borderRadius: 8, alignItems: "center", marginTop: 8 },
  primaryButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  footerRow: { flexDirection: "row", justifyContent: "center", marginTop: 20 },
  footerText: { color: "#6c757d", fontSize: 14 },
  linkText: { color: "#6200ee", fontSize: 14, fontWeight: "bold" },
  errorBox: { backgroundColor: "#ffebee", borderColor: "#ffcdd2", borderWidth: 1, borderRadius: 8, padding: 12, marginBottom: 16 },
  errorText: {color: "#d32f2f", fontSize: 14, textAlign: "left" },
  successBox: { backgroundColor: "#e8f5e9", borderColor: "#c8e6c9", borderWidth: 1, borderRadius: 8, padding: 12, marginBottom: 16 },
  successText: { color: "#388e3c", fontSize: 14, textAlign: "left" },
});