import { Typography } from "@mui/material";
import { logEvent } from "firebase/analytics";
import { FC, useEffect, useState  } from "react";
import Autocomplete from "react-google-autocomplete";
//import { useTranslation } from "react-i18next";
import { meetupEnum } from "../../enum/MyEnum";
import '../../scss/components/GeoInput.scss'
// import { useUser } from "../../store";
import { analytics, config } from "../../store/firebase";
import { ServiceType } from "../../keys/props/services";
import { useTranslation } from "react-i18next";
// import { Helper } from "../../Utility/Helper";

interface props {
    serviceType?: ServiceType
    restrict? : string
    meetupType?: meetupEnum | undefined
    defaultValue?: string | null | undefined
    searchFor: string
    onPlaceSelected: (formatted_address : string | undefined) => void
    onChange?: (text?: string | undefined) => void
}

const GeoInput : FC<props> = ({onChange, onPlaceSelected, 
    serviceType,
    meetupType,
    defaultValue, 
    searchFor, 
    restrict}) => {

        

    // const phoneNumber = useUser((state) => state.currentUser?.phoneNumber)

    //const { t } = useTranslation()
    const [ error, setError ] = useState(defaultValue ? false : true)
    const [ t ] = useTranslation()

    // function getCountrySymbol(phoneNumber: string | null | undefined) {

    //     if(!phoneNumber) return "sg"

    //     const helper = new Helper()
    //     const states = helper.getState(phoneNumber)

    //     if(states.length === 0) return "sg"
    //     const _country = states[states.length - 1]

    //     switch (_country) {
    //         case "Philippines":
    //             return "ph"
    //         case "Singapore":
    //             return "sg"

    //         case "Malaysia":
    //             return "my"

    //         case "Indonesia":
    //             return "id"

    //         case "India":
    //             return "in"
        
    //         default:
    //             return "sg";
    //     }
    // }

    function getRestrictions(meetupType: meetupEnum | undefined) : string[]{

        if(serviceType === ServiceType.sports){


            return [
                // "stadium",
                // "shopping_mall",
                // "school",
                // "taxi_stand"
            ]
        }
  
        switch (meetupType) {
            case meetupEnum.meals:
                
                return [
                    "cafe",
                    "restaurant",
                    "bakery",
                    "bar",
                    "shopping_mall"
                ]

            case meetupEnum.dining:
            
                return [
                    "cafe",
                    "restaurant",
                    "shopping_mall"
                ]

            case meetupEnum.drinks:
            
                return [
                    "night_club",
                    "bar",
                    "cafe",
                    "shopping_mall"
                ]

        
            case meetupEnum.gathering:
        
                return [
                    "night_club",
                    "bar",
                    "cafe",
                    "restaurant",
                    "shopping_mall"
                ]

            case meetupEnum.hiking:
    
                return [
                    "establishment"
                ]

            case meetupEnum.photoshoot:

                return [
                    "establishment"
                ]

            case meetupEnum.movies:
                return [
                    "movie_theater"
                ]
            default:
          
                return [
                    "cafe",
                    "restaurant",
                    "bakery",
                    "bar",
                    "shopping_mall"
                ]
        }
    }

    useEffect(() => {
        setError(defaultValue ? false : true)
    }, [defaultValue])

    return <div>

        {error ? <Typography color="error" fontSize={12}>
                {/* { restrict ? "Please click on the given names" : t('searchlocation.hints')} */}
                {t("location.hint")}
            </Typography>
            : 

            <Typography color="text.secondary" fontSize={12}>
                Search a {searchFor}
            </Typography>
        }
        
        <Autocomplete
            id="geo-input"
            language="en"
            // placeholder={`Search a ${searchFor}`}
            options= {restrict ? {
                componentRestrictions: { country: restrict }, // getCountrySymbol(phoneNumber)
                types: getRestrictions(meetupType),
                fields: [
                    "name"
                ]
            } : undefined}

            defaultValue={defaultValue ??  undefined}
            style={{width: '100%', height: "42px"}}
            apiKey={config.apiKey}
            autoCorrect="off"
        
            onKeyUp={(e) => {
                if(e.key === 'Enter'){ 
                    setError(true)
                    onChange?.(undefined)
                }
            }}
            onChange={(e) => {
                const _value = (e.currentTarget.value)
                setError(true)
                onChange?.(_value)
            }}
            onPlaceSelected={(place) => {
                try{

                    if(restrict){
                        const formatted_address =  place.name
                        onPlaceSelected(formatted_address)
                       
                        if(formatted_address){
                            logEvent(analytics, "search", {
                                search_term: formatted_address
                            }); 
                        }
    
                        setError(false)
                    }else {

                    if(place.name)  {
                        logEvent(analytics, "search", {
                            search_term: place.name
                        }); 
                        onPlaceSelected(undefined)
                       
                        setError(true)
                        return
                    }

                    const formatted_address =  place.formatted_address
                    onPlaceSelected(formatted_address)
                   
                    if(formatted_address){
                        logEvent(analytics, "search", {
                            search_term: formatted_address
                        }); 
                    }

                    setError(false)

                    }
                }catch(error) {
                    
                }

            }}
        />

        

    </div>
};

export default GeoInput