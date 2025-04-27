import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Alert } from 'react-native';
import { Skia } from '@shopify/react-native-skia';

export async function shareSkiaCanvas(canvasRef: any, frameW: number, frameH: number) {
  try {
    if (!(await Sharing.isAvailableAsync())) {
      Alert.alert('Sharing not available', 'Sharing is not available on this device.');
      return;
    }
    // Get the image and drawing parameters from the RasterFrame instance
    const { image, offsetX, offsetY, drawW, drawH } = canvasRef.current?.__internalShareParams || {};
    if (!image || typeof image.encodeToBytes !== 'function') {
      throw new Error('Image not ready for sharing');
    }
    // Create an offscreen surface
    const surface = Skia.Surface.MakeOffscreen(frameW, frameH);
    if (!surface) throw new Error('Failed to create offscreen Skia surface');
    const ctx = surface.getCanvas();
    ctx.clear(Skia.Color('white'));
    // Draw the image scaled to the frame using drawImageRect
    ctx.drawImageRect(
      image,
      { x: 0, y: 0, width: image.width(), height: image.height() },
      { x: offsetX, y: offsetY, width: drawW, height: drawH },
      Skia.Paint()
    );
    const snapshot = surface.makeImageSnapshot();
    if (!snapshot) throw new Error('Failed to snapshot offscreen surface');
    const pngData = snapshot.encodeToBytes();
    if (!pngData) throw new Error('Failed to encode Skia image to PNG');
    // Save to a temporary file
    const fileUri = FileSystem.cacheDirectory + `rasterframe-share-${Date.now()}.png`;
    await FileSystem.writeAsStringAsync(fileUri, pngData.toString(), {
      encoding: FileSystem.EncodingType.Base64,
    });
    await Sharing.shareAsync(fileUri);
  } catch (e) {
    console.error('Error sharing rasterframe image:', e);
    Alert.alert('Error', 'There was a problem sharing the generated image.');
  }
}

