import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { Image } from 'react-native';

const FAQS = [
  {
    question: 'How do I load a photo?',
    answer: 'Go to the Photo tab and select an image from your device.'
  },
  {
    question: 'What is the Styles tab?',
    answer: 'The Styles tab displays different scale variations of your selected photo.'
  },
  {
    question: 'Why can\'t I see any image in the Styles tab?',
    answer: 'Make sure you have loaded a photo in the Photo tab first.'
  },
  {
    question: 'How do I change the image?',
    answer: 'Return to the Photo tab and select a different image.'
  },
  {
    question: 'Who made this app?',
    answer: 'This app was created by your team using React Native and Expo.'
  },
];

export default function HelpScreen() {
  const bottomTabHeight = useBottomTabBarHeight();
  return (
    <ScrollView
  style={{ marginBottom: bottomTabHeight }}
  contentContainerStyle={{ padding: 16 }}
>
      <SafeAreaView style={{ flex: 1, gap: 24 }} edges={['top', 'left', 'right']}>
      <View style={{ width: '100%', paddingHorizontal: 48, alignItems: 'center', gap: 36 }}>
        <Image
          source={require('../../assets/images/mac.png')}
          style={{ height: 168 }}
          resizeMode="contain"
        />
      </View>
      {FAQS.map((faq, idx) => (
        <View key={idx} style={styles.qaContainer}>
          <ThemedText style={styles.question}>Q: {faq.question}</ThemedText>
          <ThemedText style={styles.answer}>A: {faq.answer}</ThemedText>
        </View>
      ))}
      </SafeAreaView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  qaContainer: {
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 8,
    padding: 14,
  },
  question: {
    fontSize: 16,
    fontWeight: '600',
  },
  answer: {
    fontSize: 15,
    color: '#555',
  },
});
