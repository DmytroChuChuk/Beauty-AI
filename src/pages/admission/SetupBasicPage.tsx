import { Accordion, AccordionDetails, Box, Card, FormControl, InputLabel, MenuItem, Select, TextField, Typography } from '@mui/material';
import { collection, deleteField, doc, getDocs, limit, query, serverTimestamp, Timestamp, updateDoc, where } from 'firebase/firestore';
import { FC, useEffect, useState } from 'react';
import shallow from 'zustand/shallow';
import DateOfBirth from '../../components/adminpage/components/DateOfBirth';
import Nickname from '../../components/adminpage/components/Nickname';
import SelectRace from '../../components/adminpage/components/SelectRace';
import CenterFlexBox from '../../components/Box/CenterFlexBox';
import FlexGap from '../../components/Box/FlexGap';

import * as keys from "../../keys/firestorekeys"
import {
    availability as avaSkey, 
    foodPref as foodSKey,
    height as heightSKey, 
    admin as adminSKey
} from "../../keys/localStorageKeys"
import { useUser } from '../../store';

import { genderEnum } from '../../enum/MyEnum'

import '../../pages/scss/AdminProfilePage.scss'
import { Helper } from '../../utility/Helper';
import AccordionIcon from '../../components/adminpage/components/AccordionIcon';
import { AdminAccordionSummary } from '../../components/adminpage/components/AdminAccordionSummary';
import AdminInput from '../../components/adminpage/components/AdminInput';
import OrientationInput from '../../components/Inputs/OrientationInput';
import { db } from '../../store/firebase';
import CenterSnackBar from '../../chats/components/Snackbar/CenterSnackBar';
import AdmissionButton from './components/AdmissionButton';
import Privacy from '../../components/adminpage/components/Privacy';
import ApplyDescription from './components/ApplyDescription';
import FlexBox from '../../components/Box/FlexBox';
import { useTranslation } from 'react-i18next';

interface props {
    data: any
}

