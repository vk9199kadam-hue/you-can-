import { auth, db } from '../firebase/config';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { collection, query, where, getDocs, setDoc, doc, getDoc } from 'firebase/firestore';

interface UserCredentials {
  email: string;
  password: string;
  role: 'student' | 'teacher' | 'head' | 'super_admin';
  academy_id: string;
}

class AuthService {
  async register(credentials: UserCredentials) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, credentials.email, credentials.password);
      const user = userCredential.user;

      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: credentials.email,
        role: credentials.role,
        academy_id: credentials.academy_id,
        created_at: new Date(),
        status: 'active'
      });

      return user;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  async login(email: string, password: string) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async getUserProfile(userId: string) {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      return userDoc.exists() ? userDoc.data() : null;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  }

  async logout() {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  async getAcademies() {
    try {
      const q = query(collection(db, 'academies'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error fetching academies:', error);
      throw error;
    }
  }

  async verifyAcademyAccess(userId: string, academy_id: string) {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      return userDoc.exists() ? userDoc.data().academy_id === academy_id : false;
    } catch (error) {
      console.error('Error verifying academy access:', error);
      throw error;
    }
  }
}

export default new AuthService();