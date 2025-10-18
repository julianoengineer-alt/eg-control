import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface User {
  id: string;
  nome: string;
  email: string;
  turno: string;
  perfil: string;
}

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verifica se há um usuário salvo no localStorage
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  async function login(email: string, password: string) {
    try {
      console.log('Tentando login com:', { email, password });
      
      // Busca o usuário na coleção 'usuarios'
      const usuariosRef = collection(db, 'usuarios');
      
      // Primeiro, busca apenas por email
      const emailQuery = query(usuariosRef, where('email', '==', email));
      const emailSnapshot = await getDocs(emailQuery);
      
      console.log('Usuários encontrados com este email:', emailSnapshot.size);
      
      if (emailSnapshot.empty) {
        throw new Error('Email não encontrado. Verifique se o usuário está cadastrado no Firestore.');
      }

      // Verifica a senha
      const userDoc = emailSnapshot.docs[0];
      const userData = userDoc.data();
      
      console.log('Dados do usuário encontrado:', {
        id: userDoc.id,
        email: userData.email,
        nome: userData.nome,
        turno: userData.turno,
        senhaCorreta: userData.senha === password
      });

      if (userData.senha !== password) {
        throw new Error('Senha incorreta');
      }
      
      const user: User = {
        id: userDoc.id,
        nome: userData.nome,
        email: userData.email,
        turno: userData.turno,
        perfil: userData.perfil || 'usuario',
      };

      setCurrentUser(user);
      localStorage.setItem('currentUser', JSON.stringify(user));
      
      console.log('Login bem-sucedido!');
    } catch (error: any) {
      console.error('Erro no login:', error);
      throw new Error(error.message || 'Erro ao fazer login');
    }
  }

  function logout() {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  }

  const value = {
    currentUser,
    login,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
