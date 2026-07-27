import { useAuthStore } from '../store/useAuthStore';

export const useAuth = () => {
  const { user, token, isAuthenticated, setAuth, clearAuth } = useAuthStore();

  const login = async (email: string, _password: string) => {
    // Mock Login Workflow
    // In a real app, you would call your API here (Axios + Zod)
    console.log(`Logging in with ${email}...`);

    // Simulate API delay
    await new Promise((resolve) => {
      setTimeout(resolve, 1000);
    });

    const mockUser = { id: '123', email, name: 'Draco User' };
    const mockToken = 'jwt-token-xyz';

    setAuth(mockUser, mockToken);
    return mockUser;
  };

  const logout = () => {
    clearAuth();
    console.log('User logged out');
  };

  return {
    user,
    token,
    isAuthenticated,
    login,
    logout,
  };
};
