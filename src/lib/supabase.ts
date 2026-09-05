import { collection, getDocs, doc, updateDoc, deleteDoc, query as fsQuery, where, writeBatch } from "firebase/firestore";
import { db } from "./firebase";

// Re-export db for backwards compatibility if needed
export { db };

// Supabase Adapter to Firestore with Batch Write Optimization
export const supabase = {
  from: (tableName: string) => {
    return {
      select: async (_fields: string = '*'): Promise<{ data: any[] | null; error: any }> => {
        try {
          const snapshot = await getDocs(collection(db, tableName));
          const data = snapshot.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
          return { data, error: null };
        } catch (error) {
          return { data: null, error };
        }
      },
      upsert: async (payload: any | any[], _options?: any) => {
        try {
          const items = Array.isArray(payload) ? payload : [payload];
          if (items.length === 0) return { error: null };

          // Chunk in batches of 450 (Firestore limit is 500)
          const CHUNK_SIZE = 450;
          for (let i = 0; i < items.length; i += CHUNK_SIZE) {
            const batch = writeBatch(db);
            const chunk = items.slice(i, i + CHUNK_SIZE);
            for (const item of chunk) {
              const docId = String(item.id || crypto.randomUUID());
              const docRef = doc(db, tableName, docId);
              batch.set(docRef, item, { merge: true });
            }
            await batch.commit();
          }
          return { error: null };
        } catch (error) {
          console.error(`Error in upsert for ${tableName}:`, error);
          return { error };
        }
      },
      insert: async (payload: any | any[]) => {
        try {
          const items = Array.isArray(payload) ? payload : [payload];
          if (items.length === 0) return { error: null };

          const CHUNK_SIZE = 450;
          for (let i = 0; i < items.length; i += CHUNK_SIZE) {
            const batch = writeBatch(db);
            const chunk = items.slice(i, i + CHUNK_SIZE);
            for (const item of chunk) {
              const docId = String(item.id || crypto.randomUUID());
              const docRef = doc(db, tableName, docId);
              batch.set(docRef, item);
            }
            await batch.commit();
          }
          return { error: null };
        } catch (error) {
          console.error(`Error in insert for ${tableName}:`, error);
          return { error };
        }
      },
      update: (payload: any) => {
        const executeUpdate = async (field: string, value: any, op: '==' | 'in' | 'array-contains-any' = '==') => {
          try {
            if (field === 'id' && op === '==') {
              const docRef = doc(db, tableName, String(value));
              await updateDoc(docRef, payload);
            } else if (field === 'id' && op === 'in') {
              const batch = writeBatch(db);
              for (const id of value) {
                const docRef = doc(db, tableName, String(id));
                batch.update(docRef, payload);
              }
              await batch.commit();
            } else {
              const q = fsQuery(collection(db, tableName), where(field, op, value));
              const snapshot = await getDocs(q);
              const batch = writeBatch(db);
              for (const d of snapshot.docs) {
                batch.update(d.ref, payload);
              }
              await batch.commit();
            }
            return { error: null };
          } catch (error) {
            console.error(`Error in update for ${tableName}:`, error);
            return { error };
          }
        };

        const chain = {
          eq: (field: string, value: any) => executeUpdate(field, value, '=='),
          in: (field: string, values: any[]) => executeUpdate(field, values, 'in'),
          ilike: (field: string, value: any) => {
            const ret = executeUpdate(field, value, '==');
            return Object.assign(ret, chain);
          },
          contains: (field: string, value: any) => {
            const ret = executeUpdate(field, value, 'array-contains-any');
            return Object.assign(ret, chain);
          }
        };
        return chain;
      },
      delete: () => {
        const executeDelete = async (field: string, value: any, op: '==' | 'in' = '==') => {
          try {
            if (field === 'id' && op === '==') {
              await deleteDoc(doc(db, tableName, String(value)));
            } else if (field === 'id' && op === 'in') {
              const batch = writeBatch(db);
              for (const id of value) {
                const docRef = doc(db, tableName, String(id));
                batch.delete(docRef);
              }
              await batch.commit();
            }
            return { error: null };
          } catch (error) {
            console.error(`Error in delete for ${tableName}:`, error);
            return { error };
          }
        };

        return {
          eq: (field: string, value: any) => executeDelete(field, value, '=='),
          in: (field: string, values: any[]) => executeDelete(field, values, 'in')
        };
      }
    };
  }
};
