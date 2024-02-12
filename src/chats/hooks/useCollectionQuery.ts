
import {
  CollectionReference,
  DocumentData,
  Query,
  onSnapshot,
  QueryDocumentSnapshot,
} from "firebase/firestore";
import { useEffect, useState } from "react";

let cache: { [key: string]: any } = {};

export const useCollectionQuery: (
  key: string | undefined,
  collection: CollectionReference | Query<DocumentData> | undefined,
  limitCount: number,
  reversed?: boolean

) => { loading: boolean; 
  error: boolean; 
  data: QueryDocumentSnapshot<DocumentData>[] | null; 
  hasNextPage: boolean } = (
  key,
  collection,
  limitCount,
  reversed
) => {
  const [data, setData] = useState<QueryDocumentSnapshot<DocumentData>[] | null>(
    key ? (cache[key] || null) : null
  );

  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState(false)
  const [hasNextPage, setNextPage] = useState(true)

  useEffect(() => {
   
    if(!key || !collection || !limitCount) return
    const cached = cache[key] 
    setLoading(cached ? false : true)

    if(cached){
      setData(cache[key])
    }

    const unsubscribe = onSnapshot(
      collection, 
      (snapshot) => {  

        const docs = reversed ? snapshot.docs.reverse() : snapshot.docs

        setData(docs)
        setLoading(false)
        setError(false)

        const current = (snapshot.docs.length)
        const value = current >= (limitCount ?? 0)

        setNextPage(value);

        cache[key] = docs;

      },
      (err) => {
        console.log(err);
        setData(null);
        setLoading(false);
        setError(true);
      }
    );

    return () => {
      unsubscribe();
    };
    // eslint-disable-next-line 
  }, [key, limitCount])


  return { loading, error, data, hasNextPage};
};