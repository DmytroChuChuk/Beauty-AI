import {  Box, Grid, Skeleton} from '@mui/material';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { doc, getDoc } from 'firebase/firestore';
import { FC, useEffect, useState } from 'react';
import shallow from 'zustand/shallow';
import CenterFlexBox from '../../components/Box/CenterFlexBox';
import BuyCredit from '../../components/Coin/Credit/BuyCredit';
import {CreditCardView} from '../../components/Coin/Credit/CreditCardView';
import PageHeader from '../../components/Headers/PageHeader';
import MyAppBar from '../../components/MyAppBar';

import { COINS, PROMO, USERS } from '../../keys/firestorekeys';
import { isTEST } from '../../keys/functionNames';
import { useUser } from '../../store';
import { db } from '../../store/firebase';
import LoginPage from '../LoginPage';
import PaymentInput from '../../components/TextField/PaymentInput';

const SkeletonCard : FC = () => {
    return <Grid item xs={2} sm={4} md={4} borderRadius={4} >
       <Skeleton 
            variant="rectangular"
            sx={{borderRadius: 4}}
            height={150}
        />
    </Grid>
}


const CreditPage : FC = () => {

    interface promoMap {
        [key: string] : {
            [amt: string]: number
        }
    }

    const [_uid, isPremium, isBlock] = useUser((state) => [
        state.currentUser?.uid, 
        state.currentUser?.isPremium,
        state.currentUser?.isBlock
    ], shallow)

    const key = isTEST ? 'pk_test_Wy45sQqUs0fLxhB6Z87PfAUf' : 'pk_live_2MGVUBzqFSWgJgPK1G5sUXqv'
    const stripePromise = loadStripe(key)
    

    const [loading, setLoading] = useState<boolean>(true)
    const [amt, setAmt] = useState<number>()
    
    //const [promo, setPromo] = useState<string>()
    const [ promoMapState, setPromoMapState] = useState<promoMap | undefined>(undefined) 

    const [discountState, setDiscountState] = useState<number>(0)
    // const [promoDescription, setDescription] = useState<string>()
    const [functionName, setName] = useState<string>()

    const [select, setSelected] = useState<number>(-1)

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {

        const v = event.target.value
        const num = parseInt(v)

        setAmt(num)
    };
    


    useEffect(() => {

        setLoading(false)

        const docId = isPremium ? `${COINS}2` : `${USERS}2`

        getDoc(doc(db, PROMO, docId)).then((_doc) => {

            if(_doc.exists()){
                
                // const _discount = _doc.get(discount) as number
                const _promoMap = _doc.get("6x6") as promoMap
                //const _description = _doc.get(description) as string
                const _name = _doc.get("name") as string

                setPromoMapState(_promoMap)
                //setDescription(_description)
                setDiscountState(_promoMap[0]["discount"] as number)
                setName(_name)
                
            }

        }).finally(() => {
            setLoading(false)
        })


    } , [isPremium])

    const onClick = (index: number) => {

        if(!promoMapState) return 

        const dis = promoMapState[index]["discount"] as number
        setSelected(index)

        setDiscountState(dis)
    }



    const onCustomClick = () => {
        setSelected(-1)
    }

    // const onHandleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    //     const _value = e.currentTarget.value
    //     setPromo(_value)
    // }

    if (isBlock) return <></>

    else if(!_uid) return <LoginPage/>

    else return <Box
            display="flex" 
            flexDirection="column" 
            alignItems="center"
            justifyContent="center" 
            className="chat-background" 
            padding={1} 
            width="100%"
            overflow="auto"
        >

        <MyAppBar/>

        <PageHeader 
            title="Credit Recharge"
        />


        {/* {(promoDescription && !isPremium) && <Button variant='contained'
                sx={{backgroundColor: "black!important", color: "white", marginBottom: "16px"}}
                onClick={() => {
                    const helper = new Helper()
                    helper.upgradePremium(_uid)
                }}
            >Get 10% more credits & NO transaction fees</Button>
        } */}

            <CenterFlexBox marginBottom={2} width="100%" sx={{backgroundColor: "white"}}>

                <PaymentInput
                    sx={{
                        width: "100%", 
                        maxWidth: 300,
                        marginBottom: 2
                    }}
                    margin='dense'
                    autoFocus
                    focused
                    autoComplete="off"
                    size="medium"
                    color='secondary'
                    onChange={handleChange}
                    placeholder="Enter amount $$$"
                    onClick={onCustomClick}
                />

            </CenterFlexBox>

            <Grid
                container
                sx={{backgroundColor: "white"}}
                maxWidth={600}
                spacing={{ xs: 1, sm: 2, md: 3}} 
                columns={{ xs: 6, sm: 12, md: 12 }}
            >
            <>

                {
                    !loading && promoMapState && functionName ? <>

                        {/* <CustomAmtCardView 
                            isSelected={select === -1}
                            onClick={onCustomClick}
                            //onClick={() => setSelected(-1)}
                        /> */}

                        {
                            Object.entries(promoMapState).map((value, index) => {

                                return <CreditCardView
                                        key={index}
                                        index={index}      
                                        isSelected={select === index}
                                        discount={value[1]["discount"] as number}
                                        amount={value[1]["amt"] as number}
                                        onClick={onClick}
                                    />

                                
                            })
                        }

                    
                    </> : 

                    <>{
                        [1, 2, 3, 4, 5, 6].map((key) => {
                            return <SkeletonCard key={key}/>
                        })
                    }</> 
                }
            </>

            </Grid>

        <Box width="100%" height={400}/>
            <CenterFlexBox flexDirection="column" position="fixed" bottom="0">
                <Elements stripe={stripePromise}>
                    <BuyCredit
                        promo={undefined}
                        functionName={functionName}
                        index={select}
                        discount={discountState}
                        price={promoMapState?.[`${select}`]?.["amt"] as number | undefined}
                        customAmount={amt}
                    />
                </Elements>
            </CenterFlexBox>               
        </Box>
 
}

export default CreditPage