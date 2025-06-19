import * as FileSystem from 'expo-file-system';
import { View } from 'react-native';

export const downloadFile = async () => {
  const downloadResumable = FileSystem.createDownloadResumable(
    'https://example.com/file.pdf',
    FileSystem.documentDirectory + 'file.pdf'
  );

  try {
    const result = await downloadResumable.downloadAsync();

    if (result && result.uri) {
      console.log('Downloaded to:', result.uri);
    } else {
      console.warn('Download did not complete or returned no result.');
    }
  } catch (error) {
    console.error('Download failed:', error);
  }
};


export const uploadFile = async () => {
  const uri = FileSystem.documentDirectory + 'file-to-upload.txt';
  const uploadUrl = 'https://your-server.com/upload';

  const result = await FileSystem.uploadAsync(uploadUrl, uri, {
    fieldName: 'file',
    httpMethod: 'POST',
    uploadType: FileSystem.FileSystemUploadType.MULTIPART,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  console.log(result);
};

export const writeToFile = async () => {
  const fileUri = FileSystem.documentDirectory + 'mydata.json';
  await FileSystem.writeAsStringAsync(fileUri, JSON.stringify({ name: 'Victor' }));
  console.log('File saved:', fileUri);
};

const readFile = async () => {
  const fileUri = FileSystem.documentDirectory + 'mydata.json';
  const content = await FileSystem.readAsStringAsync(fileUri);
  console.log('File content:', content);
};

import { captureRef } from 'react-native-view-shot';

export const saveQRCodeImage = async (viewRef: React.RefObject<View>) => {
  const uri = await captureRef(viewRef, { format: 'png', quality: 1 });
  const fileName = `${FileSystem.documentDirectory}qr-code.png`;

  await FileSystem.moveAsync({
    from: uri,
    to: fileName,
  });

  console.log('QR Code saved to:', fileName);
};

export const checkOrCreateFolder = async () => {
  const dir = FileSystem.documentDirectory + 'my-folder/';
  const dirInfo = await FileSystem.getInfoAsync(dir);

  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
    console.log('Directory created:', dir);
  } else {
    console.log('Directory already exists:', dir);
  }
};
