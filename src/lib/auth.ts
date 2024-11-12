import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  User
} from 'firebase/auth';
import { auth } from './firebase';
import { doc, setDoc } from 'firebase/firestore';
import { db } from './firebase';

export interface SignUpData {
  email: string;
  password: string;
  nickname: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export const signUp = async ({ email, password, nickname }: SignUpData) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  
  // Update user profile with nickname
  await updateProfile(user, {
    displayName: nickname
  });

  // Create user document in Firestore
  await setDoc(doc(db, 'users', user.uid), {
    email,
    nickname,
    createdAt: new Date(),
  });

  return user;
};

export const signIn = async ({ email, password }: SignInData) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

export const signOut = () => firebaseSignOut(auth);