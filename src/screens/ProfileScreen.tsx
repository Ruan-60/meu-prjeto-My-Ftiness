import React from "react";
import { View, Text, StyleSheet, SafeAreaView } from "react-native";

const ProfileScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Meu Perfil</Text>
      <Text style={styles.subtitle}>Em breve: personalização, metas e progresso 🎯</Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 24, fontWeight: "bold" },
  subtitle: { fontSize: 16, marginTop: 8, color: "#555" },
});

export default ProfileScreen;
