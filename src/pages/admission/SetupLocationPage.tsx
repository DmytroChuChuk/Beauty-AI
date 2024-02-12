import { Accordion, AccordionDetails, Box, Card, CardHeader, Typography } from '@mui/material';
import { doc, updateDoc } from 'firebase/firestore';
import { FC, lazy, Suspense, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import shallow from 'zustand/shallow';
import AccordionIcon from '../../components/adminpage/components/AccordionIcon';
import { AdminAccordionSummary } from '../../components/adminpage/components/AdminAccordionSummary';
import FlexBox from '../../components/Box/FlexBox';
import { CountryLookUpTable } from '../../data/tables';
import GeoInput from '../../components/Inputs/GeoInput';
import { geoEncodings, USERS, state as stateKey, state, club } from '../../keys/firestorekeys';
import { useUser } from '../../store';
import { db } from '../../store/firebase';
import history from '../../utility/history';
import { version } from '../../version/basic';
import PageFooterContainer from './components/PageFooterContainer';

const AdmissionButton = lazy(() => import('./components/AdmissionButton'))

//import AdmissionButton from './components/AdmissionButton';

interface props {   
    data: any
}

const SetupLocationPage : FC<props> = ({data}) => {

    const [ t ] = useTranslation()
    const queryState = sessionStorage.getItem(state)
    const queryClub = sessionStorage.getItem(club)

    const [uid, isAdmin] = useUser((state) => [state?.currentUser?.uid, state.currentUser?.isAdmin], shallow)

    const [area, setArea] = useState<string>()
    const [errorMessage, setErrorMessage] = useState<string>("")
    const [isLoading, setLoading] = useState<boolean>(false)

    useEffect(() => {
        if(isAdmin){
            window.location.href = `/page/Admin?uid${uid}`
        }
        // eslint-disable-next-line
    }, [isAdmin])

    useEffect(() => {
        // const admin = data?.get(keys.admin) as boolean | undefined
        const _geoEncodings = data?.get(geoEncodings) as string[]
        let _area = ""

        function getArea (value : string) {
            if (_area === "") _area += value
            else _area += `, ${value}`
        }

            if(_geoEncodings && _geoEncodings.length !== 0 && Array.isArray(geoEncodings)){

                _geoEncodings?.forEach((value) => {
                getArea(value)
            })

            setArea(_area)
        }
        // eslint-disable-next-line 
    }, [])

    useEffect(() => {
        //reset 
        setErrorMessage("")
    }, [area])

    const onClickNext = async () => {

        if(isLoading){
            return
        }

        setErrorMessage("")
        if(!uid){
            window.location.href = "/Login"
            return
        }
        
        if(!area){
            setErrorMessage("Your location is required")
            return
        }


        try {
            setLoading(true)

            let state = ""
            let _area : string[] = []
    
            area?.split(', ').forEach((value) => {
                if(state === "") state = value
                _area.push(value)
            })

            await updateDoc(doc(db, USERS, uid), {
                [geoEncodings]: _area,
                [stateKey] : state,
            })
            
            setLoading(false)
            
            history.push(`/page/chooseservice?v=${version}`)
 
        }catch(error){
            setErrorMessage(`${error}`)
            setLoading(false)
        }
    }

    return <FlexBox justifyContent="center" height="100vh" bgcolor="#efeff3" paddingTop={4}>

        <Card style={{width: "100%", maxWidth: 500, minWidth: 330, height: 300, position: "relative"}}>
            <CardHeader
                title={t("current.location")}
            />

        <Box padding={2}>
            <Accordion expanded >
                <AdminAccordionSummary>
                    <AccordionIcon src="https://images.rentbabe.com/assets/admin/admin_location.svg"/>
                    <Typography marginLeft={3} className="secondaryHeading">{t("location.tab")}</Typography>
                    {area && <img alt="" src = "https://images.rentbabe.com/assets/mui/green_tick.svg" className="green_tick"/> }
                </AdminAccordionSummary>

                <AccordionDetails>

                <GeoInput 
                    restrict={queryState ? queryState : undefined}
                    searchFor='location'
                    onChange={() => setArea(undefined)} 
                    defaultValue={area} 
                    onPlaceSelected={(formatted_address) => {
                        if(formatted_address) setArea(formatted_address)
                    }}
                />

                    { (queryState && queryClub) && 
                    <Typography variant='caption' color="text.secondary" marginTop={1}>The <b>{queryClub}</b> page is only available in the <b>{
                        Object.keys(CountryLookUpTable).find(k=>CountryLookUpTable[k]===queryState)
                    }</b></Typography> 
                }

                </AccordionDetails>
            </Accordion>
        </Box>
        </Card>

        <PageFooterContainer>
       
       {errorMessage && <Typography color="error" variant="caption">{errorMessage}</Typography>}
           <Suspense fallback={<></>}>
               <AdmissionButton 
                   index={1} 
                   isLoading={isLoading} 
                   onClickNext={onClickNext}                
               />
           </Suspense>

     </PageFooterContainer>

    </FlexBox>
 
}

export default SetupLocationPage