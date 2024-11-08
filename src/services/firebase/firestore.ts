import { 
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { db } from './config';
import { ItineraryDay } from '../../types/itinerary';

export interface SavedItinerary {
  id: string;
  userId: string;
  name: string;
  description: string;
  destination: string;
  country: string;
  date: string;
  normalizedDate?: string;
  duration: string;
  days: ItineraryDay[];
  originalDays: ItineraryDay[];
  createdAt: number;
  updatedAt: number;
  metadata?: {
    recommendedSeasons?: string[];
    timeZone?: string;
    currency?: string;
    languages?: string[];
  };
}

export async function getUserItineraries(userId: string): Promise<SavedItinerary[]> {
  if (!db) throw new Error('Firestore not initialized');
  if (!userId) throw new Error('User ID is required');
  
  console.log('Fetching itineraries for user:', userId);
  
  const itinerariesRef = collection(db, 'itineraries');
  const q = query(
    itinerariesRef,
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  
  try {
    const querySnapshot = await getDocs(q);
    const itineraries = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        createdAt: data.createdAt || Date.now(),
        updatedAt: data.updatedAt || Date.now()
      } as SavedItinerary;
    });

    console.log('Fetched itineraries:', itineraries);
    return itineraries;
  } catch (error) {
    console.error('Error fetching user itineraries:', error);
    throw error;
  }
}

export async function getItinerary(id: string): Promise<SavedItinerary | null> {
  if (!db) throw new Error('Firestore not initialized');
  
  const docRef = doc(db, 'itineraries', id);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    const data = docSnap.data();
    return {
      ...data,
      id: docSnap.id,
      createdAt: data.createdAt || Date.now(),
      updatedAt: data.updatedAt || Date.now()
    } as SavedItinerary;
  }
  return null;
}

export async function saveNewItinerary(
  userId: string,
  name: string,
  description: string,
  destination: string,
  country: string,
  date: string,
  normalizedDate: string,
  duration: string,
  days: ItineraryDay[],
  metadata?: SavedItinerary['metadata']
): Promise<string> {
  if (!db) throw new Error('Firestore not initialized');
  
  const itinerariesRef = collection(db, 'itineraries');
  const newItineraryRef = doc(itinerariesRef);
  const now = Date.now();
  
  const itinerary: SavedItinerary = {
    id: newItineraryRef.id,
    userId,
    name,
    description,
    destination,
    country,
    date,
    normalizedDate,
    duration,
    days,
    originalDays: [...days],
    createdAt: now,
    updatedAt: now,
    metadata
  };

  await setDoc(newItineraryRef, itinerary);
  return newItineraryRef.id;
}

export async function updateItinerary(
  id: string,
  updates: Partial<SavedItinerary>
): Promise<void> {
  if (!db) throw new Error('Firestore not initialized');
  
  const docRef = doc(db, 'itineraries', id);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: Date.now()
  });
}

export async function deleteItinerary(id: string, userId: string): Promise<void> {
  if (!db) throw new Error('Firestore not initialized');
  
  const docRef = doc(db, 'itineraries', id);
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) {
    throw new Error('Itinerary not found');
  }
  
  const itinerary = docSnap.data() as SavedItinerary;
  if (itinerary.userId !== userId) {
    throw new Error('Unauthorized');
  }
  
  await deleteDoc(docRef);
}