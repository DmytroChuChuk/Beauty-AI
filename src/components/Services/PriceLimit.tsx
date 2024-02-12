import {
    ChangeEvent,
    FC,
    useEffect,
    useState,
} from 'react';
import {
    Box,
    Slider,
    DialogContentText,
    SliderProps,
    FormControl,
    FormControlLabel,
    Radio,
    RadioGroup,
    Divider
} from '@mui/material';
import DialogToolbar from '../Dialogs/components/DialogToolbar';
import CenterFlexBox from '../Box/CenterFlexBox';
import PaymentInput from '../TextField/PaymentInput';
import { operator } from '../../enum/MyEnum';

import { 
    USERS,
    operatorKey, 
    spendLimitKey, 
    walletLimitKey, 
    priceLimit as priceLimitKey 
} from '../../keys/firestorekeys';

import LimitWarning from './component/LimitWarning';
import { useUser } from '../../store';
import shallow from 'zustand/shallow';
import { deleteField, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../store/firebase';
import history from '../../utility/history';
import LoadingScreen from '../Loaders/LoadingScreen';
import LoginPage from '../../pages/LoginPage';

const DiscreteSliderMarks : FC<SliderProps> = ({...props}) => {
const marks = [
    {
        value: 0,
        label: '0',
    },
    {
        value: 50,
        label: '50',
    },
    {
        value: 100,
        label: '100',
    },
    {
        value: 200,
        label: '200',
    },
    ];
    


return (
    <Box  width={300} padding={2}>
    <Slider
        {...props}
        color="secondary"
        step={5}
        valueLabelDisplay="auto"
        marks={marks}
        min={0} 
        max={200}
    />
    </Box>
);
}

export interface PriceLimitProps {
    [operatorKey]?: operator | undefined
    [walletLimitKey]?: number
    [spendLimitKey]?: number
}

interface props {
    loading: boolean
    value: PriceLimitProps | undefined
}


const PriceLimit : FC<props> = ({loading, value}) => {
    
    const [ myUUID ] = useUser((state) => [state?.currentUser?.uid], shallow)

    // const location = useLocation<props | undefined>()
    // const value = location?.state?.value
    const defaultWalletLimit = value?.[walletLimitKey] ?? 0
    const defaultSpendLimit = value?.[spendLimitKey] ?? 0
    const defaultOperator = value?.[operatorKey] ?? operator.either

    const [isLoading, setLoading] = useState<boolean>(false)
    const [operatorState, setOperator] = useState<operator | undefined>(defaultOperator)
    const [walletLimit, setWalletLimit] = useState<number | undefined>(defaultWalletLimit/100)
    const [spendLimit, setSpendLimit] = useState<number | undefined>(defaultSpendLimit/100) 

    const [valueState, setValue] = useState<PriceLimitProps | undefined>(value)

    const onChangeHandle = (event: ChangeEvent<HTMLInputElement>, value: string) => {
        setOperator(parseInt(value))
    }

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {

        const v = event.target.value
        const _amt = parseFloat(v)
        setSpendLimit(_amt)
    };

    useEffect(() => {
        if(!spendLimit || !walletLimit){
            setOperator(undefined)
        }

        let map : {[key: string] : any} = {}
        let hasAdded = 0
        if(walletLimit && !isNaN(walletLimit)) {
            hasAdded +=1
            map[walletLimitKey] = walletLimit * 100
        }
        if(spendLimit && !isNaN(spendLimit)){
            hasAdded += 1
            map[spendLimitKey] = spendLimit * 100
        } 

        if(operatorState !== undefined && !isNaN(operatorState)){ 
            map[operatorKey] = operatorState
        }else if(hasAdded > 1){
            map[operatorKey] = operator.either
        }  

        setValue(Object.keys(map).length === 0 ? undefined : map)
        // eslint-disable-next-line
    } , [spendLimit, walletLimit, operatorState])

    const onDoneClick = async (e: any) => {

        if(myUUID){
            setLoading(true)
            // let _value = valueState
            // if(_value?.[walletLimitKey] && _value?.[walletLimitKey] > 0){
            //     _value[walletLimitKey] = _value[walletLimitKey] * 100
            // }

            // if(_value?.[spendLimitKey] && _value?.[spendLimitKey] > 0){
            //     _value[spendLimitKey] = _value[spendLimitKey] * 100
            // }

            await updateDoc(doc(db, USERS, myUUID), {
                [priceLimitKey]: valueState ? valueState : deleteField()
            })
            setLoading(false)
        }

        onClose()
    }

    const onClose = () => {
        history.goBack()
    }

    if(!myUUID) return <LoginPage dontRedirect/>
    else if(loading) return <LoadingScreen/>
    else return <Box height="100vh" width="100%">

         <DialogToolbar
            title='Add price limit'
            onDoneClick={onDoneClick}
            onBackClick={onClose}
            isLoading={isLoading}
         />
  
         <Box height="100vh" padding={2}>

            <CenterFlexBox>
                <Box maxWidth={800}>
                
                    <DialogContentText>Credit balance in wallet </DialogContentText>
                    <DiscreteSliderMarks
                        defaultValue={defaultWalletLimit/100}
                        getAriaValueText={(value) => {
                            setWalletLimit(value)
                            return `${value}`
                        }}
                    />

                    <DialogContentText>Total credit spent on platform</DialogContentText>
                    <br/>
                    <PaymentInput
                        defaultValue={`${defaultSpendLimit/100}`}
                        fullWidth
                        onChange={handleChange}
                        color="secondary"
                        variant='standard'
                    />


                {(walletLimit && spendLimit) ?
                    <>
                        <br/>
                        <FormControl>

                            <RadioGroup 
                                row
                                onChange={onChangeHandle}
                                defaultValue={operatorState}
                            >
                            <FormControlLabel value={operator.either} control={<Radio size='small' color="secondary"/>} 
                                label="Either one of the criteria"/>
                            <FormControlLabel value={operator.both} control={<Radio size='small' color="secondary"/>} 
                                label="Both criteria"/>

                            </RadioGroup>
                        </FormControl>
                    </> 
                    : null}

                    <br/>
                    <br/>

                    { (walletLimit || spendLimit) ? <>
                        {(walletLimit && spendLimit) ? <Divider/> : null}
                        <br/>
                        <DialogContentText>Preview message to client:</DialogContentText>

                        <LimitWarning 
                            walletLimit={(walletLimit ?? 0) * 100}
                            operatorState={operatorState}
                            spendLimit={(spendLimit ?? 0) * 100}
                        />

                    </> : null} 
                    { !(walletLimit || spendLimit) ? 
                    <DialogContentText variant='caption'>You can restrict user from starting a conversation with you based on their spending habits or amount of credit balance left in their wallet. These prevent spammed messages and getting more quality clients.
                    </DialogContentText> : null}
                </Box>
            </CenterFlexBox>

         </Box>

    </Box>
 
}

export default PriceLimit