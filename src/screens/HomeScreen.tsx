// src/screens/HomeScreen.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { saveWorkoutHistory } from "../database/database"; 

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();

 
  const [days, setDays] = useState<string[]>([]);
  const [selectedDay, setSelectedDay] = useState<string>("");
  const [newDay, setNewDay] = useState<string>("");

  // Exercícios livres
  const [exercises, setExercises] = useState<{ name: string; reps: number[]; weight: string }[]>([]);
  const [newExercise, setNewExercise] = useState<string>("");

  const [report, setReport] = useState<string>("");
  const [suggestion, setSuggestion] = useState<string>("");

  // Adicionar novo dia
  const handleAddDay = () => {
    const day = newDay.trim();
    if (day && !days.includes(day)) {
      setDays([...days, day]);
      setSelectedDay(day);
      setNewDay("");
      setExercises([]); 
    } else if (days.includes(day)) {
      Alert.alert("Atenção", "Esse dia já foi adicionado.");
    }
  };

  const handleRemoveDay = (day: string) => {
    const newDays = days.filter(d => d !== day);
    setDays(newDays);
    if (selectedDay === day) {
      setSelectedDay(newDays[0] || "");
      setExercises([]);
    }
  };

  const handleAddExercise = () => {
    const name = newExercise.trim();
    if (name && !exercises.some(e => e.name === name)) {
      setExercises([...exercises, { name, reps: [0], weight: "" }]);
      setNewExercise("");
    } else if (exercises.some(e => e.name === name)) {
      Alert.alert("Atenção", "Esse exercício já foi adicionado.");
    }
  };

  // Remover exercício
  const handleRemoveExercise = (name: string) => {
    setExercises(exercises.filter(e => e.name !== name));
  };

  // Alterar repetições
  const handleRepChange = (exName: string, idx: number, value: string) => {
    setExercises(exercises.map(e =>
      e.name === exName
        ? { ...e, reps: e.reps.map((r, i) => (i === idx ? (parseInt(value) || 0) : r)) }
        : e
    ));
  };

  // Alterar peso
  const handleWeightChange = (exName: string, value: string) => {
    setExercises(exercises.map(e =>
      e.name === exName ? { ...e, weight: value } : e
    ));
  };

  // Adicionar/Remover série
  const handleAddSeries = (exName: string) => {
    setExercises(exercises.map(e =>
      e.name === exName ? { ...e, reps: [...e.reps, 0] } : e
    ));
  };
  const handleRemoveSeries = (exName: string) => {
    setExercises(exercises.map(e =>
      e.name === exName && e.reps.length > 1
        ? { ...e, reps: e.reps.slice(0, -1) }
        : e
    ));
  };

  // Salvar relatório (simples, só mostra um resumo)
  const handleSave = async () => {
    if (!selectedDay) {
      Alert.alert("Atenção", "Selecione ou adicione um dia de treino.");
      return;
    }
    if (exercises.length === 0) {
      Alert.alert("Atenção", "Adicione pelo menos um exercício.");
      return;
    }

    let resumo = `Dia: ${selectedDay}\n`;

    for (const ex of exercises) {
      // Salva cada exercício no histórico
      await saveWorkoutHistory({
        date: new Date().toLocaleDateString("pt-BR"),
        day: selectedDay,
        exerciseId: 0, 
        exerciseName: ex.name,
        weight: parseFloat(ex.weight) || 0,
        setsDetail: ex.reps.join("/"),
        suggestion: report,
        sets: ex.reps.map((reps, idx) => ({
          setNumber: idx + 1,
          reps,
          weight: parseFloat(ex.weight) || 0,
        })),
      });

      resumo += `• ${ex.name}: ${ex.reps.length} série(s), repetições: ${ex.reps.join("/")}, peso: ${ex.weight}kg\n`;
    }

    if (report) resumo += `\nObservações: ${report}`;
    setSuggestion(resumo);
    Alert.alert("Salvo", "Relatório salvo com sucesso!");
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.header}>
          <Text style={styles.title}>ABSOLUTE ♤ DOMINIUS</Text>
        </View>

        {/* Dias de treino */}
        <View style={styles.section}>
          <Text style={styles.label}>Dias de Treino</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.daySelector}>
            {days.map((day) => (
              <View key={day} style={styles.dayItem}>
                <TouchableOpacity
                  style={[styles.dayButton, selectedDay === day && styles.dayButtonSelected]}
                  onPress={() => { setSelectedDay(day); setExercises([]); }}
                >
                  <Text style={[styles.dayButtonText, selectedDay === day && styles.dayButtonTextSelected]}>
                    {day}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleRemoveDay(day)}>
                  <Text style={styles.removeDay}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
          <View style={styles.addDayRow}>
            <TextInput
              style={[styles.input, { flex: 1, marginRight: 8 }]}
              placeholder="Novo dia (ex: terça)"
              value={newDay}
              onChangeText={setNewDay}
            />
            <TouchableOpacity style={styles.addDayButton} onPress={handleAddDay}>
              <Text style={styles.buttonText}>Adicionar</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Exercícios livres */}
        {selectedDay ? (
          <View style={styles.section}>
            <Text style={styles.label}>Exercícios do Dia</Text>
            <View style={styles.addDayRow}>
              <TextInput
                style={[styles.input, { flex: 1, marginRight: 8 }]}
                placeholder="Nome do exercício"
                value={newExercise}
                onChangeText={setNewExercise}
              />
              <TouchableOpacity style={styles.addDayButton} onPress={handleAddExercise}>
                <Text style={styles.buttonText}>Adicionar</Text>
              </TouchableOpacity>
            </View>
            {exercises.map((ex) => (
              <View key={ex.name} style={styles.card}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                  <Text style={styles.cardTitle}>{ex.name}</Text>
                  <TouchableOpacity onPress={() => handleRemoveExercise(ex.name)}>
                    <Text style={styles.removeDay}>✕</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.label}>Repetições por Série</Text>
                {ex.reps.map((r, idx) => (
                  <View key={idx} style={styles.repRow}>
                    <Text style={styles.repLabel}>Série {idx + 1}</Text>
                    <TextInput
                      style={styles.input}
                      keyboardType="numeric"
                      placeholder="0"
                      value={r === 0 ? "" : r.toString()}
                      onChangeText={(v) => handleRepChange(ex.name, idx, v)}
                    />
                  </View>
                ))}
                <View style={styles.seriesButtonsRow}>
                  <TouchableOpacity
                    style={[styles.button, styles.addSeriesButton]}
                    onPress={() => handleAddSeries(ex.name)}
                  >
                    <Text style={styles.buttonText}>+ Série</Text>
                  </TouchableOpacity>
                  {ex.reps.length > 1 && (
                    <TouchableOpacity
                      style={[styles.button, styles.removeSeriesButton]}
                      onPress={() => handleRemoveSeries(ex.name)}
                    >
                      <Text style={styles.buttonText}>- Série</Text>
                    </TouchableOpacity>
                  )}
                </View>
                <Text style={[styles.label, { marginTop: 8 }]}>Peso Utilizado (kg)</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={ex.weight}
                  onChangeText={(v) => handleWeightChange(ex.name, v)}
                  placeholder="Ex: 35"
                />
              </View>
            ))}
          </View>
        ) : null}

        {/* Relatório */}
        <View style={styles.card}>
          <Text style={styles.label}>Relatório (O que melhorar?)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            multiline
            numberOfLines={4}
            value={report}
            onChangeText={setReport}
            placeholder="Ex: Aumentar carga, repetições, testar variações..."
          />
          <TouchableOpacity style={styles.button} onPress={handleSave}>
            <Text style={styles.buttonText}>Salvar Relatório</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.linkButton} onPress={() => navigation.navigate("History")}>
            <Text style={styles.linkButtonText}>Ver Histórico</Text>
          </TouchableOpacity>
        </View>

        {/* Sugestão/Resumo */}
        {suggestion ? (
          <View style={styles.suggestionCard}>
            <Text style={styles.suggestionText}>{suggestion}</Text>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
    container: { 
    flex: 1, 
    backgroundColor: "#f5f5f5",
    paddingLeft: 60, 
  },
  scrollView: { flex: 1, padding: 16 },
  header: { alignItems: "center", marginBottom: 16 },
  title: { fontSize: 22, fontWeight: "bold", color: "#222" },
  section: { marginBottom: 18, backgroundColor: "#fff", borderRadius: 10, padding: 12, elevation: 1 },
  label: { fontSize: 15, fontWeight: "600", color: "#333", marginBottom: 8 },
  daySelector: { marginBottom: 8 },
  dayItem: { flexDirection: "row", alignItems: "center", marginRight: 8 },
  dayButton: { padding: 10, backgroundColor: "#e7e7e7", borderRadius: 8, minWidth: 90, alignItems: "center" },
  dayButtonSelected: { backgroundColor: "#007AFF" },
  dayButtonText: { color: "#555", fontWeight: "600" },
  dayButtonTextSelected: { color: "#fff" },
  removeDay: { color: "#e53935", marginLeft: 2, fontWeight: "bold", fontSize: 16 },
  addDayRow: { flexDirection: "row", alignItems: "center", marginTop: 8 },
  addDayButton: { backgroundColor: "#007AFF", padding: 12, borderRadius: 8, alignItems: "center" },
  exerciseList: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  exerciseButton: { padding: 10, marginRight: 8, marginBottom: 8, backgroundColor: "#e7e7e7", borderRadius: 8 },
  exerciseButtonSelected: { backgroundColor: "#007AFF" },
  exerciseText: { color: "#444" },
  exerciseTextSelected: { color: "#fff", fontWeight: "700" },
  card: { backgroundColor: "#fff", padding: 14, borderRadius: 12, marginBottom: 12, elevation: 2 },
  cardTitle: { fontSize: 18, fontWeight: "700", marginBottom: 6 },
  metaText: { color: "#666", marginBottom: 8 },
  bold: { fontWeight: "700" },
  repRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  repLabel: { flex: 1, color: "#555" },
  input: { borderWidth: 1, borderColor: "#ddd", borderRadius: 8, padding: 10, minWidth: 80, textAlign: "center", backgroundColor: "#fff" },
  textArea: { height: 100, textAlignVertical: "top", paddingTop: 10 },
  button: { backgroundColor: "#007AFF", padding: 14, borderRadius: 8, alignItems: "center", marginTop: 10 },
  buttonText: { color: "#fff", fontWeight: "700" },
  addSeriesButton: { backgroundColor: "#4CAF50", flex: 1, marginRight: 5, marginTop: 0 },
  removeSeriesButton: { backgroundColor: "#e53935", flex: 1, marginLeft: 5, marginTop: 0 },
  seriesButtonsRow: { flexDirection: "row", marginTop: 8, marginBottom: 4 },
  linkButton: { marginTop: 10, padding: 10, alignItems: "center" },
  linkButtonText: { color: "#007AFF", fontWeight: "600" },
  suggestionCard: { backgroundColor: "#e8f5e8", padding: 12, borderRadius: 10, marginTop: 6, borderLeftWidth: 4, borderLeftColor: "#4CAF50" },
  suggestionText: { color: "#2e7d32" },
  loadingContainer: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center", 
    backgroundColor: "#f5f5f5" 
  },
  loadingText: { 
    fontSize: 18, 
    color: "#666", 
    fontWeight: "600" 
  },
});

export default HomeScreen;
