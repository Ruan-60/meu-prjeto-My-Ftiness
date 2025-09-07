import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";

const Navbar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
  return (
    <View style={styles.navbar}>
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;

        return (
          <TouchableOpacity
            key={route.key}
            onPress={() => navigation.navigate(route.name)}
            style={[styles.navItem, isFocused && styles.navItemActive]}
          >
            <Text style={[styles.navText, isFocused && styles.navTextActive]}>
              {route.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  navbar: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#111",
    paddingVertical: 12,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  navItem: {
    padding: 10,
  },
  navItemActive: {
    borderBottomWidth: 2,
    borderBottomColor: "#007AFF",
  },
  navText: {
    color: "#aaa",
    fontSize: 14,
    fontWeight: "500",
  },
  navTextActive: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default Navbar;
