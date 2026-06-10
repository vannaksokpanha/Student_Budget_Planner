export function signupValidation(values) {
  const errors = {};

  const name = (values.name ?? '').trim();
  const email = (values.email ?? '').trim();
  const password = values.password ?? '';
  const confirmPassword = values.confirmPassword ?? '';

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordPattern = /^.{6,}$/;

  if (!name) {
    errors.name = 'Name is required';
  } else if (name.length < 2) {
    errors.name = 'Name must be at least 2 characters';
  }

  if (!email) {
    errors.email = 'Email is required';
  } else if (!emailPattern.test(email)) {
    errors.email = 'Email address is invalid';
  }

  if (!password) {
    errors.password = 'Password is required';
  } else if (!passwordPattern.test(password)) {
    errors.password = 'Password must be at least 6 characters';
  }

  if (!confirmPassword) {
    errors.confirmPassword = 'Please confirm your password';
  } else if (password !== confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  return errors;
}
