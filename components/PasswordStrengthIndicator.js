import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { passwordStrengthRules } from '../validation-schema';

export const PasswordStrengthIndicator = ({ password }) => {
  const getRules = () => {
    return Object.entries(passwordStrengthRules).map(([key, rule]) => ({
      id: key,
      label: rule.label,
      isMet: rule.test(password),
    }));
  };

  const rules = getRules();
  const strength = rules.filter(r => r.isMet).length;

  const getStrengthLevel = () => {
    if (strength === 0) return { level: 'Muy débil', color: '#ef4444' };
    if (strength <= 1) return { level: 'Débil', color: '#f97316' };
    if (strength <= 2) return { level: 'Aceptable', color: '#eab308' };
    if (strength <= 3) return { level: 'Buena', color: '#84cc16' };
    return { level: 'Excelente', color: '#10b981' };
  };

  const strengthInfo = getStrengthLevel();

  return (
    <View style={styles.container}>
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${(strength / 5) * 100}%`,
                backgroundColor: strengthInfo.color,
              },
            ]}
          />
        </View>
        <Text style={[styles.strengthText, { color: strengthInfo.color }]}>
          {strengthInfo.level}
        </Text>
      </View>

      <FlatList
        scrollEnabled={false}
        data={rules}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.ruleItem}>
            <View style={[styles.ruleCheck, item.isMet && styles.ruleCheckMet]}>
              <MaterialCommunityIcons
                name={item.isMet ? 'check' : 'close'}
                size={14}
                color={item.isMet ? '#10b981' : '#d1d5db'}
              />
            </View>
            <Text style={[styles.ruleLabel, item.isMet && styles.ruleLabelMet]}>
              {item.label}
            </Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  strengthText: {
    fontSize: 12,
    fontWeight: '600',
    minWidth: 70,
    textAlign: 'center',
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  ruleCheck: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#d1d5db',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  ruleCheckMet: {
    borderColor: '#10b981',
    backgroundColor: '#ecfdf5',
  },
  ruleLabel: {
    fontSize: 12,
    color: '#9ca3af',
  },
  ruleLabelMet: {
    color: '#374151',
    fontWeight: '500',
  },
});