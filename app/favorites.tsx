// screens/FavoritesScreen.tsx
import { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { db } from '@/utils/firebaseConfig';
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  updateDoc,
  where,
  orderBy,
} from 'firebase/firestore';
import { AntDesign, MaterialIcons } from '@expo/vector-icons';

export default function FavoritesScreen() {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'qrScanHistory'),
      where('favorite', '==', true),
      orderBy('scannedAt', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setFavorites(items);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const removeFavorite = async (item: any) => {
    try {
      const docRef = doc(db, 'qrScanHistory', item.id);
      await updateDoc(docRef, { favorite: false });
    } catch (error) {
      console.error('Error updating favorite:', error);
    }
  };

  const deleteFavorite = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'qrScanHistory', id));
      Alert.alert('Deleted', 'Favorite item removed');
    } catch (error) {
      console.error('Error deleting:', error);
      Alert.alert('Error', 'Failed to delete favorite');
    }
  };

  if (loading) {
    return <ActivityIndicator style={{ flex: 1 }} size="large" />;
  }

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={styles.title}>Starred Favorites</Text>
      <FlatList
        data={favorites}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={{ flex: 1 }}>
              <Text style={styles.value}>{item.value}</Text>
              <Text style={styles.type}>{item.type?.toUpperCase?.() ?? 'UNKNOWN'}</Text>
              {item.imageUrl && <Text style={styles.link}>Image: {item.imageUrl}</Text>}
            </View>
            <View style={styles.actions}>
              <TouchableOpacity onPress={() => removeFavorite(item)}>
                <AntDesign name="star" size={24} color="light-blue" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => deleteFavorite(item.id)}>
                <MaterialIcons name="delete" size={24} color="red" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    elevation: 2,
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  type: {
    fontSize: 14,
    color: 'gray',
  },
  link: {
    fontSize: 12,
    color: 'blue',
    marginTop: 4,
  },
  actions: {
    justifyContent: 'space-between',
    alignItems: 'center',
    marginLeft: 10,
  },
});
