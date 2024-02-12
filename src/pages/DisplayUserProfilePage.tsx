import { FC, useEffect, useRef } from 'react';
import DisplayUserMasonry from './components/rent/DisplayUsersMasonry';
import { USERS, admin, createdAt, geoEncodings, id, services, sortByRatings, time_stamp } from '../keys/firestorekeys';
import { QueryConstraint, collection, limit, orderBy, where } from '@firebase/firestore';
import { db } from '../store/firebase';
import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { ServiceType } from '../keys/props/services';
import { DDServiceIndex } from '../components/Services/ServiceGridDD';
import history from '../utility/history';

export enum UserType{
    NEW_USER,
    SPORTS,
    DOUBLE_DATES,
    MOST_POTENTIAL
}

const DisplayUserProfilePage : FC<{hidden: boolean}> = ({
    hidden
}) => {

    const type = window.location.href.getQueryStringValue("usertype")
    const userType = UserType[UserType[parseInt(type ?? "0")] as keyof typeof UserType]

    const limitNumber = 8
    const minBoxWidth = 250

    const scrollPositionY = useRef<number>(0)
    const onceAdd = useRef(false)

    const titles: {
        [key: number]: string
    } = {
        [UserType.NEW_USER]: "new.users", 
        [UserType.SPORTS]: "sports.tab", 
        [UserType.DOUBLE_DATES]: "Double Dates",
        [UserType.MOST_POTENTIAL]: "Most potential"
    }

    const servicesJson: {
        [key: number]: {
            serviceType: ServiceType | undefined,
            serviceId: string | undefined
        }
    } = {
        [UserType.NEW_USER]: {serviceType: undefined, serviceId: undefined}, 
        [UserType.SPORTS]: {serviceType: ServiceType.sports, serviceId: undefined}, 
        [UserType.DOUBLE_DATES]: {serviceType: ServiceType.meetup, serviceId: DDServiceIndex},
        [UserType.MOST_POTENTIAL]: {serviceType: ServiceType.eMeet, serviceId: undefined}
    }

    const serviceType = servicesJson[userType]?.serviceType
    const serviceId = servicesJson[userType]?.serviceId


    const queries: {
        [key: number]: QueryConstraint[]
    } = {
        [UserType.NEW_USER]: [where(admin, "==", true), orderBy(createdAt, "desc"), limit(getLimit())], 
        [UserType.SPORTS]: [where(admin, "==", true), 
                            where(geoEncodings, "array-contains", "Singapore"),
                            where(`${services}.${ServiceType.sports}.${id}`, "==", `${ServiceType.sports}`), 
                            orderBy(time_stamp, "desc"), limit(getLimit())], 
        [UserType.DOUBLE_DATES]: [where(admin, "==", true),
                            where(geoEncodings, "array-contains", "Singapore"), 
                            where(`${services}.${ServiceType.meetup}.${DDServiceIndex}.${id}`, "==", `${DDServiceIndex}`),
                            orderBy(time_stamp, "desc"), limit(getLimit())],
        [UserType.MOST_POTENTIAL]: [where(admin, "==", true), where(`${services}.${ServiceType.eMeet}.${id}`, "==", `${ServiceType.eMeet}`),
                            orderBy(sortByRatings, "desc"), limit(getLimit())]
    }

    function getLimit() {
        let w = window.innerWidth;
        let myLimit = Math.floor(w / minBoxWidth) * 3
        return myLimit <= 8 ? limitNumber : myLimit 
    }

    const [ t ] = useTranslation()

    useEffect(() => {

        //setHidden(hide)
    
        if(!hidden){
          if(!onceAdd.current){
        
            window.addEventListener('scroll', onScroll)
            onceAdd.current = true
          }
    
          setTimeout(() => {
            window.scrollTo(0, scrollPositionY.current)
          }, 100)
        }
    
      }, [hidden]) // eslint-disable-line react-hooks/exhaustive-deps

      function onScroll(){
  
        const last = (decodeURIComponent(history.location.pathname.split("/").pop() ?? ""))
        const endings = last.split('?')[0]
    
        if(endings.toLowerCase() === 'renting'){
          scrollPositionY.current = window.scrollY
        }
    }

    return <Box hidden={hidden}>
      <Typography margin={3} variant='h4' fontWeight="bold">{t(titles[userType])}</Typography>
        <DisplayUserMasonry
            serviceType={serviceType}
            serviceId={serviceId}
            sortByKey={userType === UserType.NEW_USER ? createdAt : userType === UserType.MOST_POTENTIAL ? sortByRatings : time_stamp}
            collection={collection(db, USERS)}
            queryConstraint={queries[userType]}
            // regionState={
            //    (userType === UserType.SPORTS || userType === UserType.DOUBLE_DATES) ? ["Singapore"] : []
            // }
            regionState={[]}
        />
    </Box>
 
}

export default DisplayUserProfilePage