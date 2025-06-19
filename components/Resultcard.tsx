import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Share, Linking } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { Feather } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';

type Props = {
  data: string;
  type: string | undefined;
  timestamp: number;
  onReset: () => void;
};

export default function ResultCard({ data, type, timestamp, onReset }: Props) {
  const isValidUrl = (string: string) => {
    try {
      new URL(string);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <View style={styles.overlay}>
      <View style={styles.card}>
        <Text style={styles.resultType}>Type: {type?.toUpperCase?.() || 'UNKNOWN'}</Text>
        <Text style={styles.resultText}>{data}</Text>
        <Text style={styles.resultTimestamp}>
          Scanned at: {new Date(timestamp).toLocaleString()}
        </Text>

        <View style={styles.actionButtons}>
          {isValidUrl(data) && (
            <TouchableOpacity onPress={() => Linking.openURL(data)} style={styles.actionButton}>
              <Feather name="external-link" size={22} color="#007AFF" />
              <Text style={styles.actionText}>Open</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={() => Share.share({ message: data })} style={styles.actionButton}>
            <Feather name="share-2" size={22} color="#007AFF" />
            <Text style={styles.actionText}>Share</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              Clipboard.setStringAsync(data);
              Alert.alert('Copied', 'The code has been copied to clipboard');
            }}
            style={styles.actionButton}
          >
            <Feather name="copy" size={22} color="#007AFF" />
            <Text style={styles.actionText}>Copy</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.qrCodeContainer}>
          <QRCode value={data} size={200} backgroundColor="transparent" color="black" />
        </View>

        <TouchableOpacity style={styles.closeButton} onPress={onReset}>
          <Text style={styles.closeText}>Scan Again</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    width: '90%',
    alignItems: 'center',
  },
  resultType: { fontSize: 16, fontWeight: '600', color: '#555', marginBottom: 5 },
  resultText: { fontSize: 16, color: '#333', textAlign: 'center', marginBottom: 15 },
  resultTimestamp: { fontSize: 12, color: '#888', marginBottom: 20 },
  actionButtons: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', marginBottom: 20 },
  actionButton: { alignItems: 'center', paddingHorizontal: 10 },
  actionText: { fontSize: 12, color: '#007AFF', marginTop: 5 },
  qrCodeContainer: { backgroundColor: 'white', padding: 10, borderRadius: 8, marginBottom: 20 },
  closeButton: { backgroundColor: '#007AFF', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 20 },
  closeText: { color: 'white', fontWeight: 'bold' },
});
