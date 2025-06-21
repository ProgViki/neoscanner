import { MaterialIcons } from '@expo/vector-icons';
import * as Contacts from 'expo-contacts';
import * as MediaLibrary from 'expo-media-library';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  FlatList,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { captureRef } from 'react-native-view-shot';

export default function QRTypeDetail() {
  const { type } = useLocalSearchParams<{ type: string }>();
  const [input, setInput] = useState('');
  const [qrValue, setQrValue] = useState('');
  const [isGenerated, setIsGenerated] = useState(false);
  const qrRef = useRef<View>(null);

  const [contacts, setContacts] = useState<Contacts.Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contacts.Contact | null>(null);
  const [search, setSearch] = useState('');
const [filteredContacts, setFilteredContacts] = useState<Contacts.Contact[]>([]);

// Filter contacts based on search input
useEffect(() => {
  if (type === 'contact') {
    const keyword = search.toLowerCase();
    const filtered = contacts.filter((c) =>
      c.name.toLowerCase().includes(keyword) ||
      c.phoneNumbers?.some(p => p.number?.includes(keyword))
    );
    setFilteredContacts(filtered);
  }
}, [search, contacts]);


  // Fetch contacts if type === contact
  useEffect(() => {
    if (type === 'contact') {
      (async () => {
        const { status } = await Contacts.requestPermissionsAsync();
        if (status === 'granted') {
          const { data } = await Contacts.getContactsAsync({
            fields: [Contacts.Fields.PhoneNumbers],
          });

          setContacts(data.filter((c) => c.name && c.phoneNumbers?.length));
        } else {
          Alert.alert('Permission denied', 'Cannot access contacts');
        }
      })();
    }
  }, [type]);

  // Set VCARD when contact is selected
  useEffect(() => {
    if (selectedContact && type === 'contact') {
      const name = selectedContact.name;
      const phone = selectedContact.phoneNumbers?.[0]?.number ?? '';

      const vcard = `BEGIN:VCARD
VERSION:3.0
FN:${name}
TEL:${phone}
END:VCARD`;

      setQrValue(vcard);
      setIsGenerated(true);
    }
  }, [selectedContact]);

  const generateQR = () => {
    let value = input.trim();
    if (!value) {
      Alert.alert('Input Required', `Please enter ${type} information`);
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
        return; // Skip here; handled by contact selector
      default:
        break;
    }

    setQrValue(value);
    setIsGenerated(true);
  };

  const saveQRImage = async () => {
    try {
      const uri = await captureRef(qrRef, {
        format: 'png',
        quality: 1,
      });

      const { granted } = await MediaLibrary.requestPermissionsAsync();
      if (!granted) {
        Alert.alert('Permission Denied', 'Cannot save image without permission');
        return;
      }

      await MediaLibrary.saveToLibraryAsync(uri);
      Alert.alert('Saved', 'QR Code image saved to gallery');
    } catch (err) {
      Alert.alert('Error', 'Failed to save image');
    }
  };

  const shareQRImage = async () => {
    try {
      const uri = await captureRef(qrRef, {
        format: 'png',
        quality: 1,
      });

      await Share.share({
        url: uri,
        title: 'QR Code',
        message: 'Here is your QR code',
      });
    } catch (err) {
      Alert.alert('Error', 'Failed to share QR code');
    }
  };

  // Contact mode
  if (type === 'contact' && !selectedContact) {
    return (
      <View style={styles.container}>
  <Text style={styles.title}>Select Contact</Text>

  <TextInput
    placeholder="Search contact"
    value={search}
    onChangeText={setSearch}
    style={styles.searchInput}
  />

  <FlatList
    data={filteredContacts}
    keyExtractor={(item) => item.id ?? item.name ?? Math.random().toString()}
    renderItem={({ item }) => (
      <TouchableOpacity
        style={styles.contactItem}
        onPress={() => setSelectedContact(item)}
      >
        <Text style={styles.contactName}>{item.name}</Text>
        <Text style={styles.contactPhone}>
          {item.phoneNumbers?.[0]?.number ?? ''}
        </Text>
      </TouchableOpacity>
    )}
  />
</View>

    );
  }

  // Default QR generation screen
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{type?.toUpperCase()} QR Code</Text>
       
      {type !== 'contact' && (
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
      )}

      {isGenerated && (
        <View style={styles.qrSection}>
          <View ref={qrRef} collapsable={false} style={styles.qrBox}>
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

          <Text style={styles.qrValue}>{qrValue}</Text>
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
  qrValue: {
    marginTop: 16,
    fontSize: 12,
    color: '#333',
    backgroundColor: '#eee',
    padding: 10,
    borderRadius: 6,
    width: '100%',
  },
  contactItem: {
    padding: 14,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
  },
  contactPhone: {
    fontSize: 14,
    color: '#555',
  },
  searchInput: {
  borderWidth: 1,
  borderColor: '#aaa',
  borderRadius: 8,
  padding: 10,
  marginBottom: 12,
  fontSize: 16,
},

});
