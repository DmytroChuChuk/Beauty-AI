import { logEvent } from "firebase/analytics";
import { useEffect, useState } from "react";
import shallow from "zustand/shallow";
import { AnalyticsNames } from "../keys/analyticNames";
import { MALAYSIA, COLOMBIA, ipgeolocationAPIKEYS, SINGAPORE, PHILIPPINES, INDONESIA } from "../keys/countries";
import { area, country } from "../keys/localStorageKeys";
import { useUser } from "../store";
import { analytics } from "../store/firebase";
import { Helper } from "../utility/Helper";

export const useIPAddress: () => { loadingIPAddress: boolean } = () => {

    const helper = new Helper()
    const state = helper.getQueryStringValue("state")

    const [ uid ] = useUser((state) => [state.currentUser?.uid], shallow)
    const setCurrentUser = useUser((state) => state.setCurrentUser)

    const [loadingIPAddress, setLoading] = useState(true)

    // function shuffle(array: string[]) {
    //   let currentIndex = array.length,  randomIndex;
    
    //   // While there remain elements to shuffle.
    //   while (currentIndex !== 0) {
    
    //     // Pick a remaining element.
    //     randomIndex = Math.floor(Math.random() * currentIndex);
    //     currentIndex--;
    
    //     // And swap it with the current element.
    //     [array[currentIndex], array[randomIndex]] = [
    //       array[randomIndex], array[currentIndex]];
    //   }
    
    //   return array;
    // }

    useEffect(() => {
        const msia = MALAYSIA.join(", ")
        const colombia = COLOMBIA.join(", ")
        const singapore = SINGAPORE.join(", ")
        const philippines = PHILIPPINES.join(", ")
        const indonesia = INDONESIA.join(", ")

        if(state === "kl"){
            localStorage.setItem(area, msia)
            setLoading(false)

        }else if(state === "co"){
            localStorage.setItem(area, colombia)
            setLoading(false)
        }else{
            const _area = localStorage.getItem(area)
            if(!_area && !uid){
      
              const controller = new AbortController()
              const { signal } = controller;
         
              const API = ipgeolocationAPIKEYS.shuffle()[(Math.random() * ipgeolocationAPIKEYS.length) | 0]

              fetch(`https://api.ipgeolocation.io/ipgeo?apiKey=${API}`, 
              { signal })
              .then(async (data) => {
          
                const jsonData = await data.json()
                const countryName =  jsonData.country_name
                
                if(countryName === "Malaysia"){
                  localStorage.setItem(area, msia)
                }else if(countryName === "Singapore"){
                    localStorage.setItem(area, singapore)
                }else if(countryName === "Colombia"){
                    localStorage.setItem(area, colombia)
                }else if(countryName === "Philippines"){
                  localStorage.setItem(area, philippines)
                } else if(countryName === "Indonesia"){
                  localStorage.setItem(area, indonesia)
                }

                try{
                  if(countryName){
                    logEvent(analytics, AnalyticsNames.ipaddress, {
                      country_type: countryName,
                      content_type: countryName,
                      item_id: countryName, 
                    })  
                  }
                }catch{}
                const countryCode = jsonData.country_code2
                if(countryCode){
                  localStorage.setItem(country, countryCode)
                  setCurrentUser({countryCode: countryCode})
                }
                
              }).catch((error) => {
                console.log(error)
              }).finally(() => {
                setLoading(false)
              })
      
              return () => {
                controller.abort(); // abort on unmount for cleanup
              };
            }else{
                setLoading(false)
            }
          }
    

        // eslint-disable-next-line
      }, []);


    return { loadingIPAddress };
};
  