import { ChangeEvent, FC, useState } from 'react';

import { 
    Box, 
    Button, 
    Checkbox,
    CircularProgress, 
    Divider, 
    FormControlLabel, 
    Typography 
} from '@mui/material';

import CreditAmount from '../Wallet/components/CreditAmount';
import GetCreditBalance from '../Wallet/components/hooks/GetCreditBalance';
import ChoosePaymentMethod from '../PaymentMethod/ChoosePaymentMethod';
import { payBy } from '../../../enum/MyEnum';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../../store/firebase';
import {  useStripe } from '@stripe/react-stripe-js';
import CenterSnackBar from '../../../chats/components/Snackbar/CenterSnackBar';
import { cardGray } from '../../../keys/color';
import { TelegramLink } from '../../../keys/contactList';
import { Helper } from '../../../utility/Helper';
import { stripeBuyCustomCreditFunction } from '../../../keys/functionNames';
import { useUser } from '../../../store';
import FlexBox from '../../Box/FlexBox';

interface props {
    index: number
    functionName: string | undefined
    price: number | undefined
    discount: number | undefined
    promo: string | undefined
    customAmount: number | undefined
}

const BuyCredit : FC<props> = ({index, price, discount, functionName, promo, customAmount: amt}) => {

    const [ 
        isPremium,        
    ] = useUser((state) => [
        state.currentUser?.isPremium ?? false
    ])

    const helper = new Helper();
    const funnel = helper.getQueryStringValue("funnel");

    const stripe = useStripe();

    const [check, setCheck] = useState<boolean>(false)
    const [isLoading, setLoading] = useState<boolean>(false)
    const [open, setOpen] = useState<boolean>(false)
    const [pay, setPay] = useState<string>(payBy.paynow)
    // const [amt, setAmt] = useState<number>()

    const buyCredits = async () => {
        //stripe check out
        setLoading(true)

        if(index === -1){
            if(!amt) return
            const stripeBuyCustomCredit = httpsCallable(functions, stripeBuyCustomCreditFunction)

            try{
                let map : {[key: string] : any} = {
                    payBy: pay,
                    origin: `${window.location.origin}`,
                    index: index,
                    amount: amt,
                    funnel: funnel,
                    isPremium: isPremium
                }

                if(promo){
                    map.promo = promo.toUpperCase()
                }

                const res = await stripeBuyCustomCredit(map);

                const data = res.data as any;
                const status = data.status
                const sessionId = data.sessionId
                
                if(status === 200){
                    await stripe?.redirectToCheckout({
                        sessionId: sessionId
                    })
                }else{
                    setOpen(true)
                }

            }catch(error){
                setOpen(true)
                console.log(error)
            }
        }else {

            if(!functionName) {
                console.log("no function name")
                setOpen(true)
                return 
            } 
            
            const stripeBuyCredit = httpsCallable(functions, functionName)

            try{
                
                let map : {[key: string] : any} = {
                    payBy: pay,
                    origin: `${window.location.origin}`,
                    index: index,
                    amount: amt,
                    funnel: funnel
                }

                if(promo){
                    map.promo = promo.toUpperCase()
                 }

                const res = await stripeBuyCredit(map);

                const data = res.data as any;
                const status = data.status
                const sessionId = data.sessionId

                if(status === 200){
                    await stripe?.redirectToCheckout({
                        sessionId: sessionId
                    })
                }else{
                    // show error message
                    setOpen(true)
                }

            }catch(error){
                setOpen(true)
            }

        }

        setLoading(false)

    }

    const onChangeHandle = (event: ChangeEvent<HTMLInputElement>, value: string) => {
        setPay(value)
    }


    

    const onChangeCheck = (event: ChangeEvent<HTMLInputElement>, checked: boolean) => {
        setCheck(checked)
    }


    return <>

        <Box position="relative" display="flex" justifyContent="center" >

            <Box  maxWidth={900} minWidth={350} width="100vw" bgcolor={cardGray} padding=".85rem 1rem 1rem 1rem" borderRadius="16px 16px 0 0">

                <Box display="flex" >

                    <Typography fontSize={16}  marginBottom={5}>You have <GetCreditBalance fontSize={16} color="black"/></Typography>
            
                    <Box marginLeft="auto" >

            
        
                        { (amt || price) && <FlexBox>

                            <Box marginLeft="auto">

                                <CreditAmount 
                                    amount ={index !== -1 ? price :  ((amt ?? 0) * 100) }
                                />

                            </Box>
                            
                        </FlexBox>}

                        <Button 
                        sx={{marginTop: 2}} 
                        onClick={buyCredits} 
                        disabled={(!price && !amt) || discount === undefined || isLoading || !check}  
                        variant='contained' 
                        color='warning'>

                            { index === -1 ? <>
                                    {
                                        amt ? `Recharge for $${ ((amt * (isPremium ? 0.9 : 1.0))).toFixed(2) }` : "RECHARGE"
                                    }
                                </> : <>
                                    {
                                        (price && discount !== undefined )? `Recharge for $${ ((price * (1.0 - discount)) / 100).toFixed(2) }` : "RECHARGE"
                                    }
                                </>
                            }

                            {
                                isLoading && <CircularProgress size={12} color="secondary"/>
                            }

                        </Button> 

                    </Box>

                </Box>

                <FormControlLabel 
                    sx={{width: "100%" }} 
                    labelPlacement="start" 
                    control={<Checkbox onChange={onChangeCheck} color="warning"/>} 
                    label={
                    <Typography color="error.main" fontSize={12}>
                       I understand that Credit is a non-withdrawable currency.
                    </Typography>
                    } 
                />
                
                <Divider/>
                <ChoosePaymentMethod 
                    onChange={onChangeHandle}
                />

            </Box>

        </Box>

        <CenterSnackBar 
            open={open}
            message={"Unexpected error occur."}
            action={<Button target='_blank' href={TelegramLink}>
                Contact us
            </Button>}
            autoHideDuration={2000}
            onClose={() => setOpen(false)}
        />

    </>
 
}

export default BuyCredit