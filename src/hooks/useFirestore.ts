import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp,
  orderBy,
  QueryConstraint
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';

export function useFirestore<T>(collectionPath: string, constraints: QueryConstraint[] = []) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, collectionPath),
      where('ownerId', '==', auth.currentUser.uid),
      ...constraints
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items: T[] = [];
      snapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() } as T);
      });
      setData(items);
      setLoading(false);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, collectionPath);
      setError(err.message);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [collectionPath, JSON.stringify(constraints)]);

  const add = async (item: Partial<T>) => {
    if (!auth.currentUser) return;
    try {
      await addDoc(collection(db, collectionPath), {
        ...item,
        ownerId: auth.currentUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, collectionPath);
      throw err;
    }
  };

  const update = async (id: string, item: Partial<T>) => {
    try {
      await updateDoc(doc(db, collectionPath, id), {
        ...item,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `${collectionPath}/${id}`);
      throw err;
    }
  };

  const remove = async (id: string) => {
    try {
      await deleteDoc(doc(db, collectionPath, id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `${collectionPath}/${id}`);
      throw err;
    }
  };

  return { data, loading, error, add, update, remove };
}
