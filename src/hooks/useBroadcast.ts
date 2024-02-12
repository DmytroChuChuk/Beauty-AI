import {
    onSnapshot,
    collection,
    query,
    Timestamp,
    where,
    QueryConstraint,
    orderBy,
    limit,
    QuerySnapshot,
    DocumentData,
} from "firebase/firestore";

import {
    ANNOUNCE, 
   sender, 
   status, 
   time_stamp, 
  } from "../keys/firestorekeys";

import {  useEffect, useState } from "react";
import shallow from "zustand/shallow";

import { useUser } from "../store";
import { db } from "../store/firebase";
  
  
let cache: { [key: string]: any } = {};

export const useBroadcast: ( limitCount? : number,  get7DaysAgo? : boolean ) 
=> { loading: boolean, error: boolean, data:  QuerySnapshot | null } = (limitCount, get7DaysAgo) => {


    const [uid, isPremium] = useUser((state) => [state.currentUser?.uid, state.currentUser?.isPremium] , shallow)

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const [data , setData] = useState<QuerySnapshot<DocumentData> | null>( cache[`useBroadcast-${limitCount}`] ?? null)


    useEffect(() => {

        let unsub:any = null

        if(isPremium && uid){
            
          let queries: QueryConstraint[] = [where(sender, '==', uid),where(status, '==', 0) ]

          if(get7DaysAgo){

            const d = new Date()
            d.setDate(d.getDate() - 7)

            queries.push( where(time_stamp, '<', Timestamp.now()) )
            queries.push(orderBy(time_stamp, 'desc'))

            if(limitCount) queries.push(limit(limitCount))

          }else{
            const start = new Date()
            const end = new Date(start.getTime())
      
            start.setHours(0,0,0,0)
            end.setHours(23,59,59,999)

            queries.push( where(time_stamp, '>=', Timestamp.fromDate(start)) )
            queries.push(where(time_stamp, '<=', Timestamp.fromDate(end)))
          }

          unsub = onSnapshot(query( collection(db, ANNOUNCE) , ...queries), 

          (snapshot) => {



            // snapShot.docs.forEach((_doc) => {
            //   _ids.push(_doc.id)

            //   const _venue = _doc.get(location) as string
            //   const _date = _doc.get(date) as string
            //   const _time = _doc.get(time) as string
            //   const _activity = _doc.get(activity) as string

            //   const msgs = `${_date} on ${_time} at ${_venue} ${_activity}`

            //   _msgs.push(msgs)
            // })
            
            //cache = _ids

            cache[`useBroadcast-${limitCount}`] = snapshot

            setData(snapshot)
            setLoading(false)
    
          }, (error) => {
            console.log(error)
            setError(true)
          })
    
        }else{
            setLoading(false)
        }
    
        return () => {

          unsub?.()
        }
    
          // eslint-disable-next-line 
      }, [isPremium, uid, limitCount])

    return { loading, error, data};
};
  