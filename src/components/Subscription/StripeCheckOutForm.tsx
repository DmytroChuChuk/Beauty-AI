import React, { useEffect, useState, useRef, ChangeEvent } from 'react';
import {loadStripe} from '@stripe/stripe-js';

import {
  Elements,
  useStripe,
} from '@stripe/react-stripe-js';


// import '../../pages/css/FormStyle.scss';
import './StripeCheckOutForm.scss';

import {Button, Card, CardContent, Checkbox, CircularProgress, Grid, LinearProgress, Snackbar, TextField, Typography} from '@mui/material';

import SubscribeCard from './SubscribeCard';

import { customer_id, description, discount, premium, PREMIUM, PROMO, USERS } from "../../keys/firestorekeys"

import { db } from '../../store/firebase';
import { collection, doc, getDoc, getDocs, limit, query, where } from 'firebase/firestore';
import { useHistory } from 'react-router';
import { Helper } from '../../utility/Helper';
import Benefits from '../Subscription/Benefits';
import { useTranslation } from 'react-i18next';
import { Box } from '@mui/system';
import LoadingScreen from '../Loaders/LoadingScreen';
import { useUser } from '../../store';
import { TelegramLink } from '../../keys/contactList';
import { isTEST } from '../../keys/functionNames';
import shallow from 'zustand/shallow';
import CenterFlexBox from '../Box/CenterFlexBox';

export const json : { [id:number] : any } = {0: 59.95, 1: 134.85, 2: 239.70}
export const jsonMonthly :{ [id:number] : any }  = {0: 1, 1: 3, 2: 6}

const CheckoutForm: React.FC<{
    COUPON_ID: string | undefined, priceId: string, customerId: string, finalPrice: any
}> = (({COUPON_ID, priceId, customerId, finalPrice}) => {

    const [
        uid, 
        isBlock
    
    ] = useUser((state) => [
        state.currentUser?.uid,
        state.currentUser?.isBlock
    ], shallow)
    
    const stripe = useStripe();
    const [loading , setLoading] = useState(false)
    const [checked , setCheck] = useState(false)
  
    const { t } = useTranslation()
  
    var handleResult = function(result : any) {
      if (result.error) {
        //(result.error.message);
      }else{
          //success
      }
    };
  
    const onChange = (e: any, checked: boolean) => {
      setCheck(checked)
    }

    if(isBlock) return <></>
  
    return (
      <div>
  
  
      <CenterFlexBox>
  
          <Typography 
              textAlign='center' 
              fontSize={12} 
              component='p'>{t('subscription.disclaimer')}
          </Typography> 
          
          <Checkbox checked ={checked} color="secondary" onChange={onChange}/>
  
          <br/>
  
      </CenterFlexBox>
  
     
          <br/>
  
          <Button 
              type="submit" 
              fullWidth
              disabled={!stripe || !checked} 
              variant="contained" 
              color = "secondary" 
              onClick={() => {
  
              const myPriceId = priceId
              
              setLoading(true)
  
              //trigger http cloud function request
              //create check out session 
              const baseURI = "https://us-central1-rent-a-date-81735.cloudfunctions.net"
  
              let map : {[key: string]: any} = {
                  priceId: myPriceId,
                  customerId: customerId,
                  uid: uid,
                  origin: window.location.origin
              }
  
              if(COUPON_ID) map["COUPON_ID"] = COUPON_ID
  
            
              fetch(`${baseURI}/stripeSubscription${window.location.origin === 'http://localhost:3000' ? 'TEST' : ''}`, {
                  method: "POST",
                  headers: {
                      "Content-Type": "application/json"
                  },
                  body: JSON.stringify(map)
                  }).then(async function(result) {
                      
                      const data = await (result.json());                          
                      stripe?.redirectToCheckout({
                          sessionId: data.sessionId
                      }).then(handleResult)
                       
                  }).catch((err) => {
                      console.log(err)
                  }).finally(() => {
                      setLoading(false)
                  })
          }}>
              Make Payment
          </Button>
  
          {loading ? <LinearProgress color='secondary'/> : null }
  
          <br/>
          <br/>
  
          <Typography  textAlign='center' fontSize={12} 
          component='p'> ${finalPrice} billed today</Typography>
         
  
      </div>
    );
  });

