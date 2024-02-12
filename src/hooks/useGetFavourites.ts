import { getDoc, doc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { SERVICES, serviceVersion } from "../keys/firestorekeys";
import { detailProps, servicesProps } from "../keys/props/services";
import { db } from "../store/firebase";

export const useGetFavourites: () => { favourites: detailProps[] } = () => {

    const isAnnouncement = window.location.href.getQueryStringValue("session")
    const isAdminPage = window.location.href.getQueryStringValue("admin") === "true"
    const isVerify = window.location.href.getQueryStringValue("verify") === "true"

    const [ favourites, setfavourites ] = useState<detailProps[]>([])

    useEffect(() => {

      if(isAnnouncement || isAdminPage || isVerify){
        return
      }

        getDoc(doc(db, SERVICES, serviceVersion))
        .then((snapshot) => {
            
          if(!snapshot.exists()) return
        
          const dict = snapshot.data() as servicesProps
          let map : detailProps[] = []
  
          Object.entries(dict).forEach((value) => {
  
            const _cat = parseInt(value[0])    
            const _entries = Object.entries(value[1])
  
            for (let index = 0; index < _entries.length; index++) {
              const _e = _entries[index]
              const _id = _e[0]
              const _v = _e[1]
  
              if(typeof _v === "string") return 
              if(_v.rank) map.push({..._v, 
                id: _id,
                serviceType: _cat, 
                title: _v.title}) 
            }
  
          })
  
          const _map = map.sort((one, two) => one.rank! - two.rank!)
          setfavourites(_map)
  
  
        }).catch((err) => console.log(err))

        // eslint-disable-next-line
      }, []);


    return { favourites };
};
  