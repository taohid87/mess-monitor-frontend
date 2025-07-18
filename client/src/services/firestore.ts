import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  onSnapshot,
  serverTimestamp 
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { User, FundTransaction, Config, Fine } from "@/types";

// User operations
export const getUserByUid = async (uid: string): Promise<User | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    return userDoc.exists() ? userDoc.data() as User : null;
  } catch (error) {
    console.error('Error getting user:', error);
    throw error;
  }
};

export const createUserProfile = async (userData: Omit<User, 'id'>): Promise<User> => {
  try {
    await setDoc(doc(db, 'users', userData.uid), userData);
    return userData as User;
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
};

export const updateUserProfile = async (uid: string, updates: Partial<User>): Promise<void> => {
  try {
    await updateDoc(doc(db, 'users', uid), updates);
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

export const getBorders = async (): Promise<User[]> => {
  try {
    const q = query(collection(db, 'users'), where('role', '==', 'border'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as User);
  } catch (error) {
    console.error('Error getting borders:', error);
    throw error;
  }
};

// Fund operations
export const getFundTransactions = async (): Promise<FundTransaction[]> => {
  try {
    const q = query(collection(db, 'mess_funds'), orderBy('timestamp', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as FundTransaction));
  } catch (error) {
    console.error('Error getting fund transactions:', error);
    throw error;
  }
};

export const addFundTransaction = async (transaction: Omit<FundTransaction, 'id' | 'timestamp'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'mess_funds'), {
      ...transaction,
      timestamp: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding fund transaction:', error);
    throw error;
  }
};

export const updateFundTransaction = async (id: string, updates: Partial<FundTransaction>): Promise<void> => {
  try {
    await updateDoc(doc(db, 'mess_funds', id), updates);
  } catch (error) {
    console.error('Error updating fund transaction:', error);
    throw error;
  }
};

export const deleteFundTransaction = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'mess_funds', id));
  } catch (error) {
    console.error('Error deleting fund transaction:', error);
    throw error;
  }
};

// Config operations
export const getConfig = async (): Promise<Config | null> => {
  try {
    const configDoc = await getDoc(doc(db, 'config', 'secrets'));
    return configDoc.exists() ? configDoc.data() as Config : null;
  } catch (error) {
    console.error('Error getting config:', error);
    throw error;
  }
};

// Real-time listeners
export const listenToFundTransactions = (callback: (transactions: FundTransaction[]) => void) => {
  const q = query(collection(db, 'mess_funds'), orderBy('timestamp', 'desc'));
  return onSnapshot(q, (querySnapshot) => {
    const transactions = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as FundTransaction));
    callback(transactions);
  });
};

export const listenToBorders = (callback: (borders: User[]) => void) => {
  const q = query(collection(db, 'users'), where('role', '==', 'border'));
  return onSnapshot(q, (querySnapshot) => {
    const borders = querySnapshot.docs.map(doc => doc.data() as User);
    callback(borders);
  });
};
