import {
  Feather,
  FontAwesome,
  MaterialCommunityIcons,
  MaterialIcons,
} from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity
} from 'react-native';

const QR_TYPES = [
  { label: 'Clipboard', icon: 'content-copy', lib: 'MaterialIcons' },
  { label: 'URL', icon: 'link', lib: 'Feather' },
  { label: 'Text', icon: 'text-box-outline', lib: 'MaterialCommunityIcons' },
  { label: 'Contact', icon: 'account-circle', lib: 'MaterialIcons' },
  { label: 'Email', icon: 'email', lib: 'MaterialIcons' },
  { label: 'SMS', icon: 'message', lib: 'MaterialIcons' },
  { label: 'Geo', icon: 'map-marker', lib: 'FontAwesome' },
  { label: 'Phone', icon: 'phone', lib: 'Feather' },
  { label: 'Calendar', icon: 'calendar', lib: 'Feather' },
  { label: 'WiFi', icon: 'wifi', lib: 'Feather' },
  { label: 'My QR', icon: 'qrcode', lib: 'FontAwesome' },
];

export default function CreateQRScreen() {
  const router = useRouter();

  const getIconComponent = (lib: string) => {
    switch (lib) {
      case 'MaterialIcons':
        return MaterialIcons;
      case 'Feather':
        return Feather;
      case 'FontAwesome':
        return FontAwesome;
      case 'MaterialCommunityIcons':
        return MaterialCommunityIcons;
      default:
        return MaterialIcons;
    }
  };

  const handleSelectType = (label: string) => {
  router.push({
  pathname: '/create-qr/[type]',
  params: { type: label.toLowerCase() },
});
};



  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Create QR Code</Text>

      <FlatList
        data={QR_TYPES}
        numColumns={3}
        keyExtractor={(item) => item.label}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item }) => {
          const Icon = getIconComponent(item.lib);
          return (
            <TouchableOpacity
              style={styles.gridItem}
              onPress={() => handleSelectType(item.label)}
            >
              <Icon name={item.icon as any} size={28} color="#333" />
              <Text style={styles.label}>{item.label}</Text>
            </TouchableOpacity>
          );
        }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#fff', flex: 1 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  gridItem: {
    flex: 1,
    margin: 8,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
  },
  label: { marginTop: 6, fontSize: 14 },
});