const StripeCheckOutForm: React.FC = () => {

    const [
        uid    
    ] = useUser((state) => [
        state.currentUser?.uid,
    ], shallow)

    const history = useHistory()

    const key = isTEST ? 'pk_test_Wy45sQqUs0fLxhB6Z87PfAUf' : 'pk_live_2MGVUBzqFSWgJgPK1G5sUXqv'
    const stripePromise = loadStripe(key) 

    const finalPriceID = useRef<string>(isTEST ? 
    "price_1LVZn0FwkTcpylgWh0MHO79J" :  "price_1LjaN2FwkTcpylgWqsEqWlD7") // price_1LVZn0FwkTcpylgWh0MHO79J [TEST] | price_1LjaN2FwkTcpylgWqsEqWlD7 [LIVE]


    const [select , setSelect] = useState(1)

    const [finalPrice , setFinalPrice] = useState<any>((Math.round(json[1] / 1 * 100) / 100).toFixed(2))

    const [open , setOpen] = useState<boolean>(false)
    const [loading , setLoading] = useState<boolean>(true)
    const [msg , setMsg] = useState<string>()

    const [customerId , setCustomerId] = useState<string>()
    const [isPremium , setIsPremium]= useState<boolean>()

    const [promoDescription , setDescription] = useState<string | undefined>()
    const [getDiscount , setDiscount] = useState<{ [id:number] : any } >()
    const [COUPON_ID, setCOUPON_ID] = useState<string>()

    const helper = new Helper()
    const isCancel = helper.getQueryStringValue("cancel")

    const [isApplying , setApplying] = useState(false)

    function openToast(_msg: string){
        setOpen(true)
        setMsg(_msg)
    }

    const onClose = () => {
        setOpen(false)
    }

    useEffect(() => {
        config()
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    async function config(){
        if(uid) getDocument(uid)
        else history.push("/Login", {openSubscribePage: true})
    }

    async function getDocument(uid: string){
        
        getDoc(doc(db, USERS, uid)).then(async (docu) => {

            const _customerId = docu.get(customer_id) as string 
            setCustomerId(_customerId)

            const snapShot = await getDoc(doc(db, PREMIUM, uid))
            const _premium = snapShot.get(premium) as boolean 

            setIsPremium(_premium)

            if(_premium){
                try{

                    await fetch("https://us-central1-rent-a-date-81735.cloudfunctions.net/goToPortal", 
                    {   
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        
                        body: JSON.stringify({
                            customer: _customerId,
                            return_url: window.location.origin
                        })
    
                        }).then(async function(result) {
                    
                            const data = await (result.json());
                            window.location.assign(data.sessionId)
    
                        }).catch((err) => {
                            console.log(err)
                    })

                }catch(error){
                    console.log(error)
                }

            }else{

                // check if got discount ?

                const snapShots = await getDocs(query(collection(db, PROMO) , where('default' , '==', true), limit(1)))

                if(snapShots.docs.length === 1){

                    const _doc = snapShots.docs[0]
                    const _discount = _doc.get(discount) as { [id:number] : any } | undefined

                    const _description = _doc.get(description) as string | undefined
                    
                    setDescription(_description)
                    setDiscount(_discount)
                    setCOUPON_ID(_doc.id.trim().toUpperCase())
                  
                    if(_discount && Object.keys(_discount).length > 2){
                        const cost = ((Math.round(json[1] * _discount[1] * 100) / 100).toFixed(2))  
                    
                        setFinalPrice(cost)
                    }
     
                }

            }

            setLoading(false)

            if(isCancel === 'cancel'){
                openToast("Unsuccessful subcription. Try again.")
            }

        })
    }

    const onChangeHandle = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const v = ((e.target as HTMLInputElement).value)
        setCOUPON_ID(v.trim().toUpperCase())
      }
    
      const onApply = async () => {
    
        if(!COUPON_ID) return
    
        setApplying(true)
    
        const _doc = await getDoc(doc(db, PROMO, COUPON_ID))

        if(_doc.exists()){

            const _discount = _doc.get(discount) as { [id:number] : any } | undefined
            const _description = _doc.get(description) as string | undefined
                
            setDescription(_description)
            setDiscount(_discount)

        }else openToast("Invalid promo code")
        

        setApplying(false)
    
    }

    const onSelect = (i: number, pid: string, finalPrice: any) => {
        setSelect(i)
        finalPriceID.current = pid
        setFinalPrice(finalPrice)
    }


  if(loading || !uid) return  <LoadingScreen/>

  return <Box flexDirection='column' className='flex align-center justify-center'>

        {

            promoDescription ? <>
              <br/>
                <Card sx={{backgroundColor: '#000', boxShadow: '0px 1px 8px 4px #40ccff'}}>
                    <CardContent>
                        <Typography fontWeight='bolder' color='primary.main'>{promoDescription}</Typography>
                    </CardContent>
                </Card>
                <br/>
            </> : null
        }

        {loading || isPremium ? null : 

            <Card sx={{margin: '.5rem', minWidth: 275, backgroundColor: '#f4f7f8', borderRadius: '1rem', border: '1px solid #000' }}>

               <CardContent >

                <div className='flex align-center justify-center'>
                    <Benefits />
                </div>

                <br/>
                <br/>

                <Grid container direction="row" spacing={1}>
                    <SubscribeCard 
                        key={0} 
                        index={0}
                        select = {select}  
                        onSelect={onSelect}
                        priceID={window.location.origin === 'http://localhost:3000' ? 
                            "price_1LVZgKFwkTcpylgWgMHfbsv7" : "price_1LjGb4FwkTcpylgWSDEqKloV"
                        } // price_1LVZgKFwkTcpylgWgMHfbsv7 [TEST] | price_1LjGb4FwkTcpylgWSDEqKloV [LIVE]
                        discount={getDiscount?.[0]}
                    />
                    
                    <SubscribeCard 
                        key={1} 
                        index={1}  
                        select = {select} 
                        onSelect={onSelect}
                        priceID={window.location.origin === 'http://localhost:3000' ? 
                            "price_1LVZn0FwkTcpylgWh0MHO79J" : "price_1LjaN2FwkTcpylgWqsEqWlD7"
                        } // price_1LVZn0FwkTcpylgWh0MHO79J [TEST] | price_1LjaN2FwkTcpylgWqsEqWlD7 [LIVE]
                        discount={getDiscount?.[1]}
                    />
                    
                    <SubscribeCard 
                        key={2} 
                        index={2} 
                        select = {select}   
                        onSelect={onSelect}
                        priceID={window.location.origin === 'http://localhost:3000' ? 
                            "price_1LVZhaFwkTcpylgW6lhZt0Oa" : "price_1LjaNIFwkTcpylgW32d5Lktm"
                        } // price_1LVZhaFwkTcpylgW6lhZt0Oa [TEST] | price_1LjaNIFwkTcpylgW32d5Lktm [LIVE]
                        discount={getDiscount?.[2]}
                    />
                </Grid>
                
                <br/>

                {!customerId ? <div>

                    <label>Something wrong with your account. Please contact us.</label>
                    <Button color="secondary" onClick={() => {
                        window.open(TelegramLink, "_blank")
                    }} variant="contained">CONTACT US</Button>
                </div> : <div>

                    <Box display='flex' justifyContent='center' alignItems='center'>
                        
                        <TextField
                            inputProps={{style: 
                                { 
                                    textAlign: 'center', 
                                    background:'white', 
                                    textTransform: "uppercase" 
                                }
                            }}
                            value={COUPON_ID}
                            autoComplete='off'
                            size='small'
                            fullWidth 
                            variant='outlined' 
                            color='secondary' 
                            placeholder='PROMO CODE'
                            onChange={onChangeHandle}
                        />
                
                        <Box width='60px' minWidth= '60px' display='flex' justifyContent='center' alignItems='center'>
                
                        { isApplying ? <CircularProgress size={19} color='secondary'/> : 
                            <Button disabled={!COUPON_ID} 
                                size='small' 
                                onClick={onApply} 
                                variant='text' 
                                color='secondary'>APPLY</Button>
                        }
                
                        </Box>
                
                    </Box>

                    <Elements stripe={stripePromise}>
                        <CheckoutForm
                            COUPON_ID={COUPON_ID} 
                            priceId ={finalPriceID.current} 
                            customerId = {customerId!} 
                            finalPrice={finalPrice}
                        />
                    </Elements>

                </div>}

                <Snackbar
                    anchorOrigin = 
                        {{vertical: 'bottom', horizontal: 'center'}}
                    open={open}
                    onClose={onClose}
                    message={msg}
                    autoHideDuration={2000}
                />
                </CardContent>
            </Card>
        }

  </Box>
  

}

export default StripeCheckOutForm
