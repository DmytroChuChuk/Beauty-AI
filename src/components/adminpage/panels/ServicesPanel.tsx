import { FC } from 'react';

import { 
    Accordion, 
    Typography, 
    AccordionDetails, 
    AccordionProps, 
    Chip, 
    Grid, 
    Button, 
    Avatar, 
    Box
} from '@mui/material';

import AccordionIcon from '../components/AccordionIcon';
import { AdminAccordionSummary } from '../components/AdminAccordionSummary';
import { detailProps, servicesProps, ServiceType } from '../../../keys/props/services';
import { ServicesHelper } from '../../../utility/ServicesHelper';
import  { PriceLimitProps } from '../../Services/PriceLimit';
import { operator } from '../../../enum/MyEnum';

import history from '../../../utility/history';
import { version } from '../../../version/basic';
import { useTranslation } from 'react-i18next';


const GridItem: FC<{serviceType: number, details: detailProps}> = ({serviceType, details}) => {

    const serviceHelper = new ServicesHelper()

    const isMeetup = serviceType === ServiceType.meetup
    const isGames = serviceType === ServiceType.games

    const price = (details.price ?? 0) / 100

    return <Grid item xs="auto">
        <Chip 
            avatar={<Avatar src={details.image}/>} 
            label={`${details.title} ${price.toFixed(2)}/${isMeetup ? "1Hr" : isGames ? 
            serviceHelper.convertUnits(details?.suffix)
            : "15Min"}`}
        />
    </Grid>
}

interface props extends AccordionProps{
    services: servicesProps | undefined
    priceLimit: PriceLimitProps | undefined
}

const ServicesPanel : FC<props> = ({services, priceLimit, ...props}) => {

    const [ t ] = useTranslation()

    // const [
        //uid, 
        // profileAtWhichState, 
        // gender
    //] = useUser((state) => [
        // state.currentUser?.uid,
        // state.currentUser?.profileAtWhichState, 
        // state.currentUser?.gender
    // ])

    // const [myPriceLimit, setPriceLimit] = useState<PriceLimitProps | undefined>(priceLimit)
    // const [myServices, setServices] = useState<servicesProps | undefined>(services)
    // const [openLimit, setLimit] = useState<boolean>(false)

    const addMoreServices = () => {
        //setOpen(true)
        history.push(`/services?v=${version}`, {
            myServices: services
        })
    }

    function stringProcess (_myPriceLimit : PriceLimitProps | undefined) {


        if(!_myPriceLimit) return null

        if(!_myPriceLimit.wlmt && !_myPriceLimit.slmt){
            return null
        }
         
        const _walletLimit = _myPriceLimit?.wlmt ? 
            <>wallet limit: <b>{(_myPriceLimit.wlmt/100).toFixed(2)}</b> credit</> 
            : null

        const _operator = _myPriceLimit?.opkey !== undefined ? 
            <><b>{_myPriceLimit?.opkey === operator.both ? " AND " : " OR "}</b></> 
            : null

        const _spendlimit = _myPriceLimit?.slmt ? 
            <>spend limit: <b>{(_myPriceLimit.slmt/100).toFixed(2)}</b> credit</> 
            : null
            
        return <>
            <Box height="8px"/>
            Restrict by&nbsp;
            {_walletLimit}
            {_operator}
            {_spendlimit}
        </>
    }

    const addLimit = () => {
        history.push(`/pricelimit?v=${version}`, {
            value: priceLimit
        })
    }

    return <> 
        <Accordion 
            sx={{width: "100%"}}
            {...props}
        >
            <AdminAccordionSummary>

                <AccordionIcon src="https://images.rentbabe.com/assets/admin/admin_services.svg"/>
            
                <Typography marginLeft={3}>{t("label.services")}</Typography>

            </AdminAccordionSummary>
                
            <AccordionDetails>

                <Grid container spacing={1} >

                    {
                        services && Object.keys(services).sort().map((category) => {
                  
                            const  serviceType = parseInt(category)
                 
                          
                            
                            return Object.entries(services[category]).map((value) => {

                                const id = value[0]
                                const details = value[1] as detailProps

                                if(!details.price || !details.bio)  return null
                                
                                else if(details.price < 100)  return null
                                
                                else return <GridItem key={`${id}-${category}`} 
                                serviceType={serviceType} details={details} />  
                            })
                        })
                    }
                </Grid>

                <br/>
                <br/>

                <Button 
                    fullWidth 
                    color="secondary" 
                    variant='contained'
                    onClick={addMoreServices}
                >{Object.keys(services ?? {}).length > 0 ? `${t("label.update.services")}` : `${t("label.add.services")}`}</Button>

                <Button
                    sx={{marginTop: ".5rem"}}
                    fullWidth 
                    color="error" 
                    variant='contained'
                    onClick={addLimit}
                >
                    {t("label.set.price")}
                </Button>

                <Typography
                    color="error.main" 
                    variant='caption'>
                    {stringProcess(priceLimit)}
                </Typography>

                <Box height="8px"/>
                
                <Typography
                color="text.secondary" 
                variant='caption'>{t("coin.hint")}</Typography>

            </AccordionDetails>
            
        </Accordion>

        {/* <ChooseServices
            open={open}
            onClose={() => setOpen(false)} 
            myServices={services}
            onDone={(services) => {
                setServices(services)

                const hasError = validation(services)
        
                if(!hasError && services && uid && Object.keys(services).length > 0){
                    updateDoc(doc(db, USERS, uid), {
                        [servicesKey]: services,
                        [currency]: "SGD"
                    })
                }

                onChangeServices(services)
            }}
        /> */}

        {/* <PriceLimit 
            value={priceLimit}
            open={openLimit}
            onClose={() => setLimit(false)}
            onDone={(value) => {
                // setPriceLimit(value)
                // if(uid){
                //     updateDoc(doc(db, USERS, uid), {
                //         [priceLimitKey]: value ? value : deleteField()
                //     })
                // }
                //onAddPriceLimit(value)
            }}
        /> */}
    </>
 
}

export default ServicesPanel