// firebaseConfig.ts import (ensure you already have this configured)
import { db } from '@/utils/firebaseConfig';
import { addDoc, collection, Timestamp } from 'firebase/firestore';

// ...rest of your existing imports
import Drawer from '@/components/Drawer';
import ResultCard from '@/components/Resultcard';
import ScannerFrame from '@/components/ScannerFrame';
import { Entypo, Feather, FontAwesome6, MaterialIcons } from '@expo/vector-icons';
import * as CameraAPI from 'expo-camera';
import { CameraView } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;
const DRAWER_WIDTH = SCREEN_WIDTH * 0.7;
const MIN_ZOOM = 0; // Minimum zoom level (1x)
const MAX_ZOOM = 1; // Maximum zoom level (2x)
const ZOOM_SENSITIVITY = 0.005; // Adjust this to change zoom sensitivity

export default function QRScannerScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [scannedData, setScannedData] = useState<{
    data: string;
    type: string;
    timestamp: number;
  } | null>(null);
  const [cameraType, setCameraType] = useState<'back' | 'front'>('back');
  const [zoom, setZoom] = useState(0); // Current zoom level (0-1)
  const [lastZoom, setLastZoom] = useState(0); // For tracking pinch gestures

  const drawerAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const [drawerVisible, setDrawerVisible] = useState(false);
  const cameraRef = useRef<CameraView>(null);
  const router = useRouter();
  const [permission, requestPermission] = CameraAPI.useCameraPermissions();

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: (_, gestureState) => gestureState.numberActiveTouches === 2,
      onMoveShouldSetPanResponder: (_, gestureState) => gestureState.numberActiveTouches === 2,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.numberActiveTouches === 2) {
          const dx = gestureState.dx;
          const dy = gestureState.dy;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (lastZoom === 0) {
            setLastZoom(zoom);
          } else {
            const newZoom = Math.min(
              MAX_ZOOM,
              Math.max(MIN_ZOOM, lastZoom + distance * ZOOM_SENSITIVITY)
            );
            setZoom(newZoom);
          }
        }
      },
      onPanResponderRelease: () => setLastZoom(0),
    })
  ).current;

  useEffect(() => {
    if (!permission) {
      requestPermission();
    } else {
      setHasPermission(permission.granted);
    }
  }, [permission]);

  const handleBarcodeScanned = async ({ data, type }: { data: string; type: string }) => {
    if (scanned) return;
    setScanned(true);
    const timestamp = Date.now();
    setScannedData({ data, type, timestamp });

    try {
      await addDoc(collection(db, 'qrScanHistory'), {
        value: data,
        type,
        scannedAt: Timestamp.fromMillis(timestamp),
        favorite: false,
        imageUrl: '',
      });
    } catch (err) {
      console.error('Error saving scanned QR to Firestore:', err);
    }
  };

  const flipCamera = () => {
    setCameraType((prev) => (prev === 'back' ? 'front' : 'back'));
    setZoom(0);
  };

  const zoomIn = () => setZoom((prevZoom) => Math.min(prevZoom + 0.1, MAX_ZOOM));
  const zoomOut = () => setZoom((prevZoom) => Math.max(prevZoom - 0.1, MIN_ZOOM));

  const toggleDrawer = () => {
    if (drawerVisible) {
      Animated.timing(drawerAnim, {
        toValue: -DRAWER_WIDTH,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setDrawerVisible(false));
    } else {
      setDrawerVisible(true);
      Animated.timing(drawerAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  const pickImageFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets?.[0]?.uri) {
      try {
        const scannedResults = await CameraAPI.scanFromURLAsync(result.assets[0].uri, [
          'qr', 'ean13', 'ean8', 'code128', 'upc_a', 'upc_e',
        ]);

        if (scannedResults.length > 0) {
          const { data, type } = scannedResults[0];
          const timestamp = Date.now();
          setScannedData({ data, type, timestamp });
          setScanned(true);

          await addDoc(collection(db, 'qrScanHistory'), {
            value: data,
            type,
            scannedAt: Timestamp.fromMillis(timestamp),
            favorite: false,
            imageUrl: result.assets[0].uri,
          });
        } else {
          Alert.alert('No QR code found', 'We could not detect any barcode in the selected image.');
        }
      } catch (error) {
        console.error('Error scanning image:', error);
        Alert.alert('Error', 'An error occurred while scanning the image.');
      }
    }
  };

  const drawerItems = [
    { icon: 'qrcode', label: 'Scan' },
    { icon: 'image', label: 'Scan Image' },
    { icon: 'edit', label: 'Create QR' },
    { icon: 'barcode', label: 'Create Barcode' },
    { icon: 'star', label: 'Favorites' },
    { icon: 'history', label: 'History' },
    
  ];

  const handleDrawerAction = (label: string) => {
    toggleDrawer();
    switch (label) {
      case 'Scan': break;
      case 'Scan Image': pickImageFromGallery(); break;
      case 'Create QR': router.push('/create-qr'); break;
      case 'Create Barcode': router.push('/barcode'); break;
      case 'Favorites': router.push('/favorites'); break;
      case 'History': router.push('/history'); break;
    }
  };

  if (hasPermission === null) return <Text>Requesting camera permission...</Text>;
  if (hasPermission === false) return <Text>No camera access</Text>;

  return (
    <View style={{ flex: 1 }}>
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing={cameraType}
        zoom={zoom}
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['qr', 'ean13', 'ean8', 'code128', 'upc_a', 'upc_e'],
        }}
        {...panResponder.panHandlers}
      />

      {!scannedData && (
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
          <View style={styles.topBar} pointerEvents="box-none">
            <TouchableOpacity onPress={toggleDrawer} delayPressIn={0} activeOpacity={0.6}>
              <Feather name="menu" size={28} color="white" />
            </TouchableOpacity>
            <View style={{ flexDirection: 'row', gap: 15 }} pointerEvents="box-none">
              <TouchableOpacity onPress={pickImageFromGallery}>
                <Entypo name="image" size={26} color="white" />
              </TouchableOpacity>
              <TouchableOpacity onPress={flipCamera}>
                <FontAwesome6 name="camera-rotate" size={24} color="white" />
              </TouchableOpacity>
            </View>
          </View>
          <ScannerFrame />
          <View style={styles.zoomControls} pointerEvents="box-none">
            <TouchableOpacity onPress={zoomOut} style={styles.zoomButton}>
              <MaterialIcons name="zoom-out" size={24} color="white" />
            </TouchableOpacity>
            <View style={styles.zoomSliderContainer} pointerEvents="none">
              <View style={[styles.zoomSlider, { width: `${zoom * 100}%` }]} />
            </View>
            <TouchableOpacity onPress={zoomIn} style={styles.zoomButton}>
              <MaterialIcons name="zoom-in" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {scannedData && (
        <ResultCard
          data={scannedData.data}
          type={typeof scannedData.type === 'string' ? scannedData.type : 'unknown'}
          timestamp={scannedData.timestamp}
          onReset={() => {
            setScannedData(null);
            setScanned(false);
          }}
        />
      )}

      <Drawer
        visible={drawerVisible}
        drawerAnim={drawerAnim}
        items={drawerItems}
        onSelect={handleDrawerAction}
        onClose={toggleDrawer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    padding: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  zoomControls: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  zoomButton: {
    padding: 10,
  },
  zoomSliderContainer: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    marginHorizontal: 10,
    overflow: 'hidden',
  },
  zoomSlider: {
    height: '100%',
    backgroundColor: 'white',
  },
});
