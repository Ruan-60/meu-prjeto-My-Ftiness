import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native"; // <-- importante

type HistoryEntry = {
  date: string;
  day: string;
  exercise: string;
  setsDetail: string;
  weight: number;
  suggestion: string;
};

const HistoryScreen: React.FC = () => {
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  // Atualiza o histórico sempre que a tela fica visível
  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [])
  );

  const loadHistory = async () => {
    try {
      const data = await AsyncStorage.getItem("workoutHistory");
      if (data) setHistory(JSON.parse(data));
    } catch (error) {
      console.error("Erro ao carregar histórico:", error);
    }
  };

  const clearHistory = async () => {
    Alert.alert("Apagar histórico?", "Essa ação não pode ser desfeita.", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Apagar",
        onPress: async () => {
          await AsyncStorage.removeItem("workoutHistory");
          setHistory([]);
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Histórico de Treinos</Text>
      <ScrollView>
        {history.length === 0 ? (
          <Text style={styles.empty}>Nenhum treino registrado.</Text>
        ) : (
          history.map((h, i) => (
            <View key={i} style={styles.card}>
              <Text style={styles.exercise}>{h.exercise}</Text>
              <Text>Dia: {h.day}</Text>
              <Text>Peso: {h.weight} kg</Text>
              <Text>Séries: {h.setsDetail}</Text>
              <Text>Relatório: {h.suggestion}</Text>
              <Text style={styles.date}>{h.date}</Text>
            </View>
          ))
        )}
      </ScrollView>

      {history.length > 0 && (
        <TouchableOpacity style={styles.clearBtn} onPress={clearHistory}>
          <Text style={styles.clearText}>Apagar Histórico</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f5f5f5" },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 12 },
  empty: { textAlign: "center", color: "#666", marginTop: 50 },
  card: {
    backgroundColor: "white",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  exercise: { fontWeight: "bold", fontSize: 16 },
  date: { color: "#666", fontSize: 12, marginTop: 4 },
  clearBtn: {
    backgroundColor: "#ff3b30",
    padding: 14,
    borderRadius: 8,
    marginTop: 12,
  },
  clearText: { color: "white", textAlign: "center", fontWeight: "600" },
});

export default HistoryScreen;
