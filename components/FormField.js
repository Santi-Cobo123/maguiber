import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export const FormField = React.forwardRef((
  {
    label,
    placeholder,
    value,
    onChange,
    onBlur,
    error,
    isValidating,
    isTouched,
    isValid,
    icon,
    secureTextEntry = false,
    keyboardType = 'default',
    autoCapitalize = 'sentences',
    textContentType,
    required = false,
  },
  ref
) => {
  const [showPassword, setShowPassword] = useState(!secureTextEntry);

  const getStatusIcon = () => {
    if (isValidating) {
      return <ActivityIndicator size="small" color="#6366f1" />;
    }
    if (isTouched) {
      if (error) {
        return <MaterialCommunityIcons name="alert-circle" size={20} color="#ef4444" />;
      }
      if (isValid) {
        return <MaterialCommunityIcons name="check-circle" size={20} color="#10b981" />;
      }
    }
    return null;
  };

  return (
    <View style={styles.container}>
      <View style={styles.labelContainer}>
        <Text style={[styles.label, error && isTouched && styles.labelError]}>
          {label}
        </Text>
        {required && <Text style={styles.requiredIndicator}>*</Text>}
      </View>

      <View style={[
        styles.inputWrapper,
        error && isTouched && styles.inputWrapperError,
        isValid && isTouched && styles.inputWrapperValid,
      ]}>
        {icon && (
          <MaterialCommunityIcons
            name={icon}
            size={20}
            color={error && isTouched ? '#ef4444' : '#9ca3af'}
            style={styles.leftIcon}
          />
        )}

        <TextInput
          ref={ref}
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#d1d5db"
          value={value}
          onChangeText={onChange}
          onBlur={onBlur}
          secureTextEntry={secureTextEntry && !showPassword}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          textContentType={textContentType}
          editable={!isValidating}
        />

        {secureTextEntry && (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.passwordToggle}
          >
            <MaterialCommunityIcons
              name={showPassword ? 'eye-off' : 'eye'}
              size={20}
              color="#9ca3af"
            />
          </TouchableOpacity>
        )}

        {getStatusIcon() && (
          <View style={styles.statusIcon}>
            {getStatusIcon()}
          </View>
        )}
      </View>

      {error && isTouched && (
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons name="alert-circle" size={14} color="#ef4444" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
});

FormField.displayName = 'FormField';

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  labelError: {
    color: '#ef4444',
  },
  requiredIndicator: {
    color: '#ef4444',
    marginLeft: 4,
    fontSize: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: '#ffffff',
    height: 48,
  },
  inputWrapperError: {
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2',
  },
  inputWrapperValid: {
    borderColor: '#10b981',
    backgroundColor: '#f0fdf4',
  },
  leftIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    padding: 0,
  },
  passwordToggle: {
    padding: 8,
  },
  statusIcon: {
    marginLeft: 8,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    paddingHorizontal: 4,
  },
  errorText: {
    fontSize: 12,
    color: '#ef4444',
    marginLeft: 6,
    fontWeight: '500',
  },
});