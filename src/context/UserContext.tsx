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
}

const initialValue: UserContextType = {
  user: undefined,
  setUser: () => {},
};

export const UserContext = createContext<UserContextType>(initialValue);

export const UserContextProvider = ({ children }: ContextProps) => {
  const [user, setUser] = useState<UserData | undefined>(undefined);
  
  useEffect(() => {
      const UserJSON = localStorage.getItem("rede-social:user");
      if (UserJSON) {
        setUser(JSON.parse(UserJSON));
      }
   
  }, []); // O useEffect executa uma vez, após o componente ser montado

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};
