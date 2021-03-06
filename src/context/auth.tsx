import React, { createContext, useContext, useState } from 'react';
import faker from 'faker';

import {
  AuthContextData,
  AuthProviderProps,
  CurrentUserProps,
} from '../interfaces';
import { firebase, auth } from '../firebase';

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<CurrentUserProps>(() => {
    const userData = localStorage.getItem('wbuser');

    if (userData) {
      return JSON.parse(userData);
    }

    return {} as CurrentUserProps;
  });

  const signInWithGoogle = async () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    const userCredentials = await auth.signInWithPopup(provider);

    if (!userCredentials.user) {
      return;
    }

    const userData = userCredentials.user.providerData[0] as CurrentUserProps;

    localStorage.setItem('wbuser', JSON.stringify(userData));
    setUser(userData);
  };

  const signInAnonymous = async () => {
    const displayName = `guest${faker.datatype.number()}`;
    const anonymousUser: CurrentUserProps = {
      displayName,
      photoURL: `https://source.boringavatars.com/marble/152/${displayName}?colors=0B090C,2f80ed`,
      uid: faker.datatype.uuid(),
    };

    localStorage.setItem('wbuser', JSON.stringify(anonymousUser));
    auth.signInAnonymously();
    setUser(anonymousUser);
  };

  const signOut = () => {
    localStorage.removeItem('wbuser');
  };

  const authValue = {
    user,
    signInWithGoogle,
    signInAnonymous,
    signOut,
  };

  return (
    <AuthContext.Provider value={authValue}>{children}</AuthContext.Provider>
  );
};

const useAuth = () => useContext(AuthContext);

export { AuthProvider, useAuth };
