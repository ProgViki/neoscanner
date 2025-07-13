import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView, Image, Alert, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import Canvas from 'react-native-canvas';
import { Svg, Rect, Text as SvgText } from 'react-native-svg';
import { captureRef } from 'react-native-view-shot';


interface BarcodeItem {
  id: number;
  data: string;
  uri: string;
  type: string;
  timestamp: string;
}
type SvgElement = {
  children: any[];
};

const BarcodeGenerator = () => {
  // State for form inputs
  const [assetType, setAssetType] = useState('network_device');
  const [modelNumber, setModelNumber] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [supplier, setSupplier] = useState('');
  const [brand, setBrand] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [productName, setProductName] = useState('');
  const [pcIdentifier, setPcIdentifier] = useState('');
  const [department, setDepartment] = useState('');
  const [location, setLocation] = useState('');
  
  // State for barcode generation
  const [barcodeData, setBarcodeData] = useState('');
  const [barcodeUri, setBarcodeUri] = useState('');
  const [generatedBarcodes, setGeneratedBarcodes] = useState<BarcodeItem[]>([]);
    const [barcodeElements, setBarcodeElements] = useState<React.ReactNode[]>([]);
  const canvasRef = useRef<Canvas>(null);
  //  const svgRef = useRef<SvgElement | null>(null);
  const svgRef = useRef<Svg>(null);
   const viewRef = useRef<View>(null);
    const containerRef = useRef<View>(null);
  // Generate unique ID for the asset
  const generateAssetId = () => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `${assetType.substr(0, 3)}_${timestamp}${random}`.toUpperCase();
  };

  // Format data for barcode based on asset type
  const formatBarcodeData = () => {
    let data = '';
    const assetId = generateAssetId();
    
    switch(assetType) {
      case 'network_device':
        data = `ND:${assetId}|MOD:${modelNumber}|SN:${serialNumber}|MFG:${manufacturer}|BR:${brand}`;
        break;
      case 'product':
        data = `PR:${assetId}|NAME:${productName}|MOD:${modelNumber}|SUP:${supplier}`;
        break;
      case 'official_pc':
        data = `PC:${assetId}|ID:${pcIdentifier}|DEPT:${department}|LOC:${location}`;
        break;
      case 'other':
        data = `OT:${assetId}|INFO:${additionalInfo}`;
        break;
      default:
        data = assetId;
    }
    
    return data;
  };


  //  const handleGenerateBarcode = () => {
  //   if (!modelNumber && assetType === 'network_device') {
  //     Alert.alert('Error', 'Please enter model number');
  //     return;
  //   }
    
  //   const data = formatBarcodeData();
  //   setBarcodeData(data);
  // };

  // // Generate barcode when data changes
  // useEffect(() => {
  //   if (!svgRef.current || !barcodeData) return;

  //   if (barcodeData && svgRef.current) {
  //     try {
  //       // Generate barcode
  //       JsBarcode(svgRef.current, barcodeData, {
  //         format: 'CODE128',
  //         lineColor: '#000000',
  //         width: 2,
  //         height: 100,
  //         displayValue: true,
  //         margin: 10,
  //         background: '#ffffff',
  //       });

  //       // Capture as image
  //       captureRef(svgRef, {
  //         format: 'png',
  //         quality: 1,
  //       }).then(uri => {
  //         setGeneratedBarcodes(prev => [...prev, {
  //           id: Date.now(),
  //           data: barcodeData,
  //           uri,
  //           type: assetType,
  //           timestamp: new Date().toISOString()
  //         }]);
  //       });
  //     } catch (error) {
  //       Alert.alert('Error', 'Failed to generate barcode');
  //       console.error(error);
  //     }
  //   }
  // }, [barcodeData]);

   const handleGenerateBarcode = () => {
    if (!modelNumber && assetType === 'network_device') {
      Alert.alert('Error', 'Please enter model number');
      return;
    }
    
    const data = formatBarcodeData();
    setBarcodeData(data);
  };

  // useEffect(() => {
  //   if (!barcodeData || !svgRef.current) return;

  //   try {
  //     // Clear previous content
  //      if (svgRef.current) {
  //       svgRef.current.children = [];
  //     }
      
  //     // Generate new barcode
  //     JsBarcode(svgRef.current, barcodeData, {
  //       format: 'CODE128',
  //       lineColor: '#000000',
  //       width: 2,
  //       height: 100,
  //       displayValue: true,
  //       margin: 10,
  //       background: 'transparent',
  //     });

  //     // Capture the barcode as an image
  //     setTimeout(async () => {
  //       try {
  //         const uri = await captureRef(viewRef, {
  //           format: 'png',
  //           quality: 1,
  //         });
  //         setBarcodeUri(uri);
  //         setGeneratedBarcodes(prev => [...prev, {
  //           id: Date.now(),
  //           data: barcodeData,
  //           uri,
  //           type: assetType,
  //           timestamp: new Date().toISOString()
  //         }]);
  //       } catch (error) {
  //         console.error('Capture error:', error);
  //       }
  //     }, 100);
  //   } catch (error) {
  //     console.error('Barcode generation error:', error);
  //   }
  // }, [barcodeData]);



  // Generate barcode elements
  useEffect(() => {
    if (!barcodeData) return;

    try {
      // Create a temporary array to hold barcode elements
      const elements: React.ReactNode[] = [];
      
      // Simple barcode generation - replace with your actual barcode logic
      const barCount = 30;
      const barWidth = 300 / barCount;
      
      for (let i = 0; i < barCount; i++) {
        const height = Math.random() > 0.3 ? 100 : 50; // Random bar height
        elements.push(
          <Rect
            key={`bar-${i}`}
            x={i * barWidth}
            y={20}
            width={barWidth * 0.8} // 80% width with spacing
            height={height}
            fill="#000000"
          />
        );
      }

      // Add text below barcode using SVG Text
      elements.push(
        <SvgText
          key="barcode-text"
          x="150"
          y="140"
          textAnchor="middle"
          fill="#000000"
          fontSize="14"
        >
          {barcodeData}
        </SvgText>
      );

      setBarcodeElements(elements);

      // Capture the container view as an image
      setTimeout(async () => {
        try {
          if (!containerRef.current) return;
          
          const uri = await captureRef(containerRef, {
            format: 'png',
            quality: 1,
          });
          
          setBarcodeUri(uri);
          setGeneratedBarcodes(prev => [...prev, {
            id: Date.now(),
            data: barcodeData,
            uri,
            type: assetType,
            timestamp: new Date().toISOString()
          }]);
        } catch (error) {
          console.error('Capture error:', error);
          Alert.alert('Error', 'Failed to capture barcode');
        }
      }, 1000);
    } catch (error) {
      console.error('Barcode generation error:', error);
      Alert.alert('Error', 'Failed to generate barcode');
    }
  }, [barcodeData]);

   // Save barcode to device
  const saveBarcode = async () => {
    if (!barcodeUri) {
      Alert.alert('Error', 'No barcode to save');
      return;
    }

    try {
      // On Android, we need to request permissions first
      if (Platform.OS === 'android') {
        const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
        if (!permissions.granted) {
          Alert.alert('Permission required', 'Please grant storage access to save the barcode');
          return;
        }

        const fileName = `barcode_${Date.now()}.png`;
        const fileUri = await FileSystem.StorageAccessFramework.createFileAsync(
          permissions.directoryUri,
          fileName,
          'image/png'
        );
        
        // Copy the file to the new location
        await FileSystem.copyAsync({
          from: barcodeUri,
          to: fileUri
        });
      } else {
        // On iOS, we can save directly to the filesystem
        const fileName = `barcode_${Date.now()}.png`;
        const fileUri = `${FileSystem.documentDirectory}${fileName}`;
        
        // First save to app's document directory
        await FileSystem.copyAsync({
          from: barcodeUri,
          to: fileUri
        });

        // Then move to user-accessible location
        await FileSystem.moveAsync({
          from: fileUri,
          to: `${FileSystem.documentDirectory}../DCIM/${fileName}`
        });
      }

      Alert.alert('Success', 'Barcode saved successfully!');
    } catch (error) {
      console.error('Error saving barcode:', error);
      Alert.alert('Error', 'Failed to save barcode');
    }
  };

  // Share barcode
  const shareBarcode = async () => {
    if (!barcodeUri) {
      Alert.alert('Error', 'No barcode to share');
      return;
    }

    try {
      // Check if sharing is available
      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert('Sharing not available', 'Sharing is not available on this device');
        return;
      }

      // Share the image
      await Sharing.shareAsync(barcodeUri, {
        mimeType: 'image/png',
        dialogTitle: 'Share Barcode',
        UTI: 'public.png'
      });
    } catch (error) {
      console.error('Error sharing barcode:', error);
      Alert.alert('Error', 'Failed to share barcode');
    }
  };

 

 

  // Render appropriate form fields based on asset type
  const renderFormFields = () => {
    switch(assetType) {
      case 'network_device':
        return (
          <>
            <TextInput
              style={styles.input}
              placeholder="Model Number"
              value={modelNumber}
              onChangeText={setModelNumber}
            />
            <TextInput
              style={styles.input}
              placeholder="Serial Number"
              value={serialNumber}
              onChangeText={setSerialNumber}
            />
            <TextInput
              style={styles.input}
              placeholder="Manufacturer"
              value={manufacturer}
              onChangeText={setManufacturer}
            />
            <TextInput
              style={styles.input}
              placeholder="Brand"
              value={brand}
              onChangeText={setBrand}
            />
          </>
        );
      case 'product':
        return (
          <>
            <TextInput
              style={styles.input}
              placeholder="Product Name"
              value={productName}
              onChangeText={setProductName}
            />
            <TextInput
              style={styles.input}
              placeholder="Model Number"
              value={modelNumber}
              onChangeText={setModelNumber}
            />
            <TextInput
              style={styles.input}
              placeholder="Supplier"
              value={supplier}
              onChangeText={setSupplier}
            />
          </>
        );
      case 'official_pc':
        return (
          <>
            <TextInput
              style={styles.input}
              placeholder="PC Identifier"
              value={pcIdentifier}
              onChangeText={setPcIdentifier}
            />
            <TextInput
              style={styles.input}
              placeholder="Department"
              value={department}
              onChangeText={setDepartment}
            />
            <TextInput
              style={styles.input}
              placeholder="Location"
              value={location}
              onChangeText={setLocation}
            />
          </>
        );
      case 'other':
        return (
          <TextInput
            style={[styles.input, { height: 100 }]}
            placeholder="Additional Information"
            value={additionalInfo}
            onChangeText={setAdditionalInfo}
            multiline
          />
        );
      default:
        return null;
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Telecom Asset Barcode Generator</Text>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Asset Type:</Text>
        <Picker
          selectedValue={assetType}
          onValueChange={(itemValue) => setAssetType(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Network Device" value="network_device" />
          <Picker.Item label="Product" value="product" />
          <Picker.Item label="Official PC" value="official_pc" />
          <Picker.Item label="Other" value="other" />
        </Picker>
      </View>
      
      {renderFormFields()}
      
      <Button 
        title="Generate Barcode" 
        onPress={handleGenerateBarcode}
        color="#007AFF"
      />
      
      {barcodeUri ? (
        <View style={styles.barcodeContainer}>
          <Image
            source={{ uri: barcodeUri }}
            style={styles.barcodeImage}
            resizeMode="contain"
          />
          <Text style={styles.barcodeData}>{barcodeData}</Text>
          
          <View style={styles.buttonGroup}>
            <Button 
              title="Save Barcode" 
              onPress={saveBarcode} 
              color="#34C759"
            />
            <Button
              title="Share Barcode"
              onPress={shareBarcode} 
              // color="#5856D6"
              color="#FF9500"
            />
            {/* <Button 
              title="Print" 
              onPress={printBarcode} 
              color="#FF9500"
            /> */}
          </View>
        </View>
      ) : (
        <Text style={styles.placeholder}>Generate a barcode to see it here</Text>
      )}
      
      {generatedBarcodes.length > 0 && (
        <View style={styles.historyContainer}>
          <Text style={styles.historyTitle}>Generated Barcodes</Text>
          {generatedBarcodes.map((item) => (
            <View key={item.id} style={styles.historyItem}>
              <Text style={styles.historyType}>{item.type.replace('_', ' ').toUpperCase()}</Text>
              <Text style={styles.historyData}>{item.data}</Text>
              <Text style={styles.historyTime}>{new Date(item.timestamp).toLocaleString()}</Text>
            </View>
          ))}
        </View>
      )}

       {/* <View ref={containerRef} collapsable={false} style={styles.barcodeContainer}>
        <Svg 
          ref={svgRef}
          height={150}
          width={300}
          style={{ backgroundColor: 'white' }}  // Add background
          >

          </Svg>
      </View> */}

      <View ref={containerRef} collapsable={false} style={styles.barcodeContainer}>
        <Svg height="150" width="300" viewBox="0 0 300 150">
          {barcodeElements}
        </Svg>
      </View>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  formGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#555',
  },
  picker: {
    height: 50,
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  input: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  barcodeContainer: {
    marginVertical: 30,
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  barcodeImage: {
    width: 300,
    height: 150,
    marginBottom: 15,
    color: '#000',
  },
  barcodeData: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 15,
  },
  placeholder: {
    textAlign: 'center',
    marginTop: 20,
    color: '#999',
    fontStyle: 'italic',
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
    gap: 10,
  },
  historyContainer: {
    marginTop: 30,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    paddingTop: 15,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  historyItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  historyType: {
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 5,
  },
  historyData: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  historyTime: {
    fontSize: 10,
    color: '#999',
    fontStyle: 'italic',
  },
});

export default BarcodeGenerator;