import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { BarChart } from "react-native-chart-kit";
import { getWorkoutHistory, WorkoutHistory } from "../database/database";
import { useFocusEffect } from "@react-navigation/native";

// Lista ordenada de dias da semana para garantir que o gráfico seja exibido corretamente
const DAYS_OF_WEEK_SHORT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const DAYS_OF_WEEK_FULL = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];

interface DayFrequency {
  day: string;
  workouts: number;
}

// 📌 Função auxiliar para determinar o dia da semana a partir da data (dd/mm/yyyy ou YYYY-MM-DD)
const parseAndGetDayIndex = (dateString: string): number | null => {
    let date: Date;
    
    // 🚀 CORREÇÃO CRÍTICA DO PARSER DE DATA (Lida com dd/mm/yyyy OU YYYY-MM-DD)
    if (dateString.includes('/')) {
        // Formato: "dd/mm/yyyy"
        const [day, month, year] = dateString.split("/");
        // Note: Month is 0-indexed in JavaScript Date
        date = new Date(Number(year), Number(month) - 1, Number(day));
    } else if (dateString.includes('-')) {
        // Formato: "YYYY-MM-DD" (Padrão ISO / SQLite)
        // Usar new Date(dateString + 'T00:00:00') evita problemas de fuso horário
        date = new Date(dateString.split(' ')[0] + 'T00:00:00'); 
    } else {
        return null;
    }
    
    // ⚠️ Se o parsing da data falhou (NaN), retorna null
    if (isNaN(date.getTime())) {
        return null;
    }

    // Retorna o índice do dia (0=Dom, 1=Seg, ..., 6=Sáb)
    return date.getDay();
};

const ProfileScreen: React.FC = () => {
  const [dayFrequency, setDayFrequency] = useState<DayFrequency[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Atualiza gráfico toda vez que a tela ganha foco
  useFocusEffect(
    useCallback(() => {
      loadDayFrequency();
    }, [])
  );

  // 🚀 LÓGICA: Agrega treinos por dia da semana
  const loadDayFrequency = async () => {
    setLoading(true);
    try {
      const history: WorkoutHistory[] = await getWorkoutHistory();

      if (!history || history.length === 0) {
        setDayFrequency([]);
        setLoading(false);
        return;
      }

      // Inicializa o mapa com 0 para todos os dias
      const dayMap: Record<string, number> = DAYS_OF_WEEK_SHORT.reduce((acc, day) => {
        acc[day] = 0; 
        return acc;
      }, {} as Record<string, number>);

      // Contagem dos treinos
      history.forEach((item) => {
        if (!item.date) return;
        
        // 🎯 Tenta obter o dia da semana a partir da data (mais confiável)
        const dayIndex = parseAndGetDayIndex(item.date);
        
        if (dayIndex !== null) {
            const dayKey = DAYS_OF_WEEK_SHORT[dayIndex];
            dayMap[dayKey] = (dayMap[dayKey] || 0) + 1;
        } else {
             // Fallback: Se o parser falhou, tente usar o item.day (que pode ser abreviado)
             const dayKeyFromDb = item.day.substring(0, 3);
             if (DAYS_OF_WEEK_SHORT.includes(dayKeyFromDb)) {
                 dayMap[dayKeyFromDb] = (dayMap[dayKeyFromDb] || 0) + 1;
             }
        }
      });
      
      // Converte o mapa de volta para o array ordenado para o gráfico
      const data: DayFrequency[] = DAYS_OF_WEEK_SHORT.map((day) => ({
        day: day,
        workouts: dayMap[day] || 0,
      }));
      
      setDayFrequency(data);
    } catch (error) {
      console.error("Erro ao carregar gráfico de frequência diária:", error);
      setDayFrequency([]);
    }
    setLoading(false);
  };
  
  const totalWorkouts = dayFrequency.reduce((sum, d) => sum + d.workouts, 0);
  const progressoMsg =
    totalWorkouts > 0
      ? `Total de treinos registrados: ${totalWorkouts}. Veja sua frequência por dia.`
      : "💪 Tente treinar pelo menos 3 vezes por semana para melhores resultados.";


  const onRefresh = async () => {
    setRefreshing(true);
    await loadDayFrequency(); 
    setRefreshing(false);
  };
  
  // 📊 Configuração do Gráfico
  const chartData = {
    // Labels agora são os dias da semana
    labels: dayFrequency.map((d) => d.day),
    // Os dados são a contagem de treinos para cada dia
    datasets: [{ data: dayFrequency.map((d) => d.workouts) }],
  };

  const screenWidth = Dimensions.get("window").width;
  // Largura corrigida: W - 56 (W - 2*marginHorizontal - 2*padding)
  const chartWidth = screenWidth - 56; 
  
  const chartConfig = {
    backgroundColor: "#fff",
    backgroundGradientFrom: "#fff",
    backgroundGradientTo: "#fff",
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(34, 34, 34, ${opacity})`,
    style: { borderRadius: 16 },
  }


  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Meu Progresso</Text>
          <Text style={styles.subtitle}>Sua frequência de treinos por dia da semana</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Treinos por Dia</Text>
          {loading ? (
            <ActivityIndicator size="large" color="#007AFF" style={{ marginVertical: 30 }} />
          ) : dayFrequency.length === 0 || totalWorkouts === 0 ? (
            <Text style={styles.empty}>Nenhum treino registrado ainda.</Text>
          ) : (
            <BarChart
              data={chartData} 
              width={chartWidth} 
              height={240}
              yAxisLabel=""
              yAxisSuffix=""
              fromZero
              showValuesOnTopOfBars
              chartConfig={chartConfig} 
              style={{ borderRadius: 14 }}
              yAxisInterval={1} 
            />
          )}
          <Text style={styles.analysis}>{progressoMsg}</Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>💡 Análise de Hábito</Text>
          <Text style={styles.infoText}>
            O dia com o maior número de treinos é onde você tem maior consistência. Use essa informação para planejar sua semana.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  header: { alignItems: "center", marginVertical: 16 },
  title: { fontSize: 24, fontWeight: "bold", color: "#222" },
  subtitle: { fontSize: 16, color: "#555", marginTop: 4 },
  card: {
    backgroundColor: "#fff",
    padding: 18, 
    borderRadius: 14,
    marginBottom: 18,
    marginHorizontal: 10, 
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  cardTitle: { fontSize: 18, fontWeight: "bold", color: "#333", marginBottom: 10 },
  empty: { textAlign: "center", color: "#888", marginVertical: 30 },
  analysis: {
    marginTop: 12,
    fontSize: 15,
    color: "#007AFF",
    fontWeight: "600",
    textAlign: "center",
  },
  infoCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    marginHorizontal: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  infoTitle: { fontSize: 17, fontWeight: "bold", color: "#333", marginBottom: 8 },
  infoText: { fontSize: 14, color: "#666", lineHeight: 20 },
});

export default ProfileScreen;