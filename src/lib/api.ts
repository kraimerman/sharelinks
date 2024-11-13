import { db } from './firebase';
import { collection, addDoc, getDocs, doc, updateDoc, arrayUnion, Timestamp, query, orderBy } from 'firebase/firestore';

export interface Link {
  id: string;
  title: string;
  url: string;
  description: string;
  author: string;
  timestamp: Date;
  upvotes: number;
  downvotes: number;
  comments: Comment[];
}

export interface Comment {
  id: string;
  text: string;
  author: string;
  timestamp: Date;
}

export const fetchLinks = async (): Promise<Link[]> => {
  const q = query(collection(db, 'links'), orderBy('timestamp', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    timestamp: doc.data().timestamp.toDate(),
    comments: doc.data().comments.map((comment: any) => ({
      ...comment,
      timestamp: comment.timestamp.toDate()
    }))
  })) as Link[];
};

export const addLink = async (link: Omit<Link, 'id' | 'upvotes' | 'downvotes' | 'comments' | 'timestamp'>): Promise<string> => {
  const docRef = await addDoc(collection(db, 'links'), {
    ...link,
    upvotes: 0,
    downvotes: 0,
    comments: [],
    timestamp: Timestamp.now()
  });
  return docRef.id;
};

export const updateLink = async (linkId: string, updates: { title?: string; url?: string; description?: string }): Promise<void> => {
  const linkRef = doc(db, 'links', linkId);
  await updateDoc(linkRef, updates);
};

export const updateVotes = async (linkId: string, type: 'upvote' | 'downvote', newValue: number): Promise<void> => {
  const linkRef = doc(db, 'links', linkId);
  await updateDoc(linkRef, {
    [type === 'upvote' ? 'upvotes' : 'downvotes']: newValue
  });
};

export const addComment = async (linkId: string, comment: Omit<Comment, 'id' | 'timestamp'>): Promise<void> => {
  const linkRef = doc(db, 'links', linkId);
  await updateDoc(linkRef, {
    comments: arrayUnion({
      id: Date.now().toString(),
      ...comment,
      timestamp: Timestamp.now()
    })
  });
};