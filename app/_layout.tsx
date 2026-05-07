import { Stack } from "expo-router";

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Home" }} />
      <Stack.Screen name="counter" options={{ title: "Counter" }} />
      <Stack.Screen name="todo" options={{ title: "Todo" }} />
      <Stack.Screen name="user" options={{ title: "User" }} />
    </Stack>
  );
}