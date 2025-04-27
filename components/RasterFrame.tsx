import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, Alert } from 'react-native';
import { Canvas, Image as SkiaImage, useImage, useCanvasRef } from '@shopify/react-native-skia';
import { shareSkiaCanvas } from './RasterFrame.share';

interface RasterFrameProps {
  uri: string;
  aspectRatio: number; // e.g., 9/16 for 9:16
  scalePercent: number; // e.g., 0.8 for 80%
  frameWidth?: number; // optional, defaults to 80% of screen width
  shareable?: boolean; // if true, frame is clickable and shares the rendered image
}

const { width: screenWidth } = Dimensions.get('window');

export const RasterFrame: React.FC<RasterFrameProps> = ({
  uri,
  aspectRatio,
  scalePercent,
  frameWidth,
  shareable,
}) => {
  const image = useImage(uri);
  const canvasRef = useCanvasRef();
  const [containerWidth, setContainerWidth] = React.useState<number | null>(null);
  const frameW = frameWidth || containerWidth || Math.round(screenWidth * 0.8);
  const frameH = Math.round(frameW / aspectRatio);

  useEffect(() => {
    if (canvasRef.current && image) {
      // No-op: canvas will re-render automatically
    }
  }, [image, canvasRef]);

  // Don't render until image is loaded
  // Robustly get Skia image dimensions
  let imgWidth: number | undefined;
  let imgHeight: number | undefined;
  if (image && typeof image.width === 'function' && typeof image.height === 'function') {
    imgWidth = image.width();
    imgHeight = image.height();
  }
  if (!image || typeof imgWidth !== 'number' || typeof imgHeight !== 'number' || imgWidth === 0 || imgHeight === 0) {
    return <View style={[styles.frame, { width: frameW, height: frameH }]} />;
  }

  // Calculate the max size the image can be to fit inside the frame, preserving aspect ratio
  const imgAR = imgWidth / imgHeight;
  let drawW = frameW;
  let drawH = frameH;
  if (imgAR > frameW / frameH) {
    // Image is wider than frame
    drawW = frameW * scalePercent;
    drawH = drawW / imgAR;
  } else {
    // Image is taller than frame
    drawH = frameH * scalePercent;
    drawW = drawH * imgAR;
  }
  const offsetX = (frameW - drawW) / 2;
  const offsetY = (frameH - drawH) / 2;

  // Attach share parameters to canvasRef for sharing
  if (canvasRef.current && image) {
    (canvasRef.current as any).__internalShareParams = {
      image,
      offsetX,
      offsetY,
      drawW,
      drawH,
    };
  }

  const FrameContainer = shareable ? TouchableOpacity : View;
  return (
    <FrameContainer
      style={[styles.frame, frameWidth ? { width: frameW, height: frameH } : { width: '100%', aspectRatio }]}
      onLayout={event => {
        if (!frameWidth) {
          setContainerWidth(event.nativeEvent.layout.width);
        }
      }}
      {...(shareable ? { onPress: async () => {
        if (!image || !canvasRef.current) {
          // Optionally, provide user feedback
          if (typeof window === 'undefined') {
            // Native: use Alert
            // eslint-disable-next-line no-undef
            Alert.alert('Image not ready', 'Please wait until the image is fully loaded before sharing.');
          } else {
            // Web: use alert
            alert('Image not ready. Please wait until it is fully loaded.');
          }
          return;
        }
        if ((frameWidth || containerWidth) && (frameW > 0) && (frameH > 0)) {
          await shareSkiaCanvas(canvasRef, frameW, frameH);
        }
      }} : {})}
    >
      {(frameWidth || containerWidth) && (frameW > 0) && (frameH > 0) ? (
        <Canvas ref={canvasRef} style={{ width: frameW, height: frameH }}>
          <SkiaImage
            image={image!}
            x={offsetX}
            y={offsetY}
            width={drawW}
            height={drawH}
          />
        </Canvas>
      ) : null}
    </FrameContainer>
  );
};

const styles = StyleSheet.create({
  frame: {
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
});

export default RasterFrame;
