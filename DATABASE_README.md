# 🗄️ Banco de Dados SQLite - MyFitness App

## 📊 Estrutura do Banco de Dados

O aplicativo MyFitness agora utiliza um banco de dados SQLite local para armazenar todos os dados de forma persistente e eficiente.

### 🏗️ Tabelas Criadas

#### 1. **exercises** - Exercícios do Plano de Treino
```sql
CREATE TABLE exercises (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  sets INTEGER NOT NULL,
  reps TEXT NOT NULL,
  day TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Campos:**
- `id`: Identificador único do exercício
- `name`: Nome do exercício (ex: "Puxador frontal")
- `sets`: Número de séries
- `reps`: Faixa de repetições (ex: "8-12")
- `day`: Dia da semana (segunda, quarta, sexta, sabado)
- `created_at`: Data de criação

#### 2. **workout_history** - Histórico de Treinos
```sql
CREATE TABLE workout_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,
  day TEXT NOT NULL,
  exercise_id INTEGER,
  exercise_name TEXT NOT NULL,
  weight REAL NOT NULL,
  sets_detail TEXT NOT NULL,
  suggestion TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (exercise_id) REFERENCES exercises (id)
);
```

**Campos:**
- `id`: Identificador único do treino
- `date`: Data do treino (formato brasileiro)
- `day`: Dia da semana
- `exercise_id`: Referência ao exercício
- `exercise_name`: Nome do exercício
- `weight`: Peso utilizado (em kg)
- `sets_detail`: Detalhes das séries realizadas
- `suggestion`: Sugestão/relatório do usuário
- `created_at`: Data de criação

#### 3. **workout_sets** - Séries Individuais
```sql
CREATE TABLE workout_sets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  workout_history_id INTEGER NOT NULL,
  set_number INTEGER NOT NULL,
  reps INTEGER NOT NULL,
  weight REAL NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (workout_history_id) REFERENCES workout_history (id)
);
```

**Campos:**
- `id`: Identificador único da série
- `workout_history_id`: Referência ao treino
- `set_number`: Número da série (1, 2, 3, etc.)
- `reps`: Repetições realizadas na série
- `weight`: Peso utilizado na série
- `created_at`: Data de criação

## 🚀 Funcionalidades Implementadas

### ✅ **Exercícios**
- Carregamento automático dos exercícios padrão
- Busca de exercícios por dia da semana
- Busca de exercício específico por nome e dia

### ✅ **Histórico de Treinos**
- Salvar treino completo com todas as séries
- Buscar histórico completo ou por exercício
- Buscar último treino de um exercício específico
- Limpar histórico completo

### ✅ **Séries Individuais**
- Armazenamento detalhado de cada série
- Rastreamento de peso e repetições por série
- Histórico completo de progresso

### ✅ **Estatísticas**
- Contagem total de treinos realizados
- Contagem total de exercícios cadastrados
- Data do último treino realizado

## 📱 Arquivos Criados/Modificados

### 🆕 **Novos Arquivos:**
- `src/database/database.ts` - Configuração e funções do banco de dados
- `src/hooks/useDatabase.ts` - Hook personalizado para uso do banco
- `src/components/StatsCard.tsx` - Componente de estatísticas

### 🔄 **Arquivos Modificados:**
- `src/screens/HomeScreen.tsx` - Integrado com SQLite
- `src/screens/HistoryScreen.tsx` - Integrado com SQLite
- `src/screens/ProfileScreen.tsx` - Adicionado estatísticas

### 📦 **Dependências Instaladas:**
- `expo-sqlite` - Biblioteca SQLite para Expo

## 🎯 **Vantagens do SQLite**

### ✅ **Performance**
- Acesso rápido aos dados
- Queries otimizadas
- Índices automáticos

### ✅ **Persistência**
- Dados salvos localmente no dispositivo
- Não perde dados ao fechar o app
- Backup automático

### ✅ **Estrutura Organizada**
- Relacionamentos entre tabelas
- Integridade referencial
- Queries complexas suportadas

### ✅ **Privacidade**
- Dados ficam no dispositivo
- Não há envio para servidores externos
- Controle total sobre os dados

## 🔧 **Como Usar**

### **Inicialização:**
O banco é inicializado automaticamente quando o app é aberto.

### **Exercícios Padrão:**
Os exercícios são inseridos automaticamente na primeira execução:
- **Segunda**: Costas e Bíceps
- **Quarta**: Peito e Tríceps  
- **Sexta**: Pernas
- **Sábado**: Ombros

### **Registro de Treinos:**
1. Selecione o dia e exercício
2. Preencha as repetições de cada série
3. Insira o peso utilizado
4. Adicione um relatório (opcional)
5. Clique em "Salvar Relatório"

### **Visualização de Histórico:**
- Acesse a aba "History"
- Veja todos os treinos realizados
- Opção de limpar histórico completo

### **Estatísticas:**
- Acesse a aba "Profile"
- Veja estatísticas do seu progresso
- Acompanhe número de treinos e exercícios

## 🛠️ **Manutenção**

### **Backup:**
Os dados são armazenados no arquivo `myfitness.db` no dispositivo.

### **Limpeza:**
Use a função "Apagar Histórico" na tela de histórico para limpar todos os dados.

### **Debug:**
Logs de erro são exibidos no console para facilitar o debug.

## 🎉 **Resultado Final**

O aplicativo agora possui:
- ✅ Banco de dados SQLite totalmente funcional
- ✅ Armazenamento persistente de dados
- ✅ Interface atualizada com loading states
- ✅ Estatísticas em tempo real
- ✅ Histórico completo de treinos
- ✅ Estrutura escalável para futuras funcionalidades

**O app está pronto para uso com banco de dados SQLite!** 🚀

