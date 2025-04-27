import { ThemedText } from '@/components/ThemedText';
import RasterFrame from '@/components/RasterFrame';
import { useImageContext } from '../../context/ImageContext';
import { ScrollView, View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { Image } from 'react-native';

const SCALE_VARIANTS = [0.5, 0.65, 0.8, 0.95];

export default function StylesScreen() {
  const { imageUri } = useImageContext();
  const bottomTabHeight = useBottomTabBarHeight();
  return (
    <ScrollView
      style={{ marginBottom: bottomTabHeight }}
      contentContainerStyle={{ padding: 16 }}
    >
      <SafeAreaView edges={['top', 'left', 'right']}>
      {imageUri ? (
        <>
          <ThemedText style={styles.sectionTitle}>Scale Variations</ThemedText>
          <View style={styles.grid}>
            {SCALE_VARIANTS.map((scale, i) => (
              <View style={styles.gridItem} key={scale}>
                <RasterFrame
                  uri={imageUri}
                  aspectRatio={9/16}
                  scalePercent={scale}
                  shareable={true}
                />
                <ThemedText style={styles.caption}>scalePercent: {scale}</ThemedText>
              </View>
            ))}
          </View>
        </>
      ) : (
        <ThemedText>No photo loaded. Go to the Photo tab and select an image.</ThemedText>
      )}
      </SafeAreaView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'left',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  gridItem: {
    width: '50%',
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  caption: {
    fontSize: 12,
    color: '#666',
  },
});
