import { Card, CardHeader, Typography } from "@mui/material"
import { Box } from "@mui/system"
import { deleteField, doc, updateDoc } from "firebase/firestore"
import { FC, useEffect, useState } from "react"
import shallow from "zustand/shallow"
import ServicesPanel from "../../components/adminpage/panels/ServicesPanel"
import FlexBox from "../../components/Box/FlexBox"
import { servicesProps } from "../../keys/props/services"
import { PriceLimitProps } from "../../components/Services/PriceLimit"
import { bio, price, priceLimit, services, USERS } from "../../keys/firestorekeys"
import { bio as  bioSkey } from "../../keys/localStorageKeys"
import { useUser } from "../../store"
import { db } from "../../store/firebase"
import { Helper } from "../../utility/Helper"
import history from "../../utility/history"
import { ServicesHelper } from "../../utility/ServicesHelper"
import { version } from "../../version/basic"
import AdmissionButton from "./components/AdmissionButton"
import ApplyDescription from "./components/ApplyDescription"
import PageFooterContainer from "./components/PageFooterContainer"
import { useTranslation } from "react-i18next"

interface props {
    data: any
}

const ChooseServicePage : FC<props> = ({data}) => {


    const [ t ] = useTranslation()
    
    const [uid, isAdmin] = useUser((state) => [state?.currentUser?.uid, 
        state?.currentUser?.isAdmin], shallow)

    const serviceHelper = new ServicesHelper()
    const helper = new Helper()


    const priceState = (data?.get(price) as number)

    const defaultBio = (data?.get(bio) as string ?? localStorage.getItem(bioSkey) ?? undefined)
    // const [priceLimitState, setPriceLimit] = useState<PriceLimitProps | undefined>(data?.get(priceLimit) as PriceLimitProps)
    // const [servicesState, setServices] = useState<servicesProps | undefined>(data?.get(services) as servicesProps)

    const priceLimitState = data?.get(priceLimit) as PriceLimitProps
    const servicesState = data?.get(services) as servicesProps | undefined

    const [errorMessage, setErrorMessage] = useState<string>("")
    const [isLoading, setLoading] = useState<boolean>(false)

    // useEffect(() => {
    //     setPriceLimit(data?.get(priceLimit) as PriceLimitProps)
    //     setServices()

    // }, [data])


    useEffect(() => {
        if(isAdmin){
            history.push(`/page/Admin?uid${uid}`)
        }
        // eslint-disable-next-line
    }, [isAdmin])

    const onClickNext = async () => {

        if(isLoading){
            return
        }

        setErrorMessage("")
        if(!uid){
            window.location.href = "/Login"
            return
        }

        const hasService = helper.serviceValidation(servicesState)

        if(!hasService){
            // show error
            setErrorMessage("Please choose a service")
            return
        }

        setLoading(true)

        var map : { [id:string] : any } = { 
            [services]: servicesState
        }

        if(priceLimitState){
            map[priceLimit]  = priceLimitState
        } else map[priceLimit]  = deleteField()

        await updateDoc(doc(db, USERS, uid), map)

        setLoading(false)

        history.push(`/page/uploadmedia?v=${version}`)
        // history.push("/page/uploadmedia")
        // update firestore
    }

    return <FlexBox flexDirection="column" height="100vh" alignItems="center" bgcolor="#efeff3" paddingTop={4}> 

        <Card style={{maxWidth: 500, minWidth: 330,  position: "relative"}}>

            <CardHeader
                title={t("choose.service.label")}
            />

            <Box padding={2}>
                <ServicesPanel 
                    priceLimit={priceLimitState}
                    services={ servicesState ?? serviceHelper.createDefault(priceState, defaultBio)}
                    expanded={true} 
                    children={<></>}
                />
            </Box>
        </Card>

        <PageFooterContainer>
       
            {errorMessage && <Typography color="error" variant="caption">{errorMessage}</Typography>}

            <AdmissionButton 
                index={2} 
                isLoading={isLoading} 
                onClickNext={onClickNext}                
            />

            <ApplyDescription/>

        </PageFooterContainer>
    
    </FlexBox>

    
}

export default ChooseServicePage