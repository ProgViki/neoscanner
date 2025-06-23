import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Clipboard from 'expo-clipboard';
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
  Platform
} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import * as FileSystem from 'expo-file-system';
import QRCode from 'react-native-qrcode-svg';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';


export default function QRTypeDetail() {
  const { type } = useLocalSearchParams<{ type: string }>();
  const [form, setForm] = useState<any>({});
  const [qrValue, setQrValue] = useState('');
  const [isGenerated, setIsGenerated] = useState(false);
  const [qrSize, setQrSize] = useState(200);
  const qrRef = useRef<View>(null);

  const [contacts, setContacts] = useState<Contacts.Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contacts.Contact | null>(null);
  const [search, setSearch] = useState('');
  const [filteredContacts, setFilteredContacts] = useState<Contacts.Contact[]>([]);

  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStart, setShowStart] = useState(false);
  const [showEnd, setShowEnd] = useState(false);
  const [wifiSecurity, setWifiSecurity] = useState('WPA');
  const [openWifi, setOpenWifi] = useState(false);

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

  useEffect(() => {
    if (selectedContact && type === 'contact') {
      const name = selectedContact.name;
      const phone = selectedContact.phoneNumbers?.[0]?.number ?? '';
      const vcard = `BEGIN:VCARD\nVERSION:3.0\nFN:${name}\nTEL:${phone}\nEND:VCARD`;
      setQrValue(vcard);
      setIsGenerated(true);
    }
  }, [selectedContact]);

  const generateQR = async () => {
    let value = '';
    switch (type) {
      case 'text':
        value = form.message || '';
        break;
      case 'clipboard':
        value = await Clipboard.getStringAsync();
        break;
      case 'email':
        if (!form.email || !form.body) return Alert.alert('Invalid email input');
        value = `mailto:${form.email}?subject=${form.subject}&body=${form.body}`;
        break;
      case 'sms':
        if (!form.phone || !form.message) return Alert.alert('Invalid SMS input');
        value = `sms:${form.phone}?body=${form.message}`;
        break;
      case 'geo':
        value = `geo:${form.lat},${form.lng}?q=${form.query}`;
        break;
      case 'calendar':
        value = `BEGIN:VEVENT\nSUMMARY:${form.title}\nLOCATION:${form.location}\nDTSTART:${startDate.toISOString()}\nDTEND:${endDate.toISOString()}\nDESCRIPTION:${form.description}\nEND:VEVENT`;
        break;
      case 'wifi':
        value = `WIFI:S:${form.ssid};T:${wifiSecurity};P:${form.password};;`;
        break;
      case 'my qr':
        value = `BEGIN:VCARD\nFN:${form.name}\nORG:${form.organization}\nADR:${form.address}\nTEL:${form.phone}\nEMAIL:${form.email}\nNOTE:${form.notes}\nEND:VCARD`;
        break;
      case 'url':
        if (!/^https?:\/\//i.test(form.input)) return Alert.alert('Invalid URL');
        value = form.input;
        break;
      case 'phone':
        if (!/^\+?\d{7,15}$/.test(form.input)) return Alert.alert('Invalid phone number');
        value = `tel:${form.input}`;
        break;
      default:
        value = form.input || '';
        break;
    }
    if (!value) return Alert.alert('Input required');
    setQrValue(value);
    setIsGenerated(true);
  };

  const saveQRImage = async () => {
    try {
      const uri = await captureRef(qrRef, { format: 'png', quality: 1 });
      const { granted } = await MediaLibrary.requestPermissionsAsync();
      if (!granted) return Alert.alert('Permission Denied');
      await MediaLibrary.saveToLibraryAsync(uri);
      Alert.alert('Saved to gallery');
    } catch {
      Alert.alert('Failed to save');
    }
  };




const shareQRImage = async () => {
  try {
    const uri = await captureRef(qrRef, {
      format: 'png',
      quality: 1,
    });

    const fileUri = `${FileSystem.cacheDirectory}qr-code.png`;
    await FileSystem.copyAsync({ from: uri, to: fileUri });

    const isAvailable = await Sharing.isAvailableAsync();
    if (isAvailable) {
      await Sharing.shareAsync(fileUri, {
        mimeType: 'image/png',
        dialogTitle: 'Share QR Code',
      });
    } else {
      Alert.alert('Sharing not available on this device.');
    }
  } catch (error) {
    console.error(error);
    Alert.alert('Failed to share QR code');
  }
};




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
 

  return (

    <View style={styles.container} >
      <View style={styles.header}>
      <Text style={styles.title}>{type?.toUpperCase()} QR Code</Text>
        <TouchableOpacity onPress={generateQR} style={styles.checkIcon}>
          <MaterialIcons name="check-circle" size={28} color="green" />
        </TouchableOpacity>
      </View>

      {/* Custom Inputs by Type */}
      {type === 'text' && (
        <TextInput
          style={[styles.input, { height: 100 }]} multiline placeholder="Enter your message"
          onChangeText={(val) => setForm({ ...form, message: val })}
        />
      )}
      {type === 'email' && (
        <>
          <TextInput style={styles.input} placeholder="Email address" onChangeText={(val) => setForm({ ...form, email: val })} />
          <TextInput style={styles.input} placeholder="Subject" onChangeText={(val) => setForm({ ...form, subject: val })} />
          <TextInput style={[styles.input, { height: 100 }]} multiline placeholder="Body" onChangeText={(val) => setForm({ ...form, body: val })} />
        </>
      )}

      {type === 'clipboard' && (
        <TextInput
          style={[styles.input, { height: 120 }]}
          multiline
          value={form.clipboard}
          placeholder="Paste from clipboard"
          onFocus={async () => {
            const clip = await Clipboard.getStringAsync();
            setForm({ ...form, clipboard: clip });
          }}
        />
      )}
      {type === 'url' && (
        <TextInput
          style={styles.input}
          keyboardType="url"
          placeholder="Enter URL (https://...)"
          onChangeText={(val) => setForm({ ...form, input: val })}
        />
      )}
      {type === 'phone' && (
        <TextInput
          style={styles.input}
          keyboardType="phone-pad"
          placeholder="Enter phone number"
          onChangeText={(val) => setForm({ ...form, input: val })}
        />
      )}

      {type === 'sms' && (
        <>
          <TextInput style={styles.input} placeholder="Phone number" onChangeText={(val) => setForm({ ...form, phone: val })} />
          <TextInput style={[styles.input, { height: 100 }]} multiline placeholder="Message" onChangeText={(val) => setForm({ ...form, message: val })} />
        </>
      )}
      {type === 'geo' && (
        <>
          <TextInput style={styles.input} placeholder="Latitude" onChangeText={(val) => setForm({ ...form, lat: val })} />
          <TextInput style={styles.input} placeholder="Longitude" onChangeText={(val) => setForm({ ...form, lng: val })} />
          <TextInput style={styles.input} placeholder="Query" onChangeText={(val) => setForm({ ...form, query: val })} />
        </>
      )}
      {type === 'calendar' && (
        <>
          <TextInput style={styles.input} placeholder="Event title" onChangeText={(val) => setForm({ ...form, title: val })} />
          <TextInput style={styles.input} placeholder="Location" onChangeText={(val) => setForm({ ...form, location: val })} />
          <TextInput style={[styles.input, { height: 80 }]} multiline placeholder="Description" onChangeText={(val) => setForm({ ...form, description: val })} />
          <TouchableOpacity onPress={() => setShowStart(true)}><Text>Select Start Time</Text></TouchableOpacity>
          {showStart && ( <DateTimePicker value={startDate} onChange={(e) => {if (e.nativeEvent.timestamp) setStartDate(new Date(e.nativeEvent.timestamp)); setShowStart(false); }} mode="datetime" display="default" />)}
          <TouchableOpacity onPress={() => setShowEnd(true)}><Text>Select End Time</Text></TouchableOpacity>
          {showEnd && ( <DateTimePicker value={startDate} onChange={(e) => {if (e.nativeEvent.timestamp) setStartDate(new Date(e.nativeEvent.timestamp)); setShowStart(false); }} mode="datetime" display="default" />)}
        </>
      )}
      {type === 'wifi' && !openWifi &&(
        <>
          <TextInput style={styles.input} placeholder="SSID / Network name" onChangeText={(val) => setForm({ ...form, ssid: val })} />
          <TextInput style={styles.input} placeholder="Password" onChangeText={(val) => setForm({ ...form, password: val })} />
          <DropDownPicker
            open={true}
            setOpen={setOpenWifi}
            // placeholder="Security"
            // onChangeValue={(val) => setForm({ ...form, security: val })
            multiple={false}
            items={[
              { label: 'WPA', value: 'WPA' },
              { label: 'WEP', value: 'WEP' },
              { label: 'None', value: 'nopass' }
            ]}
            setValue={setWifiSecurity}
            value={wifiSecurity}
            containerStyle={{ marginTop: 10 }}
            dropDownContainerStyle={{ zIndex: 1000 }}
            showArrowIcon={true}
            showTickIcon={true}
          />
        </>
      )}
      {type === 'my qr' && (
        <>
          <TextInput style={styles.input} placeholder="Full Name" onChangeText={(val) => setForm({ ...form, name: val })} />
          <TextInput style={styles.input} placeholder="Organization" onChangeText={(val) => setForm({ ...form, organization: val })} />
          <TextInput style={styles.input} placeholder="Address" onChangeText={(val) => setForm({ ...form, address: val })} />
          <TextInput style={styles.input} placeholder="Phone" onChangeText={(val) => setForm({ ...form, phone: val })} />
          <TextInput style={styles.input} placeholder="Email" onChangeText={(val) => setForm({ ...form, email: val })} />
          <TextInput style={[styles.input, { height: 80 }]} multiline placeholder="Notes" onChangeText={(val) => setForm({ ...form, notes: val })} />
        </>
      )}

      

      {isGenerated && (
        <View style={styles.qrSection}>
          <View
  ref={qrRef}
  collapsable={false}
  style={{    width: 220, height: 220, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', borderRadius: 16, padding: 10,
}}
>
  <QRCode value={qrValue} size={140} />
</View>

          <View style={styles.actions}>
  <TouchableOpacity style={styles.actionButton} onPress={saveQRImage}>
    <MaterialIcons name="save-alt" size={24} color="#2e7d32" />
    <Text style={styles.actionText}>Save</Text>
  </TouchableOpacity>
  <TouchableOpacity style={styles.actionButton} onPress={shareQRImage}>
    <MaterialIcons name="share" size={24} color="#1565c0" />
    <Text style={styles.actionText}>Share</Text>
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
  header: { alignItems: 'stretch', justifyContent: 'space-around'},
  title: { fontSize: 24, fontWeight: 'bold' },
  input: {
    borderWidth: 1,
    borderColor: '#aaa',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 10,
    color: '#333',
  },
  checkIcon: { alignSelf: 'flex-end', marginBottom: 20 },
  qrSection: { marginTop: 30, alignItems: 'center' },
  qrBox: { backgroundColor: '#fff', padding: 10, borderRadius: 10, elevation: 4 },
  actions: { flexDirection: 'row', gap: 20, marginVertical: 20 },
  // qrValue: { backgroundColor: '#eee', padding: 12, borderRadius: 8, fontSize: 12 },
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
  marginVertical: 12,
  fontSize: 16,
  textShadowColor: '#333',
},
actionButton: {
    alignItems: 'center',
  },
  actionText: {
    marginTop: 4,
    fontSize: 14,
    textShadowColor: '#333',
  },
  detailsBox: {
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#bbb',
    borderRadius: 8,
    padding: 10,
    width: '100%',
    backgroundColor: '#f9f9f9',
  },
  qrValue: {
  marginTop: 20,
  backgroundColor: '#f5f5f5',
  padding: 12,
  borderRadius: 8,
  fontSize: 13,
  color: '#333',
  fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  borderWidth: 1,
  borderColor: '#ccc',
},

});
