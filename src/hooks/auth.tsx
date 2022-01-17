import React, {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { Alert } from 'react-native';

type User = {
  id: string;
  name: string;
  isAdmin: boolean;
};

type AuthContextData = {
  signIn: (email: string, password: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  isLogging: boolean;
  user: User | null;
};

type AuthProviderProps = {
  children: ReactNode;
};

const USER_COLLECTION = '@gopizza:users';

export const AuthContext = createContext({} as AuthContextData);

function AuthProvider({ children }: AuthProviderProps) {
  const [isLogging, setIsLogging] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  async function signIn(email: string, password: string) {
    if (!email || !password) {
      return Alert.alert('Login', 'Informe o e-mail e a senha.');
    }

    setIsLogging(true);

    try {
      const account = await auth().signInWithEmailAndPassword(email, password);

      try {
        const profile = await firestore()
          .collection('users')
          .doc(account.user.uid)
          .get();

        const { name, isAdmin } = profile.data() as User;

        if (profile.exists) {
          const userData = {
            id: account.user.uid,
            name,
            isAdmin,
          };

          await AsyncStorage.setItem(USER_COLLECTION, JSON.stringify(userData));
          setUser(userData);
        }
      } catch (error) {
        Alert.alert(
          'Login',
          'Não foi possível buscar os dados de perfil do usuario',
        );
      }
    } catch (error) {
      if (
        error?.code === 'auth/user-not-found' ||
        error?.code === 'auth/wrong-password'
      ) {
        return Alert.alert('Login', 'E-mail e/ou senha inválida.');
      }
      return Alert.alert('Login', 'Não foi possível realizar o login.');
    } finally {
      setIsLogging(false);
    }
  }

  async function loadUserStorageDate() {
    setIsLogging(true);

    const storedUser = await AsyncStorage.getItem(USER_COLLECTION);

    if (storedUser) {
      const userData = JSON.parse(storedUser) as User;
      setUser(userData);
    }

    setIsLogging(false);
  }

  async function signOut() {
    await auth().signOut();
    await AsyncStorage.removeItem(USER_COLLECTION);
    setUser(null);
  }

  async function forgotPassword(email: string) {
    if (!email) {
      return Alert.alert('Redefinir senha', 'Informe o e-mail.');
    }

    try {
      await auth().sendPasswordResetEmail(email);
      Alert.alert(
        'Redefinir senha',
        'Enviamos um link no seu e-mail para redefinir sua senha.',
      );
    } catch (error) {
      Alert.alert(
        'Redefinir senha',
        'Não foi possível enviar o e-mail para redefinir a senha',
      );
    }
  }

  useEffect(() => {
    loadUserStorageDate();
  }, []);

  return (
    <AuthContext.Provider
      // eslint-disable-next-line react/jsx-no-constructed-context-values
      value={{
        signIn,
        isLogging,
        user,
        signOut,
        forgotPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  const context = useContext(AuthContext);

  return context;
}

export { AuthProvider, useAuth };
