import React from "react";
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from "react-native";
import StatsCard from "../components/StatsCard";

const ProfileScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.header}>
          <Text style={styles.title}>Meu Perfil</Text>
          <Text style={styles.subtitle}>Acompanhe seu progresso </Text>
        </View>
        
        <StatsCard />
        
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Sobre o App</Text>
          <Text style={styles.infoText}>
            Absolute Dominius é seu companheiro de treino para registrar exercícios, 
            acompanhar progresso e manter a consistência nos seus treinos.
          </Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}> Banco de Dados</Text>
          <Text style={styles.infoText}>
            Todos os seus dados são armazenados localmente no dispositivo usando SQLite, 
            garantindo privacidade e acesso offline.
          </Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}> Funcionalidades</Text>
          <Text style={styles.infoText}>
            • Registro de treinos por dia{'\n'}
            • Histórico completo de exercícios{'\n'}
            • Acompanhamento de peso e repetições{'\n'}
            • Relatórios personalizados
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#f5f5f5" ,
  paddingLeft: 60,
  },
  scrollView: { 
    flex: 1, 
    padding: 16 
  },
  header: { 
    alignItems: "center", 
    marginBottom: 16 
  },
  title: { 
    fontSize: 24, 
    fontWeight: "bold", 
    color: "#222" 
  },
  subtitle: { 
    fontSize: 16, 
    marginTop: 8, 
    color: "#555" 
  },
  infoCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

export default ProfileScreen;
