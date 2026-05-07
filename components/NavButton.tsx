import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";


type Props = {
    label: string;
    route: string;
};

export default function NavButton({ label, route }: Props) {
    const router = useRouter();
    return (
        <TouchableOpacity style={styles.button} onPress={() => router.push(route)}>
            <Text style={styles.buttonText}>{label}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create ({
    button: {
        backgroundColor: "#6200ee",
        paddingVertical: 14,
        paddingHorizontal: 40,
        borderRadius: 12,
        width: "80%",
        alignItems: "center",
        marginTop: 8,
    },
    buttonText: { 
        color: "#fff", 
        fontSize: 16, 
        fontWeight: "bold" 
    },
})