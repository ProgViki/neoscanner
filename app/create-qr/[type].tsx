import React, { useRef, useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Share, Alert } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import * as MediaLibrary from 'expo-media-library';
import { captureRef } from 'react-native-view-shot';

export default function QRTypeDetail() {
  const { type } = useLocalSearchParams<{ type: string }>();
  const [input, setInput] = useState('');
  const [qrValue, setQrValue] = useState('');
  const [isGenerated, setIsGenerated] = useState(false);
  const qrWrapperRef = useRef<View>(null); // Correctly typed

  const generateQR = () => {
    let value = input.trim();
    if (!value) {
      Alert.alert("Input Required", `Please enter ${type} information`);
      return;
    }

    switch (type) {
      case 'phone':
        value = `tel:${value}`;
        break;
      case 'email':
        value = `mailto:${value}`;
        break;
      case 'sms':
        value = `sms:${value}`;
        break;
      case 'geo':
        value = `geo:${value}`;
        break;
      case 'contact':
        value = `BEGIN:VCARD\nVERSION:3.0\nFN:${value}\nEND:VCARD`;
        break;
      default:
        break;
    }

    setQrValue(value);
    setIsGenerated(true);
  };

  const saveQRImage = async () => {
    try {
      const uri = await captureRef(qrWrapperRef, {
        format: 'png',
        quality: 1,
      });

      const permission = await MediaLibrary.requestPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission Denied', 'Cannot save image without media permission');
        return;
      }

      await MediaLibrary.saveToLibraryAsync(uri);
      Alert.alert('Saved', 'QR Code image saved to gallery.');
    } catch (err) {
      Alert.alert('Error', 'Could not save QR Code image.');
    }
  };

  const shareQRImage = async () => {
    try {
      const uri = await captureRef(qrWrapperRef, {
        format: 'png',
        quality: 1,
      });

      await Share.share({
        url: uri,
        title: 'QR Code',
        message: 'Here is your QR Code.',
      });
    } catch (err) {
      Alert.alert('Error', 'Failed to share QR Code.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{type?.toUpperCase()} QR Code</Text>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder={`Enter ${type}`}
          onChangeText={setInput}
          value={input}
        />
        <TouchableOpacity onPress={generateQR} style={styles.checkIcon}>
          <MaterialIcons name="check-circle" size={28} color="green" />
        </TouchableOpacity>
      </View>

      {isGenerated && (
        <View style={styles.qrSection}>
          <View ref={qrWrapperRef} collapsable={false} style={styles.qrBox}>
            <QRCode value={qrValue} size={200} />
          </View>

          <View style={styles.actions}>
            <TouchableOpacity onPress={saveQRImage}>
              <MaterialIcons name="save" size={28} color="#333" />
              <Text>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={shareQRImage}>
              <MaterialIcons name="share" size={28} color="#333" />
              <Text>Share</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.details}>
            <Text style={styles.detailsTitle}>QR Code Value:</Text>
            <Text style={styles.detailsText}>{qrValue}</Text>
          </View>
        </View>
      )}
    </View>
  );
}


const styles = StyleSheet.create({
  container: { padding: 20, flex: 1 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#aaa',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  checkIcon: {
    paddingHorizontal: 4,
  },
  qrSection: { marginTop: 30, alignItems: 'center' },
  qrBox: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 10,
    elevation: 4,
  },
  actions: {
    marginTop: 20,
    flexDirection: 'row',
    gap: 30,
    justifyContent: 'center',
  },
  details: {
    marginTop: 24,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    width: '100%',
  },
  detailsTitle: {
    fontWeight: '600',
    marginBottom: 6,
    fontSize: 16,
  },
  detailsText: {
    fontSize: 14,
    color: '#444',
  },
});