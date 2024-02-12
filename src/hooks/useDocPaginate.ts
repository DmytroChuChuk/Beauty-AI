import {
    collection,
    DocumentData,
    DocumentSnapshot,
    getDocs,
    limit,
    orderBy,
    query,
    QueryConstraint,
    QueryDocumentSnapshot,
    Timestamp,
    where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { time_stamp } from "../keys/firestorekeys";
import { db } from "../store/firebase";
  
  
let cache : {[key: string] : QueryDocumentSnapshot<DocumentData>[] | undefined}  = {}

export const useDocPaginate: (
    key: string,
    lastTimestamp: Timestamp | undefined,
    path: string,
    queryConstraints: QueryConstraint[],
    limitCount?: number
    ) => { 
    loading: boolean
    error: boolean
    hasNextPage: boolean
    data: DocumentSnapshot<DocumentData>[] | undefined
    } = (
    key,
    lastTimestamp,
    path,
    queryConstraints,
    limitCount = 10,

    ) => {

    const [loading, setLoading] = useState(true)
    const [hasNextPage, setNextPage] = useState(true)
    const [error, setError] = useState(false)
    const [data, setData] = useState< QueryDocumentSnapshot<DocumentData>[]>( key ? cache?.[key] ?? [] : [])

    useEffect(() => {

        if(!hasNextPage){
            return
        }

        let constraints: QueryConstraint[] = [
            limit(limitCount),
            orderBy(time_stamp, "desc")
        ]
        
        if(lastTimestamp){
            constraints.push(where(time_stamp, "<", lastTimestamp))
        }
        
        constraints = constraints.concat(queryConstraints)

        getDocs(query(collection(db, path), ...constraints))
        .then((snapshot) => {
            const docs = snapshot.docs

            const current = (snapshot.docs.length)
     
            const value = current >= (limitCount ?? 0)

            setNextPage(value)

            if(docs.length > 0){
                let merge = data.concat(docs)
                setData(merge)
            }
        

        }).catch((error) => {
            console.log(error)
            setError(true)
        }).finally(() => {
            setLoading(false)
        })

        // eslint-disable-next-line
    }, [key, lastTimestamp])



    return { loading, error, hasNextPage, data};
};
  
