import { useState, useCallback, useRef } from 'react';
import { validateField, validateForm } from '../validation-schema';

export const useFormValidation = (initialValues, schema, asyncValidators = {}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isValidating, setIsValidating] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const debounceTimers = useRef({});

  const handleChange = useCallback((fieldName, value) => {
    setValues(prev => ({ ...prev, [fieldName]: value }));
    if (errors[fieldName]) {
      setErrors(prev => ({ ...prev, [fieldName]: null }));
    }
  }, [errors]);

  const handleBlur = useCallback(
    async (fieldName) => {
      setTouched(prev => ({ ...prev, [fieldName]: true }));

      if (debounceTimers.current[fieldName]) {
        clearTimeout(debounceTimers.current[fieldName]);
      }

      debounceTimers.current[fieldName] = setTimeout(async () => {
        setIsValidating(prev => ({ ...prev, [fieldName]: true }));

        try {
          const result = await validateField(
            fieldName,
            values[fieldName],
            schema,
            asyncValidators
          );

          setErrors(prev => ({ ...prev, [fieldName]: result.error }));
        } catch (error) {
          console.error(`Error validando ${fieldName}:`, error);
        } finally {
          setIsValidating(prev => ({ ...prev, [fieldName]: false }));
        }
      }, 500);
    },
    [values, schema, asyncValidators]
  );

  const validateFormComplete = useCallback(async () => {
    setIsSubmitting(true);

    try {
      const result = await validateForm(values, schema, asyncValidators);

      setErrors(result.errors);
      setTouched(
        Object.keys(values).reduce((acc, key) => {
          acc[key] = true;
          return acc;
        }, {})
      );

      return result.isValid;
    } catch (error) {
      console.error('Error validando:', error);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [values, schema, asyncValidators]);

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsValidating({});
  }, [initialValues]);

  const setFieldValue = useCallback((fieldName, value) => {
    setValues(prev => ({ ...prev, [fieldName]: value }));
  }, []);

  const setFieldError = useCallback((fieldName, error) => {
    setErrors(prev => ({ ...prev, [fieldName]: error }));
  }, []);

  const getFieldProps = useCallback((fieldName) => {
    return {
      value: values[fieldName] || '',
      error: touched[fieldName] ? errors[fieldName] : null,
      isTouched: touched[fieldName],
      isValidating: isValidating[fieldName],
      isValid: touched[fieldName] && !errors[fieldName] && !isValidating[fieldName],
      onChange: (value) => handleChange(fieldName, value),
      onBlur: () => handleBlur(fieldName),
    };
  }, [values, errors, touched, isValidating, handleChange, handleBlur]);

  return {
    values,
    errors,
    touched,
    isValidating,
    isSubmitting,
    handleChange,
    handleBlur,
    setFieldValue,
    setFieldError,
    resetForm,
    validateFormComplete,
    getFieldProps,
  };
};