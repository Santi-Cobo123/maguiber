import * as yup from 'yup';

const passwordValidation = yup
  .string()
  .required('La contraseña es obligatoria')
  .min(8, 'Mínimo 8 caracteres')
  .matches(/[A-Z]/, 'Necesita mayúscula')
  .matches(/[a-z]/, 'Necesita minúscula')
  .matches(/[0-9]/, 'Necesita número')
  .matches(/[!@#$%^&*]/, 'Necesita símbolo (!@#$%^&*)');

const emailValidation = yup
  .string()
  .email('Email inválido')
  .required('Email requerido');

export const registrationSchema = yup.object().shape({
  firstName: yup
    .string()
    .required('Nombre requerido')
    .min(2, 'Mínimo 2 caracteres')
    .max(50, 'Máximo 50 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'Solo letras'),
  
  lastName: yup
    .string()
    .required('Apellido requerido')
    .min(2, 'Mínimo 2 caracteres')
    .max(50, 'Máximo 50 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'Solo letras'),
  
  email: emailValidation,
  password: passwordValidation,
  
  confirmPassword: yup
    .string()
    .required('Confirma contraseña')
    .oneOf([yup.ref('password'), null], 'No coincide'),
  
  acceptTerms: yup
    .boolean()
    .oneOf([true], 'Acepta términos'),
});

export const asyncEmailValidation = async (email) => {
  try {
    const response = await fetch('http://localhost:5000/api/auth/check-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (data.exists) {
      return { valid: false, error: 'Email ya registrado' };
    }

    return { valid: true };
  } catch (error) {
    console.error('Error:', error);
    return { valid: false, error: 'Error validando email' };
  }
};

export const validateField = async (fieldName, value, schema, asyncValidators = {}) => {
  try {
    await schema.validateAt(fieldName, { [fieldName]: value });
    
    if (asyncValidators[fieldName]) {
      const asyncResult = await asyncValidators[fieldName](value);
      if (!asyncResult.valid) {
        return { isValid: false, error: asyncResult.error };
      }
    }
    
    return { isValid: true, error: null };
  } catch (error) {
    return { isValid: false, error: error.message };
  }
};

export const validateForm = async (values, schema, asyncValidators = {}) => {
  try {
    await schema.validate(values, { abortEarly: false });
    
    const asyncErrors = {};
    
    for (const [fieldName, validator] of Object.entries(asyncValidators)) {
      if (values[fieldName]) {
        const result = await validator(values[fieldName]);
        if (!result.valid) {
          asyncErrors[fieldName] = result.error;
        }
      }
    }
    
    if (Object.keys(asyncErrors).length > 0) {
      return { isValid: false, errors: asyncErrors };
    }
    
    return { isValid: true, errors: {} };
  } catch (error) {
    const errors = {};
    if (error.inner) {
      error.inner.forEach(err => {
        errors[err.path] = err.message;
      });
    }
    return { isValid: false, errors };
  }
};

export const passwordStrengthRules = {
  minLength: {
    label: 'Mínimo 8 caracteres',
    test: (password) => password.length >= 8,
  },
  hasUpperCase: {
    label: 'Una mayúscula',
    test: (password) => /[A-Z]/.test(password),
  },
  hasLowerCase: {
    label: 'Una minúscula',
    test: (password) => /[a-z]/.test(password),
  },
  hasNumber: {
    label: 'Un número',
    test: (password) => /[0-9]/.test(password),
  },
  hasSpecialChar: {
    label: 'Un símbolo (!@#$%^&*)',
    test: (password) => /[!@#$%^&*]/.test(password),
  },
};

export const calculatePasswordStrength = (password) => {
  let strength = 0;
  Object.values(passwordStrengthRules).forEach(rule => {
    if (rule.test(password)) strength++;
  });
  return strength;
};