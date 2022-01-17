import React from 'react';

import { useFonts, DMSans_400Regular } from '@expo-google-fonts/dm-sans';
import { DMSerifDisplay_400Regular } from '@expo-google-fonts/dm-serif-display';
import { SignIn } from '@screens/SignIn';
import AppLoading from 'expo-app-loading';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider } from 'styled-components/native';

import { AuthProvider } from './src/hooks/auth';
import theme from './src/theme';

export default function App() {
  const [fonstLoaded] = useFonts({
    DMSans_400Regular,
    DMSerifDisplay_400Regular,
  });

  if (!fonstLoaded) {
    return <AppLoading />;
  }

  return (
    <ThemeProvider theme={theme}>
      <StatusBar style="light" translucent backgroundColor="transparent" />

      <AuthProvider>
        <SignIn />
      </AuthProvider>
    </ThemeProvider>
  );
}
