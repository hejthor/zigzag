import React, { useState, useEffect } from 'react';
import { useImageContext } from '../../context/ImageContext';
import { StyleSheet, Image, TouchableOpacity, Dimensions, ActivityIndicator, View, Alert, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';

const { width } = Dimensions.get('window');

export default function PhotoViewer() {
  const bottomTabHeight = useBottomTabBarHeight();
  const params = useLocalSearchParams();
  const { imageUri, setImageUri: setGlobalImageUri } = useImageContext();
  const [loading, setLoading] = useState(false);
  const [pickerActive, setPickerActive] = useState(false);
  const [imageAspectRatio, setImageAspectRatio] = useState<number | null>(null);

  // Update context if a param is provided
  useEffect(() => {
    if (params.imageUri && typeof params.imageUri === 'string') {
      setGlobalImageUri(params.imageUri);
    }
  }, [params.imageUri, setGlobalImageUri]);

  // Function to pick an image from the library
  const pickImage = async () => {
    if (pickerActive) return; // Prevent multiple calls
    
    setPickerActive(true);
    try {
      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'We need access to your photos to select an image.');
        return;
      }
      
      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false, // Prevent cropping to square
        quality: 1,
      });
      
      // Handle the result
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const newUri = result.assets[0].uri;
        console.log('Selected new image:', newUri);
        setGlobalImageUri(newUri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'There was a problem selecting the image. Please try again.');
    } finally {
      setPickerActive(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, marginBottom: bottomTabHeight, padding: 16, gap: 16 }} edges={['top', 'left', 'right']}>
      <ThemedView style={[styles.imageContainer, { overflow: 'hidden', position: 'relative' }]}> 
        {/* Placeholder (no image) layer - always rendered at the bottom */}
        <View style={[StyleSheet.absoluteFillObject, { justifyContent: 'center', alignItems: 'center', zIndex: 0, opacity: imageUri ? 0 : 1, pointerEvents: 'none' }]}> 
          <Image
            source={require('../../assets/images/polaroid.png')}
            style={{ width: '300%', height: '300%', opacity: 0.2 }}
            resizeMode="contain"
            blurRadius={36}
          />
        </View>
        {/* imageUri layer - always rendered on top */}
        <View style={[StyleSheet.absoluteFillObject, { justifyContent: 'center', alignItems: 'center', zIndex: 1, opacity: imageUri ? 1 : 0, pointerEvents: imageUri ? 'auto' : 'none' }]}> 
          {imageUri && (
            <Image 
              source={{ uri: imageUri }} 
              style={imageAspectRatio ? { height: '200%', aspectRatio: imageAspectRatio, opacity: 0.1 } : { height: '200%', opacity: 0.1 }}
              resizeMode="cover"
              blurRadius={36}
              onLoad={e => {
                const { width, height } = e.nativeEvent.source;
                if (width && height) setImageAspectRatio(width / height);
              }}
            />
          )}
        </View>
        {/* Foreground: loading or main image or placeholder */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0000ff" />
            <ThemedText style={styles.loadingText}>Loading image...</ThemedText>
          </View>
        ) : imageUri ? (
          <Image 
            source={{ uri: imageUri }} 
            style={[
              styles.image,
              imageAspectRatio ? { aspectRatio: imageAspectRatio } : { height: 200 },
            ]}
            resizeMode="contain"
            onLoad={e => {
              const { width, height } = e.nativeEvent.source;
              if (width && height) setImageAspectRatio(width / height);
            }}
          />
        ) : (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>
            <Image
              source={require('../../assets/images/polaroid.png')}
              style={{ width: '100%', aspectRatio: 1, maxWidth: '100%', padding: 48 }}
              resizeMode="contain"
            />
          </View>
        )}
      </ThemedView>

      <View style={{ flexDirection: 'row', gap: imageUri ? 12 : 0, justifyContent: 'center', alignItems: 'center', width: '100%' }}>
        <TouchableOpacity
          style={[
            styles.button,
            imageUri ? { zIndex: 100, flex: 1 } : { width: '100%', zIndex: 100 },
            pickerActive && styles.buttonDisabled,
          ]}
          onPress={pickImage}
          disabled={pickerActive}
        >
          <ThemedText style={styles.buttonText}>
            Select photo
          </ThemedText>
        </TouchableOpacity>
        {imageUri && (
          <TouchableOpacity
            style={[styles.unloadButton, { flex: 1 }]}
            onPress={() => setGlobalImageUri(null)}
          >
            <ThemedText style={styles.unloadButtonText}>Unload image</ThemedText>
          </TouchableOpacity>
        )}
      </View>
      </SafeAreaView>
  );
}

const FRAME_WIDTH = Math.round(width * 0.8);
const FRAME_HEIGHT = Math.round(FRAME_WIDTH * 16 / 9);

const styles = StyleSheet.create({
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    minHeight: undefined,
    backgroundColor: 'rgb(235, 235, 235)',
    marginBottom: 0,
    alignSelf: 'stretch',
    borderRadius: 8,
  },
  image: {
    width: '100%',
    height: undefined,
    padding: 16
  },
  button: {
    backgroundColor: '#2196F3',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  frameButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    marginTop: 8,
  },
  unloadButton: {
    backgroundColor: '#e53935',
    paddingVertical: 14,
    paddingHorizontal: 24, // Make horizontal padding match styles.button
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    // marginTop removed for alignment
  },
  unloadButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  frameContainer: {
    width: FRAME_WIDTH,
    height: FRAME_HEIGHT,
    borderWidth: 3,
    borderColor: '#222',
    borderRadius: 16,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
    backgroundColor: '#000',
    overflow: 'hidden',
  },
  framedImage: {
    width: '80%',
    height: '80%',
    alignSelf: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#7fb8e8',
  },
  buttonLoader: {
    position: 'absolute',
    right: 15,
  },
  buttonLoaderCentered: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -12 }, { translateY: -12 }], // Assuming ActivityIndicator is ~24x24
    zIndex: 200,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
  },
});
