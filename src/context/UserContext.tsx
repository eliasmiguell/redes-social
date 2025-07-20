import { createContext, useState, useEffect } from 'react';
// interface ContextProps {
//   children: React.ReactNode;
// }

// interface User {
//     id: number;
//     email: string;
//     username: string;
//     userimg: string;
//     bgimg: string;
// }

// const initialValue = {
//   user: undefined,
//   setUser: () => {},
// };
// interface UserContextType {
//   user: User | undefined;
//   setUser: (user: User | undefined) => void;
// }

// export const UserContext = createContext<UserContextType>(initialValue);

// export const UserContextProvider = ({ children }: ContextProps) => {
//   const [user, setUser] = useState<User | undefined>(undefined);
  
//   useEffect(() => {
//       const UserJSON = localStorage.getItem("rede-social:user");
//       if (UserJSON) {
//         setUser(JSON.parse(UserJSON));
//       }
   
//   }, []); // O useEffect executa uma vez, após o componente ser montado

//   return (
//     <UserContext.Provider value={{ user, setUser }}>
//       {children}
//     </UserContext.Provider>
//   );
// };

interface ContextProps {
  children: React.ReactNode;
}

interface UserData {
  id: number;
  email: string;
  username: string;
  userimg: string;
  bgimg: string;
}

interface UserContextType {
  user: UserData | undefined;
  setUser: (newState: UserData | undefined) => void;
  isInitialized: boolean;
}

const initialValue: UserContextType = {
  user: undefined,
  setUser: () => {},
  isInitialized: false,
};

export const UserContext = createContext<UserContextType>(initialValue);

export const UserContextProvider = ({ children }: ContextProps) => {
  const [user, setUser] = useState<UserData | undefined>(undefined);
  const [isInitialized, setIsInitialized] = useState(false);
  
  useEffect(() => {
    const UserJSON = localStorage.getItem("rede-social:user");
    if (UserJSON) {
      try {
        const userData = JSON.parse(UserJSON);
        setUser(userData);
      } catch (error) {
        console.error('Erro ao parsear dados do usuário:', error);
        localStorage.removeItem("rede-social:user");
      }
    }
    setIsInitialized(true);
  }, []); // O useEffect executa uma vez, após o componente ser montado

  const setUserWithStorage = (newUser: UserData | undefined) => {
    if (newUser) {
      localStorage.setItem("rede-social:user", JSON.stringify(newUser));
    } else {
      localStorage.removeItem("rede-social:user");
    }
    setUser(newUser);
  };

  return (
    <UserContext.Provider value={{ user, setUser: setUserWithStorage, isInitialized }}>
      {children}
    </UserContext.Provider>
  );
};
