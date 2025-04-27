import { useEffect, useState } from 'react';
import { useImageContext } from '../context/ImageContext';
import { useShareIntent } from 'expo-share-intent';
import { Alert, AppState, AppStateStatus } from 'react-native';
import { router } from 'expo-router';

// Custom hook for handling share intents
export function useShareIntentListener() {
  const { hasShareIntent, shareIntent, resetShareIntent, error } = useShareIntent();
  const [isAppReady, setIsAppReady] = useState(false);
  const [pendingImageUri, setPendingImageUri] = useState<string | null>(null);

  // Track when share intent initialization is complete
  const [shareIntentReady, setShareIntentReady] = useState(false);

  // Handle app state changes to know when the app is active and ready for navigation
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        setIsAppReady(true);
      }
    };

    // Set up app state change listener
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    // Set app as ready after a short delay to ensure navigation is ready
    const timer = setTimeout(() => {
      setIsAppReady(true);
      
      // If we have a pending image URI, navigate to it now
      if (pendingImageUri) {
        navigateToPhotoViewer(pendingImageUri);
        setPendingImageUri(null);
      }
    }, 1000);

    return () => {
      subscription.remove();
      clearTimeout(timer);
    };
  }, [pendingImageUri]);

  // Mark share intent as ready after the initial effect
  useEffect(() => {
    setShareIntentReady(isAppReady);
  }, [isAppReady]);

  const { setImageUri: setGlobalImageUri } = useImageContext();

  // Function to safely navigate to the photo viewer
  const navigateToPhotoViewer = (imageUri: string) => {
    try {
      setGlobalImageUri(imageUri); // Set context so styles tab can use it
      console.log('Navigating to photo viewer with image:', imageUri);
      setTimeout(() => {
        router.push({
          pathname: '/styles',
          params: { imageUri },
        });
      }, 0); // Defer navigation until after navigation is mounted
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };


  // Handle share intents
  useEffect(() => {
    if (hasShareIntent) {
      console.log('Received share intent:', shareIntent);
      
      // Only handle image files
      if (shareIntent.files && shareIntent.files.length > 0) {
        const imageFile = shareIntent.files.find(file => 
          file.mimeType && file.mimeType.startsWith('image/')
        );
        
        if (imageFile) {
          // Check if the app is ready for navigation
          if (isAppReady) {
            // App is ready, navigate immediately
            navigateToPhotoViewer(imageFile.path);
          } else {
            // App is not ready yet, store the URI for later navigation
            console.log('App not ready, storing image URI for later navigation:', imageFile.path);
            setPendingImageUri(imageFile.path);
          }
        } else {
          Alert.alert('Unsupported File', 'Only photos can be shared to this app');
        }
      }
      
      // Reset the share intent after handling it
      resetShareIntent();
    }
    
    if (error) {
      console.error('Share intent error:', error);
    }
  }, [hasShareIntent, shareIntent, resetShareIntent, error]);
  return shareIntentReady;
}

// Empty component to satisfy the default export requirement
export default function ShareIntentListener() {
  // This component doesn't render anything
  return null;
}
