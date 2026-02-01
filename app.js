import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import OnboardingScreen from './screens/OnboardingScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import HomeScreen from './screens/HomeScreen';

export default function App() {
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentScreen, setCurrentScreen] = useState('login');
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    checkAppState();
  }, []);

  const checkAppState = async () => {
    try {
      // Verificar si ya vio onboarding
      const hasSeenOnboarding = await AsyncStorage.getItem('hasSeenOnboarding');
      
      // Verificar si tiene token
      const savedToken = await AsyncStorage.getItem('userToken');

      // Si no ha visto onboarding, mostrarlo
      if (!hasSeenOnboarding) {
        setShowOnboarding(true);
        setCurrentScreen('onboarding');
      } else if (savedToken) {
        // Si tiene token y ya vio onboarding, ir a home
        setToken(savedToken);
        setCurrentScreen('home');
      } else {
        // Si no tiene token, ir a login
        setCurrentScreen('login');
      }
    } catch (error) {
      console.error('Error checking app state:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOnboardingComplete = async () => {
    try {
      await AsyncStorage.setItem('hasSeenOnboarding', 'true');
      setShowOnboarding(false);
      setCurrentScreen('register');
    } catch (error) {
      console.error('Error saving onboarding state:', error);
    }
  };

  const handleLoginSuccess = () => {
    setToken(true);
    setCurrentScreen('home');
  };

  const handleRegisterSuccess = () => {
    setCurrentScreen('login');
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      setToken(null);
      setCurrentScreen('login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  // Mostrar onboarding
  if (currentScreen === 'onboarding') {
    return (
      <OnboardingScreen
        navigation={{
          replace: (screen) => {
            if (screen === 'RegisterScreen') {
              handleOnboardingComplete();
            }
          }
        }}
      />
    );
  }

  // Mostrar home
  if (currentScreen === 'home') {
    return <HomeScreen onLogout={handleLogout} />;
  }

  // Mostrar registro
  if (currentScreen === 'register') {
    return (
      <RegisterScreen
        navigation={{
          goBack: () => setCurrentScreen('login'),
          replace: (screen) => {
            if (screen === 'LoginScreen') {
              setCurrentScreen('login');
            }
          }
        }}
        onSuccess={handleRegisterSuccess}
        onBack={() => setCurrentScreen('login')}
      />
    );
  }

  // Mostrar login
  return (
    <LoginScreen
      onSuccess={handleLoginSuccess}
      onRegister={() => setCurrentScreen('register')}
    />
  );
}