import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Share,
} from 'react-native';
import * as Contacts from 'expo-contacts';
import QRCode from 'react-native-qrcode-svg';
import { MaterialIcons } from '@expo/vector-icons';
import { captureRef } from 'react-native-view-shot';
import * as MediaLibrary from 'expo-media-library';

export default function QRContactScreen() {
  const [contacts, setContacts] = useState<Contacts.Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contacts.Contact | null>(null);
  const [qrValue, setQrValue] = useState('');
  const qrRef = useRef<View>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Contacts permission is required');
        return;
      }

      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.PhoneNumbers],
      });

      setContacts(data.filter(c => c.name && c.phoneNumbers?.length));
    })();
  }, []);

  const handleSelectContact = (contact: Contacts.Contact) => {
    setSelectedContact(contact);

    const name = contact.name;
    const phone = contact.phoneNumbers?.[0]?.number ?? '';

    const vcard = `BEGIN:VCARD
VERSION:3.0
FN:${name}
TEL:${phone}
END:VCARD`;

    setQrValue(vcard);
  };

  const saveQR = async () => {
    try {
      const uri = await captureRef(qrRef, {
        format: 'png',
        quality: 1,
      });

      const { granted } = await MediaLibrary.requestPermissionsAsync();
      if (!granted) {
        Alert.alert('Permission Required', 'Please grant media permissions to save image.');
        return;
      }

      await MediaLibrary.saveToLibraryAsync(uri);
      Alert.alert('Saved', 'QR Code image saved to gallery.');
    } catch (err) {
      Alert.alert('Error', 'Unable to save QR code');
    }
  };

  const shareQR = async () => {
    try {
      const uri = await captureRef(qrRef, {
        format: 'png',
        quality: 1,
      });

      await Share.share({
        url: uri,
        message: 'Contact QR Code',
      });
    } catch (err) {
      Alert.alert('Error', 'Unable to share QR code');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Select a Contact</Text>

      {!selectedContact ? (
        <FlatList
          data={contacts}
        //   keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.contactItem}
              onPress={() => handleSelectContact(item)}
            >
              <Text style={styles.contactName}>{item.name}</Text>
              <Text style={styles.contactPhone}>
                {item.phoneNumbers?.[0]?.number ?? ''}
              </Text>
            </TouchableOpacity>
          )}
        />
      ) : (
        <View style={styles.qrSection}>
          <View ref={qrRef} collapsable={false} style={styles.qrBox}>
            <QRCode value={qrValue} size={200} />
          </View>

          <View style={styles.actions}>
            <TouchableOpacity onPress={saveQR}>
              <MaterialIcons name="save" size={28} color="#333" />
              <Text>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={shareQR}>
              <MaterialIcons name="share" size={28} color="#333" />
              <Text>Share</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.vcardPreview}>{qrValue}</Text>

          <TouchableOpacity onPress={() => setSelectedContact(null)} style={styles.backBtn}>
            <Text style={{ color: 'white' }}>← Back to list</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  contactItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  contactName: { fontSize: 16, fontWeight: '600' },
  contactPhone: { fontSize: 14, color: '#555' },
  qrSection: { alignItems: 'center', marginTop: 20 },
  qrBox: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 10,
    elevation: 4,
  },
  actions: {
    flexDirection: 'row',
    gap: 20,
    marginTop: 20,
  },
  vcardPreview: {
    marginTop: 20,
    fontSize: 12,
    backgroundColor: '#eee',
    padding: 10,
    borderRadius: 8,
  },
  backBtn: {
    marginTop: 20,
    backgroundColor: '#222',
    padding: 10,
    borderRadius: 8,
  },
});
