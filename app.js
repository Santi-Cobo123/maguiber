import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import HomeScreen from './screens/HomeScreen';

export default function App() {
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentScreen, setCurrentScreen] = useState('login');

  useEffect(() => {
    checkToken();
  }, []);

  const checkToken = async () => {
    try {
      const savedToken = await AsyncStorage.getItem('userToken');
      if (savedToken) {
        setToken(savedToken);
        setCurrentScreen('home');
      } else {
        setCurrentScreen('login');
      }
    } catch (error) {
      console.error('Error checking token:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSuccess = () => {
    setToken(true);
    setCurrentScreen('home');
  };

  const handleRegisterSuccess = () => {
    setCurrentScreen('login');
  };

  const handleLogout = () => {
    setToken(null);
    setCurrentScreen('login');
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (currentScreen === 'home') {
    return <HomeScreen onLogout={handleLogout} />;
  }

  if (currentScreen === 'register') {
    return <RegisterScreen onSuccess={handleRegisterSuccess} onBack={() => setCurrentScreen('login')} />;
  }

  return <LoginScreen onSuccess={handleLoginSuccess} onRegister={() => setCurrentScreen('register')} />;
}