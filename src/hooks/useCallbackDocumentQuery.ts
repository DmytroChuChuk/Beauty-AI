import {
    DocumentData,
    DocumentSnapshot,
    onSnapshot,
    DocumentReference,
} from "firebase/firestore";
import { useCallback, useEffect, useState } from "react";
  
let cache : {[key: string] : DocumentSnapshot<DocumentData> | undefined}  = {}

export const useCallbackDocumentQuery: (
    key: string, 
    document: DocumentReference<DocumentData> | undefined
    ) => { 

    loading: boolean; 
    error: boolean; 
    data: DocumentSnapshot<DocumentData> | null;

    } = (
        key,
        document
    ) => {

    const [loading, setLoading] = useState(true)

    const [error, setError] = useState(false)
    const [data, setData] = useState<DocumentSnapshot<DocumentData> | null>(
        cache[key] || null
      );


    const fetch = useCallback(() => {
      if(!document) return

      const unsubscribe = onSnapshot(
        document,
        (snapshot) => {
          setData(snapshot);
          setLoading(false);
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
    }, [key]);
      
    useEffect(() => {

      fetch()
        // eslint-disable-next-line
    }, [key]);

    return { loading, error , data};
};
  