const SetupBasicPage : FC<props> = ({data}) => {

    const helper = new Helper()

    const clubName = sessionStorage.getItem(keys.club)
    const stateName = sessionStorage.getItem(keys.state)

    const [
        uid, isAdmin, myClubName,
    ] = useUser((state) => [
        state?.currentUser?.uid, 
        state?.currentUser?.isAdmin,
        state?.currentUser?.club
    ], shallow)

    const [ t ] = useTranslation()

    useEffect(() => {
        if(isAdmin){
            window.location.href = `/page/Admin?uid${uid}`
        }
        // eslint-disable-next-line
    }, [isAdmin])

    const setUser = useUser((state) => state.setCurrentUser)

    const [privacy, setPrivacy] = useState<number>(data?.get(keys.privacy) as number ?? 0)
    const _race = data?.get(`${keys.race}2`) as {[key: string] : boolean}

    const _raceKeys = _race ? Object.keys(_race).length > 0 : false
    const _raceK = _raceKeys ? Object.keys(_race)[0] : undefined

    const [showToast, setShowToast] = useState<boolean>(false)
    const [food, setFood] = useState<string>(data?.get(keys.foodPref) as string ?? localStorage.getItem(foodSKey) ?? undefined )
    const [raceState, setRace] = useState<string | undefined>(_raceK)
    const [height, setHeight] = useState<number>(data?.get(keys.height) as number ?? parseInt(localStorage.getItem(heightSKey) ?? "undefined") ?? undefined)
    const [nickname, setNickname] = useState<string | undefined>(data?.get(keys.nickname) as string)
    const [DOB, setDOB] = useState<Timestamp>(data?.get(keys.dob) as Timestamp)

    const [expanded, setExpanded] = useState(false)
    const [orientationArray, setOrientationArray] = useState<string[]>( data?.get(keys.orientation) as string[] )

    const [genderState, setGender] = useState<number | undefined>( data?.get(keys.gender) as number  )

    const [availability, setAvailability] = useState<string>(data?.get(keys.availability) as string ?? localStorage.getItem(avaSkey) ?? undefined)

    const [errorMessage, setErrorMessage] = useState<string>("")
    const [isLoading, setLoading] = useState<boolean>(false)

    const onChangeDOB = (d : Date | undefined) => {
        if(d) setDOB(Timestamp.fromDate(d))
    }

    function validation():string | null{

        if(!availability) return "Availability is required" 

        else if(!nickname) return "Username is required" 
        
        else if(!DOB) return "Date of birth is required" 
        
        else if(raceState === undefined) return "Ethnicity is required" 

        else if (genderState === undefined) return "Gender is required"
        const errorMessage = helper.validateDOB(DOB.toDate())

        if(errorMessage) return errorMessage

        return null
    }

    const onClickNext = async () => {

        if(isLoading){
            return
        }
        
        setErrorMessage("")
        if(!uid){
            window.location.href = "/Login"
            return
        }

        const valid = validation()
        if(valid){
            setErrorMessage(valid)
            return
        }


        setLoading(true)

        const snap = await getDocs(query(collection(db, keys.USERS) 
        , where(keys.nickname, "==" , nickname) 
        , limit(1))) 

        if(snap.docs.length !== 0){
            const _uid = snap.docs[0].id
            if(_uid !== uid){
                const msg = `${nickname} is not available already. Please try again.`

                setErrorMessage(msg)
                setLoading(false)

                return
            }
            
        }

        let map : { [id:string] : any } = {
            [keys.admin]: false,
            [keys.nickname]: nickname?.toLowerCase(),
            [keys.dob]: DOB,
            [keys.reject_reason] : deleteField(),
            [keys.privacy]: privacy
        }

        if(availability) map[keys.availability]  = availability

        if(genderState !== undefined) map[keys.gender]  = genderState

        if(raceState !== undefined){
            map[`${keys.race}2`] = {
                [raceState] : true
            }
        }

        if(availability) map[keys.availability]  = availability

        if(height) map[keys.height] = height
        else map[keys.height] = deleteField()

        if(orientationArray && orientationArray.length > 0) map[keys.orientation]  = orientationArray
        else map[keys.orientation]  = deleteField()

        if(food) map[keys.foodPref]  = food
        else map[keys.foodPref]  = deleteField()

        if(!myClubName){
            map[keys.club]  = {
                [keys.name]: clubName ? clubName.toLowerCase() : "rentbabe",
                [keys.state]: stateName ? stateName.toLowerCase() : "sg",
                [keys.time_stamp]: serverTimestamp()
            }
        }

        try {

            await updateDoc(doc(db, keys.USERS, uid) , map) 
            setLoading(false)

            setUser({isAdmin:false})
            localStorage.setItem(adminSKey, String(false))

            setShowToast(true)
            setTimeout(() => {
                // if(stateName && clubName){
                //     window.location.href = `${stateName}/${clubName}`
                // }else{
                //     window.location.href = ""
                // }

                window.location.href = `/page/Admin?uid=${uid}`
            }, 1000)
            
        } catch (error) {
            setErrorMessage(`${error}`)
            setLoading(false)
        }

    }

    if(isAdmin) return null

    return <FlexBox alignItems="center" flexDirection="column" minHeight="100vh" bgcolor="#efeff3" >

        <Card style={{width: "100%", maxWidth: 500, minWidth: 330, minHeight: 300, position: "relative"}}>

            <Box padding={2}>

                <Privacy privacy={privacy} onChange={(e) => {
                    const value = e.target.value as number
                    setPrivacy(value)
                }} />
                
                <br/>

                <Box>
                    {uid && <Nickname 
                        myUid={uid}
                        currentNickname={nickname} 
                        disabled={false} 
                        onSuccess={(nick) => {
                            setNickname(nick)
                        }}
                    />}

                    <br/>

                    <TextField
                        margin='dense' 
                        fullWidth
                        type="text"  
                        color="secondary"
                        label={t("availability.label")}
                        placeholder={t("availability.example")}
                        defaultValue={availability} 
                        onChange={(e) => {
                            setAvailability((e.target as HTMLInputElement).value)
                        }}
                    />

                    <br/>
                    <br/>

                    <FlexBox>
                        <DateOfBirth DOB={DOB} onChange={onChangeDOB} />
                        <FlexGap/>
                        <TextField
                            fullWidth
                            size='small'
                            color="secondary"
                            label={`${t("height.label")} (cm)`}
                            type="number"  
                            style={{maxWidth: "200px"}} 
                            placeholder='160' 
                            autoCorrect='none'
                            autoComplete='none'
                            autoSave='none'
                            defaultValue={height} 
                            onChange={(e) => {
                                setHeight((e.target as HTMLInputElement).valueAsNumber)
                            }}
                        />
                    </FlexBox>

                    <br/>

                    <FlexBox>

                    <FormControl fullWidth>
                        <InputLabel color='secondary'>{t("gender.label")}</InputLabel>
                        <Select color="secondary" 
                                size='small'
                                label={t("gender.label")} 
                                defaultValue={genderState} 
                                placeholder="Select One" 
                                onChange={e => {
                                    const v = e.target.value as number;
                                    setGender(v)
                                }}>
                                    <MenuItem value={genderEnum.female}>Female</MenuItem>
                                    <MenuItem value={genderEnum.male}>Male</MenuItem>
                        </Select> 
                    </FormControl>

                    <FlexGap/>
                    <FlexGap/>

                    <FormControl fullWidth>
                        <InputLabel color='secondary'>{t("ethnicity.label")}</InputLabel>
                        <SelectRace
                            size='small'
                            fullWidth 
                            color="secondary"
                            label={t("ethnicity.label")}
                            selected={raceState}
                            onChange={e => {
                                const v = e.target.value as string;
                                setRace(v)
                            }}
                        /> 
                    </FormControl>

                    </FlexBox>

                    <br/>
                    
                    <Accordion  expanded={expanded} onChange={() => setExpanded(!expanded)}>
                        <AdminAccordionSummary>

                            <AccordionIcon src="https://images.rentbabe.com/assets/admin/admin_settings.svg" />
                            <Typography marginLeft={3} className="secondaryHeading">{t("add.info.label")}</Typography>

                        </AdminAccordionSummary>

                        <AccordionDetails>
                            <OrientationInput 
                                value={orientationArray} 
                                onSelect={(value) => {
                                    setOrientationArray(value)
                                }}            
                            />

                            <br/>
                            <br/>


                            <AdminInput label={t("food.pref.label")} placeholder={t("food.example")}
                                defaultValue={food} onChange={(e) => setFood((e.target as HTMLInputElement).value)}/>  
                        </AccordionDetails>
                    </Accordion>

                </Box>
                
                <br/>
                <br/>
                <br/>
                <br/>

            </Box>

            <br/>
            <br/>
            <br/>


            <CenterFlexBox 
                sx={{
                    maxHeight: '82px', 
                    boxShadow: "none", 
                    borderTop: `1px solid rgba(50, 50, 50, .16)`, 
                    borderRadius: "0"   
                  }}
                bgcolor="white" 
                position="fixed" 
                left={0} 
                right={0} 
                bottom={0} 
                flexDirection="column" 
                padding={4}>

       
                {errorMessage && <Typography color="error" variant="caption">{errorMessage}</Typography>}

                <AdmissionButton 
                    index={5}
                    isFinal 
                    isLoading={isLoading} 
                    onClickNext={onClickNext}                
                />

                <ApplyDescription/>

            </CenterFlexBox>

        </Card>

        <CenterSnackBar
            open={showToast}
            onClose={() => setShowToast(false)}
            autoHideDuration={1500}
            message="Thank you for the application"/> 

    </FlexBox>
}

export default SetupBasicPage