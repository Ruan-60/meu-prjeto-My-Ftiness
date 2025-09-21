import React from "react";
import { View, TouchableOpacity, Text, StyleSheet, Dimensions } from "react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

const icons: Record<string, string> = {
  Home: "home-outline",
  History: "time-outline",
  Estatísticas: "bar-chart-outline",
  Perfil: "person-outline",
};

const Navbar: React.FC<BottomTabBarProps> = ({ state, navigation }) => {
  const isMobile = Dimensions.get("window").width < 600;

  return isMobile ? (
    // Barra inferior (mobile)
    <View style={styles.navbarBottom}>
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;
        const iconName = icons[route.name] || "ellipse-outline";
        return (
          <TouchableOpacity
            key={route.key}
            onPress={() => navigation.navigate(route.name)}
            style={[styles.navItem, isFocused && styles.navItemActive]}
            activeOpacity={0.8}
          >
            <Ionicons
              name={iconName as any}
              size={26}
              color={isFocused ? "#4F8EF7" : "#888"}
            />
            <Text style={[styles.navText, isFocused && styles.navTextActive]}>
              {route.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  ) : (
    // Barra lateral (desktop)
    <View style={styles.navbarSide}>
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;
        const iconName = icons[route.name] || "ellipse-outline";
        return (
          <TouchableOpacity
            key={route.key}
            onPress={() => navigation.navigate(route.name)}
            style={[styles.sideItem, isFocused && styles.sideItemActive]}
            activeOpacity={0.8}
          >
            <Ionicons
              name={iconName as any}
              size={24}
              color={isFocused ? "#4F8EF7" : "#aaa"}
            />
            <Text style={[styles.sideText, isFocused && styles.sideTextActive]}>
              {route.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  // Barra inferior (mobile)
  navbarBottom: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#111",
    paddingVertical: 12,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 12,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -2 },
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
    borderRadius: 14,
    marginHorizontal: 6,
  },
  navItemActive: {
    backgroundColor: "rgba(79, 142, 247, 0.15)",
  },
  navText: {
    color: "#888",
    fontSize: 12,
    fontWeight: "500",
    marginTop: 2,
  },
  navTextActive: {
    color: "#4F8EF7",
    fontWeight: "700",
  },

  // Barra lateral (desktop)
  navbarSide: {
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "center",
    backgroundColor: "#111",
    paddingVertical: 20,
    paddingHorizontal: 8,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    width: 60, // 🔹 sidebar mais estreita
    height: "100%",
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 2, height: 0 },
  },
  sideItem: {
    alignItems: "center",
    marginVertical: 18,
    paddingVertical: 6,
    borderRadius: 12,
    width: "100%",
  },
  sideItemActive: {
    backgroundColor: "rgba(79, 142, 247, 0.15)",
  },
  sideText: {
    color: "#aaa",
    fontSize: 11,
    fontWeight: "500",
    marginTop: 2,
    textAlign: "center",
  },
  sideTextActive: {
    color: "#4F8EF7",
    fontWeight: "700",
  },
});

export default Navbar;