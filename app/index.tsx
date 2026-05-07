import { useState , useEffect } from "react";
import {View, Text, Image, StyleSheet, ActivityIndicator} from "react-native";
import { useRouter } from "expo-router";
import NavButton from "../components/NavButton";

type Weather = {
    temp: number;
    description: string;
    icon: string;
    humidity: number;
    wind: number;
};

const API_KEY = "3d3680def5a8772b01fe477999b2db92";
const CITY = "New York";
const URL = `https://api.openweathermap.org/data/2.5/weather?q=${CITY}&appid=${API_KEY}&units=metric`;

export default function Home() {
  const [weather, setWeather] = useState<Weather | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchWeather();
  }, []);

  // async/await + error handling
  const fetchWeather = async () => {
    try {
      setLoading(true);
      const res = await fetch(URL);

      // error handling → เช็คว่า response ปกติไหม
      if (!res.ok) throw new Error("ดึงข้อมูลไม่สำเร็จ");

      const json = await res.json();

      // map JSON → Weather type
      setWeather({
        temp: Math.round(json.main.temp),
        description: json.weather[0].description,
        icon: json.weather[0].icon,
        humidity: json.main.humidity,
        wind: json.wind.speed,
      });
    } catch (err) {
      // error handling → เก็บ error message
      setError("เกิดข้อผิดพลาด ลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
        {loading && (<ActivityIndicator size = "large" />)}
        
        {error && <Text style={styles.error}>{error}</Text>}
        
        {weather && !loading && (
            <View style={styles.card}>
                <NavButton label="🔢 Counter" route="/counter" />
                <NavButton label="📝 Todo" route="/todo" />
                <NavButton label="👤 User" route="/user" />

                <Text style={styles.city}>📍 {CITY} </Text>
                <Image
                    source={{ uri: `https://openweathermap.org/img/wn/${weather.icon}@2x.png` }}
                    style={styles.icon}
                />
                <Text style={styles.temp}>{weather.temp}°C</Text>
                <Text style={styles.description}>{weather.description}</Text>
                <View style={styles.row}>
                    <Text style={styles.detail}>💧 {weather.humidity}%</Text>
                    <Text style={styles.detail}>💨 {weather.wind} m/s</Text>
                </View>
            </View>
        )}
    </View>
  );
}

const styles = StyleSheet.create ({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#87ceeb",
    },
    card: {
        backgroundColor: "#fff",
        borderRadius: 20,
        padding: 24,
        alignItems: "center",
        width: "80%",
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 4,
    },
    city: { fontSize: 24, fontWeight: "bold", marginBottom: 8},
    icon: { width: 80, height: 80},
    temp: { fontSize: 48, fontWeight: "bold" },
    description: {fontSize: 18, fontStyle: "italic", marginBottom: 16},
    row: { flexDirection: "row", gap: 24, marginTop: 8 },
    detail: { fontSize: 16, marginHorizontal: 8 },
    error: {color: "red", fontSize: 18},
});