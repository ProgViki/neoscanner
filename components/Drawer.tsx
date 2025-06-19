import React from 'react';
import { Animated, Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

type DrawerItem = {
  icon: string;
  label: string;
};

type Props = {
  visible: boolean;
  drawerAnim: Animated.Value;
  items: DrawerItem[];
  onSelect: (label: string) => void;
  onClose: () => void;
};

export default function Drawer({ visible, drawerAnim, items, onSelect, onClose }: Props) {
  if (!visible) return null;

  return (
    <>
      <TouchableOpacity activeOpacity={1} onPress={onClose} style={styles.overlay} />
      <Animated.View style={[styles.drawer, { transform: [{ translateX: drawerAnim }] }]}>
        {items.map((item, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => onSelect(item.label)}
            style={[styles.item, index === 0 && styles.primaryItem]}
          >
            <FontAwesome name={(item.icon as any)} size={20} color="#fff" />
            <Text style={styles.label}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    zIndex: 5,
  },
  drawer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: '70%',
    backgroundColor: '#111',
    paddingTop: 25,
    zIndex: 10,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderBottomColor: '#444',
    borderBottomWidth: 0.5,
  },
  primaryItem: {
    backgroundColor: '#0f1c2e',
  },
  label: {
    color: '#fff',
    marginLeft: 20,
    fontSize: 16,
  },
});
