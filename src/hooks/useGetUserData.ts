import {
    DocumentData,
    doc,
    DocumentSnapshot,
    onSnapshot,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { USERS } from "../keys/firestorekeys";
import { db } from "../store/firebase";
  
  
let cache : {[uid: string] : DocumentSnapshot<DocumentData> | undefined}  = {}

export const useGetUserData: (
    uid: string | null | undefined, 
    ) => { 

    loading: boolean; 
    error: boolean; 
    data: DocumentSnapshot<DocumentData> | undefined;
    } = (
    uid
    ) => {

    const [loading, setLoading] = useState(true)

    const [error, setError] = useState(false)
    const [data, setData] = useState< DocumentSnapshot<DocumentData> | undefined>( uid ? cache?.[uid] : undefined)

    useEffect(() => {

        if(!uid){
            setLoading(false)
            return
        }
    
        if(cache?.[uid]){
            setLoading(false)
            setData(cache?.[uid])
            // console.log("RETURN")
            // return
        }else{
            setLoading(true)
        }



        const unsubscribe = onSnapshot(
            doc(db, USERS, uid) , (_doc) => {
        
                if(_doc.exists()){
       
                    setData(_doc)
                    cache[uid] = _doc
                }

                setLoading(false)
                
            }, (err) => {
                console.log(err)
                setError(true)
                setLoading(false)
            })

        return () => {

            unsubscribe()
        }

        // eslint-disable-next-line
    }, [uid])

    // useEffect(() => {
    //     getData()
    // }, [getData])


    // useEffect(() => {

    //     if(!uid){
    //         setLoading(false)
    //         return
    //     }

    //     const unsubscribe = onSnapshot(
    //         doc(db, USERS , uid) , (_doc) => {
    
    //             if(_doc.exists()){
       
    //                 setData(_doc)
    //                 cache[uid] = _doc
    //             }

    //             setLoading(false)
                
    //         }, (err) => {
    //             console.log(err)
    //             setError(true)
    //             setLoading(false)
    //         })


    //     return () => {
    //         unsubscribe()
    //     }
            
    //     // eslint-disable-next-line

    // }, [uid]);

    return { loading, error , data};
};
  