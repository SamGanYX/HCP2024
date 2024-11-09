// src/context/auth-context.tsx
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";

// Define types for the context
interface AuthContextType {
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
  token: string | null;
}

// Create the AuthContext with default values
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create a provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [token, setToken] = useState<string | null>(null);

  // Check if there's a token in localStorage when the app starts
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setIsAuthenticated(true);
      setToken(storedToken);
    }
  }, []);

  // Function to login (save token)
  const login = (newToken: string) => {
    setIsAuthenticated(true);
    setToken(newToken);
    localStorage.setItem("token", newToken); // Save the token in localStorage
  };

  // Function to logout (clear token)
  const logout = () => {
    setIsAuthenticated(false);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("userID");
    localStorage.removeItem("goal");
    window.location.href = "/";
  };

  // Provide authentication state and functions to children
  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, token }}>
      {children}
    </AuthContext.Provider>
  );
};

// Create a hook to use the AuthContext in components
export const useAuth = () => {
  const context = useContext(AuthContext);
  // console.log(context);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
