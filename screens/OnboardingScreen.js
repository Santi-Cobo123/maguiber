import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  FlatList,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function OnboardingScreen({ navigation }) {
  const [currentStep, setCurrentStep] = useState(0);

  const onboardingSteps = [
    {
      id: 1,
      title: 'Bienvenido a Maguiber',
      backgroundColor: '#6366f1',
      content: (
        <View style={styles.stepContent}>
          <Text style={[styles.stepTitle, { color: '#ffffff' }]}>🎯 Bienvenido</Text>
          <Text style={[styles.stepDescription, { color: '#ffffff' }]}>
            Tu solución integral para gestionar servicios y clientes.
          </Text>
        </View>
      ),
    },
    {
      id: 2,
      title: 'Características',
      backgroundColor: '#8b5cf6',
      content: (
        <View style={styles.stepContent}>
          <FlatList
            scrollEnabled={false}
            data={[
              { icon: 'briefcase', title: 'Servicios', desc: 'Gestiona fácilmente' },
              { icon: 'account-multiple', title: 'Clientes', desc: 'Organiza contactos' },
              { icon: 'calendar', title: 'Calendario', desc: 'Agenda citas' },
              { icon: 'chart-line', title: 'Reportes', desc: 'Analiza datos' },
            ]}
            renderItem={({ item }) => (
              <View style={styles.benefitItem}>
                <MaterialCommunityIcons name={item.icon} size={24} color="#ffffff" />
                <View style={styles.benefitTextBox}>
                  <Text style={styles.benefitTitle}>{item.title}</Text>
                  <Text style={styles.benefitDesc}>{item.desc}</Text>
                </View>
              </View>
            )}
            keyExtractor={(item) => item.icon}
          />
        </View>
      ),
    },
    {
      id: 3,
      title: 'Permisos',
      backgroundColor: '#ec4899',
      content: (
        <View style={styles.stepContent}>
          <FlatList
            scrollEnabled={false}
            data={[
              { icon: 'bell', title: 'Notificaciones', req: true },
              { icon: 'map-marker', title: 'Ubicación', req: false },
              { icon: 'camera', title: 'Cámara', req: false },
            ]}
            renderItem={({ item }) => (
              <View style={styles.permissionItem}>
                <MaterialCommunityIcons name={item.icon} size={24} color="#ffffff" />
                <Text style={styles.permissionTitle}>{item.title}</Text>
                {item.req && <Text style={styles.requiredBadge}>Req.</Text>}
              </View>
            )}
            keyExtractor={(item) => item.icon}
          />
        </View>
      ),
    },
    {
      id: 4,
      title: 'Listo',
      backgroundColor: '#06b6d4',
      content: (
        <View style={styles.stepContent}>
          <Text style={[styles.stepTitle, { color: '#ffffff' }]}>🎉 ¡Listo!</Text>
          <Text style={[styles.stepDescription, { color: '#ffffff' }]}>
            Crea tu cuenta y comienza ahora mismo.
          </Text>
        </View>
      ),
    },
  ];

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      navigation.replace('RegisterScreen');
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    navigation.replace('RegisterScreen');
  };

  const step = onboardingSteps[currentStep];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: step.backgroundColor }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
          <Text style={styles.skipText}>Saltar</Text>
        </TouchableOpacity>

        <View style={styles.indicatorsContainer}>
          {onboardingSteps.map((_, index) => (
            <View
              key={index}
              style={[
                styles.indicator,
                index === currentStep && styles.indicatorActive,
              ]}
            />
          ))}
        </View>
      </View>

      <ScrollView style={styles.content} scrollEnabled={false} showsVerticalScrollIndicator={false}>
        {step.content}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          onPress={handlePrevious}
          disabled={currentStep === 0}
          style={[styles.button, styles.previousButton, currentStep === 0 && styles.buttonDisabled]}
        >
          <Ionicons
            name="arrow-back"
            size={20}
            color={currentStep === 0 ? '#ccc' : '#ffffff'}
          />
          <Text style={[styles.buttonText, currentStep === 0 && styles.buttonTextDisabled]}>
            Atrás
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleNext}
          style={[styles.button, styles.nextButton]}
        >
          <Text style={styles.buttonText}>
            {currentStep === onboardingSteps.length - 1 ? 'Comenzar' : 'Siguiente'}
          </Text>
          <Ionicons name="arrow-forward" size={20} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  skipButton: {
    padding: 8,
  },
  skipText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  indicatorsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  indicatorActive: {
    backgroundColor: '#ffffff',
    width: 24,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  stepContent: {
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: height * 0.5,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  stepDescription: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  benefitItem: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  benefitTextBox: {
    flex: 1,
    marginLeft: 12,
  },
  benefitTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 2,
  },
  benefitDesc: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  permissionItem: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  permissionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    flex: 1,
    marginLeft: 12,
  },
  requiredBadge: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 12,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  previousButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  nextButton: {
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonTextDisabled: {
    color: '#ccc',
  },
});