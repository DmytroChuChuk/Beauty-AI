import {
    FC,
    SyntheticEvent,
    useEffect,
    useState,
} from 'react';
import {
    Typography,
    Box,
    Tab,
    Tabs,
    Checkbox,
    Grid,
    Skeleton,
} from '@mui/material';
import TabPanel from '../../chats/components/Chat/Tabs/TabPanel';
import { doc, DocumentData, DocumentSnapshot, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../store/firebase';
import { SERVICES, serviceVersion, USERS, services as servicesKey, admin } from '../../keys/firestorekeys';
import TabContent from './component/TabContent';
import DialogToolbar from '../Dialogs/components/DialogToolbar';
import { useCenterSnackBar, useUser } from '../../store';
import history from '../../utility/history';
import FlexBox from '../Box/FlexBox';
import { servicesProps, ServiceType, detailProps } from '../../keys/props/services';
import { Helper } from '../../utility/Helper';
import { UploadGamingProfileGuideLineText } from './component/UploadGamingPhotoInput';
import { uploadPhoto } from '../../utility/FirebaseStorage';
import { TOD_PROFILES_IMAGES } from '../../keys/storagekeys';
import { chooseServiceTab } from '../../keys/localStorageKeys';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// import { USERS, 
//     services as servicesKey, 
//     priceLimit as priceLimitKey,
//     currency
// } from '../../keys/firestorekeys';



interface props {
    //myServices: servicesProps | undefined
    loadingUserData: boolean
    userData: DocumentSnapshot<DocumentData> | undefined
}

const Content : FC<{
    index: number
    loading : boolean, 
    error: boolean, 
    services: servicesProps | undefined,
    myServices: servicesProps | undefined
    onSelected: (id: string, data: detailProps) => void
    deSelect: (id: string) => void
}> = 

({...props}) => {
    return  <TabContent  {...props}/>
}

// export const SingaporePriceLimit = 20
// {myServices, onDone, onClose, ...props}
const ChooseServices : FC<props> = ({userData, loadingUserData}) => {

    const [ t ] = useTranslation()
    const location = useLocation<{force: boolean}>()
    const forceUpload = location?.state?.force ?? false

    const setCurrentSnackbar = useCenterSnackBar((state) => state.setCurrentSnackbar)
    const [
        currentUser,
        uid, 
        // profileAtWhichState, 
        // gender
    ] = useUser((state) => [
        state.currentUser,
        state.currentUser?.uid,
        // state.currentUser?.profileAtWhichState, 
        // state.currentUser?.gender
    ])


    // const [alert, setAlert] = useState<boolean>(false)
    const defaultValue = forceUpload ? ServiceType.games : parseInt(localStorage.getItem(chooseServiceTab) ?? "0")

    const [error, setError] = useState<boolean>(false)
    const [loading, setLoading] = useState<boolean>(false)
    const [isLoadingDefaultServices, setLoadingServices] = useState<boolean>(true)
    const [value, setValue] = useState(defaultValue)

    const [services, setServices] = useState<servicesProps | undefined>()

    const serverServices = userData?.get(servicesKey) as servicesProps | undefined
    const [myServicesState, setMyServices] = useState<servicesProps | undefined>(serverServices)

    useEffect(() => {
        if(!loadingUserData){
            const serverServices = userData?.get(servicesKey) as servicesProps | undefined
            setMyServices(serverServices)
        }

    }, [loadingUserData, userData])

    useEffect(() => {

        const type = ServiceType.meetup.toString()
        const id = "7"
        const dd1 = serverServices?.[type]?.[id] as detailProps | undefined 
        const dd2 = myServicesState?.[type]?.[id] as detailProps | undefined 

        if(dd1?.dd !== dd2?.dd){
            if(dd1){
                select(id, dd1, ServiceType.meetup)
            }else{
                deSelect(id, ServiceType.meetup)
            }
        }
        // eslint-disable-next-line
    }, [serverServices])


    const handleChange = (event: SyntheticEvent, newValue: number) => {
        setValue(newValue);
    }

    useEffect(() => {
        localStorage.setItem(chooseServiceTab, value.toString())
    }, [value])

    useEffect(() => {

        getDoc(doc(db, SERVICES, serviceVersion))
        .then((snapShot) => {

            if(!snapShot.exists()){
                setError(true)
                //setLoadingServices(false)
                return
            }

            const meetup = snapShot.get(`${ServiceType.meetup}`) as {
                [id: string] : detailProps
            }

            const eMeet = snapShot.get(`${ServiceType.eMeet}`) as {
                [id: string] : detailProps
            }

            const games = snapShot.get(`${ServiceType.games}`) as {
                [id: string] : detailProps
            }

            const sports = snapShot.get(`${ServiceType.sports}`) as {
                [id: string] : detailProps
            }

            let map : servicesProps = {}
            map[ServiceType.meetup] = meetup
            map[ServiceType.eMeet] = eMeet
            map[ServiceType.games] = games
            map[ServiceType.sports] = sports

            setServices(map)
            //setLoadingServices(false)

        }).catch(() => {
            setError(true)
            //setLoadingServices(false)
        }).finally(() => {
            setLoadingServices(false)
        })

    }, [])


    function select (id: string, data: detailProps, serviceType: number) {
     
        setMyServices(prev => {

            let cacheServices = prev
      
            if( data.uploadFile === undefined){
                delete data.uploadFile
            }

            if( data.profile === undefined){
                delete data.profile
            }
        
            if(cacheServices) {
                if(cacheServices[`${serviceType}`]){
             
                    cacheServices[`${serviceType}`][id] = data
                }else{
              
                    cacheServices[`${serviceType}`] = {
                        [id]: data
                    }
                }
            }else{
                cacheServices = {
                    [`${serviceType}`] : {
                        [id]: data
                    }
                }
            }

            return cacheServices
        })
    }

    function deSelect(id: string, serviceType: number){
        setMyServices(prev => {

            const _prev = prev
            delete _prev?.[`${serviceType}`]?.[id]

            return _prev
        })
    }

    const onDoneClick = () => {
        
        let current = myServicesState ?? {}
        let cacheServiceState = myServicesState 

        let stop = false

        for (const key of Object.keys(current)){
            const serviceType = key
            const values = Object.values(current[key])

            if(values.length > 0){
                for(const detail of values){

                    const v = detail as detailProps
    
                    if(typeof(v) === "string") continue
                    if(v.price && v.bio && serviceType === ServiceType.games.toString() && (!v.profile && !v.uploadFile)){
                        //ask to upload game image
                        stop = true
                        
                        break
                    }
                }
            }
        }

        if(stop) {
            setValue(ServiceType.games)
            setCurrentSnackbar({open: true, message: "Please upload your game profile photos."})
            return
        }
        
        for(const key of Object.keys(current)){

            if(key && cacheServiceState){

                const keys = Object.keys(cacheServiceState[key])

                if( keys.length === 1){

                    if(keys[0] === "id"){
                        delete cacheServiceState[key]
                    }else{
                        cacheServiceState[key] = {
                            id: key,
                            ...cacheServiceState[key]
                        }
                    }
                }else if(keys.length > 1){
                    cacheServiceState[key] = {
                        id: key,
                        ...cacheServiceState[key]
                    }
                }
            }
        }
  
        uploadDataToFirestore(cacheServiceState)
        
    }

    async function uploadDataToFirestore (services: servicesProps | undefined) {
        
        const helper = new Helper()
        const hasService = helper.serviceValidation(services)
        if(!services || !hasService) {
            setCurrentSnackbar({open: true, message: "At least one service is required"})
            return 
        }

        let promises = []
        let cacheServices = services
    
        for (const key of Object.keys(services)){
            const serviceType = key
            const values = Object.values(services[key])

            if(values.length > 0){
                for(const detail of values){

                    const v = detail as detailProps
    
                    if(typeof(v) === "string") continue

                    // const limit = (profileAtWhichState?.toLowerCase() === "singapore") && gender === genderEnum.female.toString()
                    // && serviceType === ServiceType.meetup.toString() ? 20  : 1
                    
                    if(!v.price || !v.bio){
                        const current = myServicesState?.[`${serviceType}`]?.[`${v.id}`] 
                        if(typeof current === "object" ){
                            if(current && current.price && current.bio){
                                cacheServices[`${serviceType}`][`${v.id}`] = current
                            }else {
                                delete cacheServices[`${serviceType}`][`${v.id}`]
                            }
                            
                        }else{
                            delete cacheServices[`${serviceType}`][`${v.id}`]
                        }
                    }
                    
                    else if(serviceType === `${ServiceType.meetup}` && v.id === "7" && !v.dd){
                        delete cacheServices[`${serviceType}`][`${v.id}`]
                    }else{
                        // all good
                        const file = v.uploadFile
                        if(file){
                            const upload = uploadPhoto(
                                TOD_PROFILES_IMAGES, 
                                file, 
                                `${serviceType}-${v.id}`, 
                                {
                                    serviceType: serviceType,
                                    category: v.id ?? v.category
                                })
                            promises.push(upload)
                            delete (cacheServices?.[`${serviceType}`]?.[`${v.id}`] as detailProps)?.["uploadFile"]
                        }
                    }                
                }
            }else{
                delete cacheServices[`${serviceType}`]
            }

        }

      
        const map = await Promise.all(promises)

        for (const v of Object.values(map)){

            const url = v?.url;
            const serviceType = v?.serviceType;
            const category = v?.category;

            if(!serviceType || !category){
                continue
            }

           (cacheServices?.[serviceType]?.[category] as detailProps).profile = url
        }

        if(cacheServices && uid && Object.keys(cacheServices).length > 0){

            setLoading(true)
            let map : {[key: string]: any} = {[servicesKey]: cacheServices}
            if(forceUpload){
                map[admin] = false
            }

            const updateHighLow = helper.updateLowestHighestPricing(cacheServices, currentUser?.ratings ?? 0 , currentUser?.numberOfRents ?? 0)

            await updateDoc(doc(db, USERS, uid), {...map, ...updateHighLow})
            setLoading(false)
            // helper.recentlyActive(currentUser)
        }

        //onChangeServices(services)
        onClose()
    }

    const onClose = () => {
        history.goBack()
    }

    return <Box height="100%" minHeight="100vh" sx={{backgroundColor: "#f5f2f2"}}>

        <DialogToolbar
            doneButtonName={t("label.done")}
            title={t("label.services")}
            onDoneClick={onDoneClick}
            onBackClick={onClose}
            isLoading={loading}
        />

        {forceUpload && <Typography fontWeight="bold" color="error" padding="8px 16px">
            Please upload a screenshot of your gaming profile for all Games services. (NEW POLICY)
        </Typography>}

         <Box height="100%" minHeight="100vh" padding={2} sx={{backgroundColor: "#f5f2f2"}} >

         {error && <Typography color="error" variant='caption'>Unexpected error occur</Typography>}

            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs 
                    scrollButtons
                    allowScrollButtonsMobile
                    variant="scrollable"
                    textColor="secondary" 
                    indicatorColor="secondary" 
                    value={value} 
                    onChange={handleChange}
                >
                    <Tab label={t("meetup.tab")} />
                    <Tab label={t("emeet.tab")}  />
                    <Tab label={t("games.tab")}  />
                    <Tab label={t("sports.tab")}  />
                </Tabs>
            </Box>
            
            {value === ServiceType.games &&  <UploadGamingProfileGuideLineText/>}

            {
                (!isLoadingDefaultServices && services) ? Object.keys(services).map((key) => {
                    const type = parseInt(key) as ServiceType

                    // if(type !== value) return null
                    // else 
                    
                    return  <TabPanel key={type} value={value} index={type}>
                        <Content
                            services={services} 
                            myServices={myServicesState} 
                            index={type} 
                            loading={isLoadingDefaultServices || loadingUserData}
                            error={error}         
                            onSelected={(id, data) => {
                                select(id, data, type)
                            }}
                            deSelect={(id) => {
                                deSelect(id, type)
                            }}
                        />
           
                    </TabPanel>
                }) : <Grid 
                    container
                    paddingTop="16px"  
                    direction="row"
                    spacing={{ xs: 2, md: 4 }} 
                    columns={{ xs: 4, sm: 8, md: 12 }}>
                    {[0,0,0,0,0,0,0,0,0,0,0,0].map((_, index) => {
                            return  <Grid key={index} item xs={4} sm={3} md={3} >
                                    <FlexBox  width="100%"  flexDirection="row" alignItems="center">
                                    <Box
                                        width={80}
                                        height={80}
                                        marginRight={2}
                                    >
                                        <Skeleton 
                                            variant='rectangular'
                                            width={80}
                                            height={80}
                                    />
                                    </Box>
            
                                    <Box width="50%">
                                        <Skeleton variant='text' width={50} />    
                                        <Skeleton variant='text' />    
                                    </Box>
            
            
                                    <Box marginRight={0}>
                                        <Checkbox disabled />
                                    </Box>
                                </FlexBox>
                            </Grid>
                        })
                    }
                </Grid>
            }

         </Box>

         {/* <CenterSnackBar
            open={alert}
            message="At least one service is required"
            autoHideDuration={2000}
            onClose={() => setAlert(false)}
         /> */}
  
    </Box>
 
}

export default ChooseServices