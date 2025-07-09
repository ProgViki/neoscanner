// screens/HistoryScreen.tsx
import { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { db } from '@/utils/firebaseConfig';
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
} from 'firebase/firestore';
import { AntDesign, MaterialIcons } from '@expo/vector-icons';

export default function HistoryScreen() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'qrScanHistory'), orderBy('scannedAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setHistory(items);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const deleteHistoryItem = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'qrScanHistory', id));
      Alert.alert('Deleted', 'History item removed');
    } catch (error) {
      console.error('Error deleting:', error);
      Alert.alert('Error', 'Failed to delete history');
    }
  };

  const toggleFavorite = async (item: any) => {
    try {
      const docRef = doc(db, 'qrScanHistory', item.id);
      await updateDoc(docRef, { favorite: !item.favorite });
    } catch (error) {
      console.error('Error updating favorite:', error);
    }
  };

  const clearAllHistory = () => {
    Alert.alert('Clear All?', 'Are you sure you want to delete all history?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear All',
        style: 'destructive',
        onPress: async () => {
          const snapshot = await getDocs(collection(db, 'qrScanHistory'));
          snapshot.forEach(async (docSnap) => {
            await deleteDoc(doc(db, 'qrScanHistory', docSnap.id));
          });
        },
      },
    ]);
  };

  if (loading) {
    return <ActivityIndicator style={{ flex: 1 }} size="large" />;
  }

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <View style={styles.header}>
        <Text style={styles.title}>Scan History</Text>
        <TouchableOpacity onPress={clearAllHistory}>
          <MaterialIcons name="delete-sweep" size={28} color="red" />
        </TouchableOpacity>
      </View>
      <FlatList
        data={history}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={{ flex: 1 }}>
              <Text style={styles.value}>{item.value}</Text>
              <Text style={styles.type}>{(typeof item.type === 'string' ? item.type : 'unknown').toUpperCase()}</Text>
              {item.imageUrl && <Text style={styles.link}>Image: {item.imageUrl}</Text>}
            </View>
            <View style={styles.actions}>
              <TouchableOpacity onPress={() => toggleFavorite(item)}>
                <AntDesign
                  name={item.favorite ? 'star' : 'staro'}
                  size={24}
                  color={item.favorite ? 'light-blue' : 'gray'}
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => deleteHistoryItem(item.id)}>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
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
