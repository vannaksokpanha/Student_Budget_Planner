import { createContext, useContext, useState } from 'react';

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(() => ({
    name: localStorage.getItem('userName') || 'there',
    token: localStorage.getItem('token') || null,
  }));

  const login = ({ name, token }) => {
    localStorage.setItem('userName', name);
    localStorage.setItem('token', token);
    setUser({ name, token });
  };
  
  const logout = () => {
    localStorage.clear();
    setUser({ name: 'there', token: null });
  };

  return (
    <UserContext.Provider value={{ user, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);