export function validation(values) {
  const errors = {};
  
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  // Email validation
  if (!values.email) {
    errors.email = "Email is required";
  } else if (!emailPattern.test(values.email)) {
    errors.email = "Email address is invalid";
  }
  
  if (!values.password) {
    errors.password = "Password is required";
  }
  
  return errors;
}