import { useState, useEffect } from "react";
import { useUser } from "../store";
import shallow from "zustand/shallow";
import { Helper } from "../utility/Helper";
import { deleteField, doc, updateDoc } from "@firebase/firestore";
import { db } from "../store/firebase";
import { USERS, isOnline } from "../keys/firestorekeys";

const useOnlineStatus = () => {

    const helper = new Helper()
    
    const [uid, currentUser] = useUser((state) => [state.currentUser?.uid, state.currentUser], shallow)
    const [online, setOnline] = useState<boolean>(true);

    useEffect(() => {
      window.addEventListener("online", () => setOnline(true));
      window.addEventListener("focus", () => setOnline(true));
      window.addEventListener("offline", () => setOnline(false));
      window.addEventListener("blur", () => setOnline(false));
    }, []);
  
    useEffect(() => {

        if(!uid || !currentUser || !currentUser.uid){
            return
        }

        if(online){
            helper.recentlyActive(currentUser)
        }else{
            updateDoc(doc(db, USERS, uid), {
                [isOnline]: deleteField()
            })
        }
        // eslint-disable-next-line
    }, [online])

    return online;
};
  
  export default useOnlineStatus;