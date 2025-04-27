import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Image } from 'react-native';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
          },
          default: {},
        }),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Photo',
          tabBarIcon: ({ focused }) => (
            <Image
              source={require('../../assets/images/polaroid.png')}
              style={{
                height: 24,
                opacity: focused ? 1 : 0.7,
              }}
              resizeMode="contain"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="styles"
        options={{
          title: 'Styles',
          tabBarIcon: ({ focused }) => (
            <Image
              source={require('../../assets/images/brush.png')}
              style={{
                height: 24,
                opacity: focused ? 1 : 0.7,
              }}
              resizeMode="contain"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="help"
        options={{
          title: 'Help',
          tabBarIcon: ({ focused }) => (
            <Image
              source={require('../../assets/images/speech.png')}
              style={{
                height: 24,
                opacity: focused ? 1 : 0.7,
              }}
              resizeMode="contain"
            />
          ),
        }}
      />
    </Tabs>
  );
}

