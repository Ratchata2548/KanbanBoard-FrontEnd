import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function Counter() {
  const [count, setCount] = useState(0);

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <TouchableOpacity style={styles.button} onPress={() => setCount(count > 0 ? count - 1 : 0)}> 
          <Text style={styles.buttonText}>-</Text>
        </TouchableOpacity>

        <Text style={styles.count}>{count}</Text>

        <TouchableOpacity style={styles.button} onPress={() => setCount(count + 1)}>
          <Text style={styles.buttonText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  row: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 35,
    backgroundColor: "#fff8dc",
    paddingVertical: 100,
    paddingHorizontal: 50,
    borderRadius: 20,
  },
  button: {
    backgroundColor: "#c71585",
    padding: 20,
    borderRadius: 15,
  },
  buttonText: {
    color: "white",
    fontSize: 15,
    fontWeight: "bold",
  },
  count: {
    fontSize: 50,
    fontWeight: "bold",
  },
});