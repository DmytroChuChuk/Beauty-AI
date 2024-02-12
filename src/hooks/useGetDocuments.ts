import {
    DocumentData,
    getDocs,
    CollectionReference,
    query,
    QueryConstraint,
    orderBy,
    where,
    Timestamp,
    limit,
    QueryDocumentSnapshot,
} from "firebase/firestore";
import { useEffect, useState } from "react";
// QueryDocumentSnapshot<DocumentData>[]
let cache : {[key: string] : QueryDocumentSnapshot<DocumentData>[] | undefined}  = {}

export const useGetDocuments: (
        key: string, 
        collection: CollectionReference,
        queryConstraint?: QueryConstraint[],
        getMoreDocumentFromKey?: string,
        limitCount?: number,

    ) => { 
        loading: boolean; 
        error: boolean; 
        data: QueryDocumentSnapshot<DocumentData>[] | null;
        hasNextPage: boolean;
    } = (
        key,
        collection,
        queryConstraint = [],
        getMoreDocumentFromKey,
        limitCount,
    
    ) => {

    const [loading, setLoading] = useState(true)
    const [hasNextPage, setNextPage] = useState(true)
    const [error, setError] = useState(false)
    const [data, setData] = useState<QueryDocumentSnapshot<DocumentData>[]>(cache[key] || []);
      
    useEffect(() => {
        if(!collection || !limitCount) {
            return
        }
        
        let constraint: QueryConstraint[] = queryConstraint
        
        if(getMoreDocumentFromKey && limitCount){
            const lastNumberOfDocument = data?.length ?? 0

            if(lastNumberOfDocument > 0){
                const lastTimestamp = (data?.[lastNumberOfDocument -1].get(getMoreDocumentFromKey) as Timestamp) ?? Timestamp.now() 
                queryConstraint.push(where(getMoreDocumentFromKey, "<", lastTimestamp))
            }
            queryConstraint.push(orderBy(getMoreDocumentFromKey, "desc"))
        }

        queryConstraint.push(limit(limitCount))

        setLoading(true)
        getDocs(query(collection, ...constraint)).then((snapshot) => {
            setLoading(false)
            setError(false)

            const docs = snapshot.docs
            const current = docs.length
            const value = current >= (limitCount ?? 0)
    
            setNextPage(value)
            const merge = data.concat(docs) ?? []
            setData(merge)

        }).catch((error) => {
            console.log(error)
            setError(true)
            setLoading(false)
        })
     
        // eslint-disable-next-line
    }, [key, limitCount]);

    return { loading, error , data, hasNextPage};
};
  