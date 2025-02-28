import { useState } from 'react';
import { validateAuthForm } from '../utils/validation';

interface AuthFormState {
  email: string;
  password: string;
  name: string;
  profilePicture: string;
  otp: string;
  newPassword: string;
  [key: string]: string;
}

interface UseAuthFormReturn {
  formState: AuthFormState;
  errors: Record<string, string>;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  resetForm: () => void;
  validateForm: () => boolean;
}

const useAuthForm = (initialState: Partial<AuthFormState>): UseAuthFormReturn => {
  const [formState, setFormState] = useState<AuthFormState>({
    email: '',
    password: '',
    name: '',
    profilePicture: '',
    otp: '',
    newPassword: '',
    ...initialState
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const resetForm = () => {
    setFormState({
      email: '',
      password: '',
      name: '',
      profilePicture: '',
      otp: '',
      newPassword: ''
    });
    setErrors({});
  };

  const validateForm = () => {
    const validation = validateAuthForm(formState);
    // console.log('Validation:', validation);
    setErrors(validation.errors);
    return validation.isValid;
  };


  return {
    formState,
    errors,
    handleChange,
    resetForm,
    validateForm
  };
};

export default useAuthForm;
