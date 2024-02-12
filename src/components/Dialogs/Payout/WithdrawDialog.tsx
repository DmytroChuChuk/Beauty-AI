import {
    ChangeEvent,
    FC,
    useEffect,
    useState,
} from 'react';
import {
    Dialog,
    DialogProps,
    DialogContent,
    DialogActions,
    CircularProgress,
    FormControl,
    FormControlLabel,
    Radio,
    RadioGroup,
    DialogContentText,
    Typography,
    Button,
    Chip,
    LinearProgress,
    TextField,
    Divider
} from '@mui/material';
import PaymentInput from '../../TextField/PaymentInput';
import { Box } from '@mui/system';
import FlexGap from '../../Box/FlexGap';
import BindPhoneDialog from './Binding/BindPhoneDialog';
import { useDocumentQuery } from '../../../hooks/useDocumentQuery';
import { useUser } from '../../../store';
import { collection, doc, getDocs, limit, query, Timestamp, updateDoc, where } from 'firebase/firestore';
import { db, functions } from '../../../store/firebase';
import {  
    PAGE, 
    PHONE, 
    USERS  
} from '../../../keys/firestorekeys';

import {  
    currency, 
    email, 
    name, 
    paynow, 
    legalName as legalNameKey,  
    dob as dobKey
} from '../../../keys/firestorekeys';

import { httpsCallable } from 'firebase/functions';
import CenterSnackBar from '../../../chats/components/Snackbar/CenterSnackBar';
import shallow from 'zustand/shallow';
import Google from '../../Buttons/Google';
import MobileTooltip from '../../Tooltip/MobileTooltip';
import { useTranslation } from 'react-i18next';
import CurrencySelect from '../../adminpage/components/CurrencySelect';
import { useWindowSize } from '../../../hooks/useWindowSize';
import { moveIncomeToCashFunction } from '../../../keys/functionNames';
import FlexBox from '../../Box/FlexBox';
import DateOfBirth from '../../adminpage/components/DateOfBirth';
import DefaultTooltip from '../../Tooltip/DefaultTooltip';

interface props extends DialogProps {
    income: number
    penalty: number
    onClose: () => void
}

enum withdrawByEnum {
    paynow = 0,
    transferwise=1
}

const WithdrawDialog : FC<props> = ({ income, penalty, onClose, ...props}) => {

    const withdrawMinLimit: {
        [currency: string]: number
      } = {
        "SGD": 5,
        "PHP": 20,
        "MYR": 10,
        "COP": 30,
        "KRW": 5
      };

    const [ size ] = useWindowSize()
    const { t } = useTranslation()
    
    const setCurrentUser = useUser((state) => state.setCurrentUser)
    const [
        uid, 
        nickname, 
        myEmail, 
        clubName, 
        dateOfBirth, 
        userCurrency, 
        legalName
    ] = useUser((state) => [
        state?.currentUser?.uid, 
        state?.currentUser?.nickname, 
        state?.currentUser?.email, 
        state?.currentUser?.club,
        state?.currentUser?.dateOfBirth,
        state?.currentUser?.currency,
        state?.currentUser?.legalName
    ], shallow)

    const [ isLoading, setLoading ] = useState<boolean>(false)

    const [ open, setOpen ] = useState<boolean>(false)
    const [ check, setCheck ] = useState<withdrawByEnum | undefined>(undefined)
    const [ price, setPrice ] = useState<number>(0)

    const [ dob, setDOB ] = useState<Date | undefined>(dateOfBirth ? new Date(parseInt(dateOfBirth)) : undefined)
    const [ myLegalName, setMyLegalName ] = useState<string | null | undefined>(legalName ? legalName  : undefined)
    const [ openSB, setSnackbar ] = useState<boolean>(false)
    const [ msg, setMsg ] = useState<string>()
    const [ currencyState, setCurrency ] = useState<string | null | undefined>(userCurrency)

    const { loading, data } = useDocumentQuery(`${uid}-phone`, doc(db, PHONE, `${uid}`))

    const withdrawDefaultLimit = check === withdrawByEnum.paynow ? 5 : 20
    const widthLimit = 420

    const withdrawLimitState = withdrawMinLimit[currencyState ?? ""] ?? withdrawDefaultLimit
    const cannotServePenalty = (price < penalty) || (price - penalty < withdrawLimitState)

    useEffect(() => {
        if(data?.exists()){
            const myPayNow = data.get(paynow) as string | undefined
            if(myPayNow){
                setCurrentUser({paynow: myPayNow})
                localStorage.setItem(paynow, myPayNow)
            }else{
                setCurrentUser({paynow: null})
                localStorage.removeItem(paynow)
            }
        }
        // eslint-disable-next-line 
    }, [data])


    const onCloseHandle = () => {
        setPrice(0)
        setCheck(undefined)
        setCurrency(undefined)
        onClose()
    }

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value
        setPrice(parseFloat(value ?? "0"))
    }

    function roundedTwoDecimal (value: number){
        return Math.round((value + Number.EPSILON) * 100) / 100
    }

    function openSnackbar(msg: string){
        setMsg(msg)
        setSnackbar(true)
    }

    function fees(value:number | undefined){

        if(!value) return ""

        const final = value * 0.25 + 0.29
        const _value = roundedTwoDecimal(final)
        if(penalty){
            return `Withdraw fees: SGD ${_value} + ${penalty.toFixed(2)} (Penalty).`
        }else return `Withdraw fees: SGD ${_value}.`
    }

    const withdraw = async () => {
         
        if(check === undefined){
            setMsg("Choose PayNow or Wise")
            setSnackbar(true)
            return
        }

        if(!price || check === undefined) {
            return
        }

        if(check === withdrawByEnum.transferwise){
            if(!currencyState){
                setMsg("Country is required")
                setSnackbar(true)
                return
            }

            if(currencyState === "SGD"){
                setMsg("Singapore is unavailable, please use PayNow instead")
                setSnackbar(true)
                return
            }

            if(!myLegalName){
                setMsg("Full name is required")
                setSnackbar(true)
                return
            }

            if(!dob){
                setMsg("Date of birth is required")
                setSnackbar(true)
                return
            }

            if(!uid){
                setMsg("Please login")
                setSnackbar(true)
                return
            }
        }


        const withdrawCurrency = currencyState ?? "SGD"

        const _value = roundedTwoDecimal(price)
        const _withdrawMinLimit = withdrawMinLimit[withdrawCurrency] ?? 5

        if(_value > 500 || _value < _withdrawMinLimit){
            const msg = `Max. 500.00 | Min. ${(withdrawMinLimit[currencyState ?? ""] ?? withdrawDefaultLimit)}.00`
            setMsg(msg)
            setSnackbar(true)
            return
        }

        setLoading(true)
        const moveIncomeToCash = httpsCallable(functions, moveIncomeToCashFunction);

        try{

            let map : {[key: string]: any} = {
                nickname: nickname,
                amount: _value,
                payBy: check,
                email: myEmail
            }

            if(currencyState){
                map.currency = currencyState
            }else{
                map.currency = "SGD"
            }

            if(clubName){
                // get club email address
                const snapshot = await getDocs(query(collection(db, PAGE), where(name, "==", clubName), limit(1)))
                if(snapshot.docs.length > 0){
                    const _doc = snapshot.docs[0]
                    if(_doc.exists()){
                        const clubEmail = _doc.get(email) as string
                        const _clubCurrency = _doc.get(currency) as string
                        const _clubPayNow = _doc.get(paynow) as string
                        const clubMap: {
                            [key: string]: any
                        } = {
                            name: clubName,
                            crry: _clubCurrency,
                            email: "",
                            paynow: ""
                        }

                        if(clubEmail && _clubCurrency !== "SGD"){
                            clubMap[email] = clubEmail
                        }else if(_clubPayNow && _clubCurrency === "SGD"){
                            clubMap[paynow] = _clubPayNow
                        } 
                        map.club = clubMap
                    }
                }
            }

            // add update doc
            let promises:Promise<any>[] = []
            if(check === withdrawByEnum.transferwise && uid ){

                let userMap : {[key: string]: any} = {}
                if(myLegalName && !legalName){
                    userMap[legalNameKey] = myLegalName
                }

                if(dob && !dateOfBirth){
                    userMap[dobKey] = Timestamp.fromDate(dob)
                }

                if(currencyState && (userCurrency !== currencyState)){
                    userMap[currency] = currencyState
                }

                if(Object.keys(userMap).length > 0) {
                    console.log(userMap)
                    const update = updateDoc(doc(db, USERS, uid), userMap)
                    promises.push(update)
                }
            }
            
            if(check === withdrawByEnum.transferwise){
                if(myLegalName){
                    map.legalName = myLegalName
                }
                if(dob){
                    map.dob = `${dob.getTime()}`
                }
            }

            const data = moveIncomeToCash(map)
            promises.push(data)

            await Promise.all(promises)

            openSnackbar("Success")
            onClose()
            setPrice(0)

        }catch(error){
            console.log(error)
            openSnackbar("Unexpected error")
        }finally{
            setLoading(false)
        }

    }

    function censor (value: string | null | undefined){
        if(!value) return ""

        const length = (value.length / 2)
        return `${value.slice(0, -length)}****`
        
    }

    const onChangeTextHandle = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const v = e.currentTarget.value as string
        setMyLegalName(v)
    }


    // isLoading ? true : check === undefined ? true : (price > income || 
    //     cannotServePenalty ||
    //     !price) 


    return <>

        <Dialog fullWidth={size.width > widthLimit} fullScreen = {size.width <= widthLimit} {...props}>

            {isLoading && <LinearProgress color="warning" />}            
            <DialogContent>

                <DialogContentText 
                    fontSize={14}
                    dangerouslySetInnerHTML={{ __html: `${t("withdraw.hint")}`}}
                />

                <br/>

                <PaymentInput
                    fullWidth
                    disabled={!income}
                    onClick={() => {
                        if(!income){
                            setMsg("Your Credit Income is empty")
                            setSnackbar(true)
                        }
                    }}
                    error={!income}
                    helperText={!income ? <>
                        <Typography fontSize="inherit" variant='inherit'>
                            Your credit income is empty&nbsp;
                     
                            <MobileTooltip title={t("credit.income")}>
                                <img
                                    width={12}
                                    height={12}
                                    src="https://images.rentbabe.com/assets/question.svg"
                                    alt=""
                                />
                            </MobileTooltip>
                        </Typography>
                    </> : !price ? <Typography color="error" fontSize="inherit" variant='inherit'>*{t("withdraw.warning")}</Typography>: ""}
                    margin='dense'
                    variant='standard'
                    color="warning"
                    placeholder='Withdraw amount'
                    autoComplete='off'
                    onChange={handleChange}
                />

                <br/>

                {price && ((price > income) || cannotServePenalty ) ?
                <Typography color="error.main" fontSize={12} variant='caption'>
                    {price && cannotServePenalty ? `Min. ${penalty + withdrawLimitState} Income Credits ${(penalty > 0) ? "due to penalty" : ""}` : "Insufficient income"}
                    </Typography> : <>
                    {(!(price > 0 && (price > 500 || price <  withdrawLimitState ))) && 
                        <Typography color="error.main" fontSize={12} variant='caption'>{fees(price)}</Typography> }
                    
                        {price && !(price > 0 && (price > 500 || price < withdrawLimitState )) ? <>
                            <br/>
                            <Typography color="error.main" fontSize={12} variant='caption'>{
                            `Estimated bank transfer: ${new Date().getEstimatedBankTransferDate()}.`
                        }</Typography>
                        </> : null}
                    
                    {(check !== undefined 
                    && price > 0 
                    && (price > 500 || price < (withdrawMinLimit[currencyState ?? ""] ?? 5))) &&
                    <Typography color="error.main" fontSize={12} variant='caption'>Max. 500.00 | Min. 
                    {(withdrawMinLimit[currencyState ?? ""] ?? withdrawDefaultLimit)}.00</Typography>}
                
                </>
                
                }
                
                <br/>
                <FormControl>
                    
                    <RadioGroup
                    onChange={(_, value) => setCheck(parseInt(value))}
                    >
                    <Typography color="text.secondary"  variant='caption'>Singapore Bank Account (DBS, OCBC, UOB, etc.)</Typography>
                    <FormControlLabel
                        value={withdrawByEnum.paynow} 
                        disabled ={loading || data?.get(paynow) ? false : true}
                        control={<Radio color="warning" icon={loading ? <CircularProgress size={12} color= "warning"/> : undefined}/> } 
                        label={
                            <Box display="flex">
                                <Typography variant='body2'>
                                    PayNow <b>{ censor(data?.get(paynow) as string) }</b>
                                </Typography>

                                <FlexGap/>

                                <Chip 
                                    onClick={() => setOpen(true)}
                                    disabled={loading} 
                                    color='warning' 
                                    size="small" 
                                    style={{boxShadow: " 1px 2px 5px #666"}}
                                    label={data?.get(paynow) ? "Disconnect" : "Connect"}
                                />
                            </Box>
    
                        }
                    />
                <Typography color="text.secondary" variant='caption'>Bank Account <b>outside</b> of Singapore (TnG, BCA, GCash, etc)</Typography>
                    <FormControlLabel

                        disabled = {myEmail ? false : true}
                        value={withdrawByEnum.transferwise}
                        control= {<Radio color="warning"/> }  
                        label={
                            <Box>
                                <FlexBox alignItems="center">

                   
                                <img
                                    height={12}
                                    src="https://images.rentbabe.com/assets/logo/wise.svg"
                                    alt=""
                                />
                             
                                <FlexGap/>

                                <Google
                             
                                    size="small"   
                                />

                                <FlexGap/>

                                </FlexBox>

                            </Box>

                        }
                    />
                    </RadioGroup>
                </FormControl>
            
                <br/>

                {
                    check === withdrawByEnum.transferwise && <Box marginTop={2}>
                        <Divider/>
                        <Typography marginTop={1}>Bank Account Details <DefaultTooltip
                            width={12}
                            url = "https://images.rentbabe.com/assets/question.svg"
                            title = "Please enter your real legal name and date of birth to prevent any Bank Transfer delay."
                        /></Typography>

                        <br/>

                        <FlexBox marginTop={1}>
                            <TextField
                                fullWidth
                                size='small'
                                autoComplete='none'
                                color="secondary"
                                label="Full Legal Name"
                                required
                                value={myLegalName}
                                error={!myLegalName}
                                onChange={onChangeTextHandle}
                            />

                            <FlexGap gap={5}/>

                            <DateOfBirth 
                                DOB={dob ? Timestamp.fromDate(new Date(dob)) : undefined} 
                                onChange={(date) => {
                                    setDOB(date)
                                }}                        
                            />
                        </FlexBox>

                        <br/>

                        <CurrencySelect
                            title="Country"
                            currency={currencyState}
                            required={currencyState ? false : true}
                            onChange={(value) => {
                                setCurrency(value.currencyCode)
                            }}
                        />

                    </Box>
                }
                
            </DialogContent>

            <DialogActions>
                <Button disabled={isLoading} color="warning" onClick={onCloseHandle}>{t("cancel")}</Button>
                <Button 
                endIcon={isLoading && <CircularProgress size={12} color="warning"/>}
                disabled={
                    isLoading ? true : (price > income || 
                    cannotServePenalty ||
                    !price) 
                } color="warning" onClick={withdraw}>{t("withdraw")}</Button>
            </DialogActions>

        </Dialog>

        { !loading && <BindPhoneDialog
            paynowNumber = {data?.get(paynow) as string}
            limit = {data?.get("count") as Timestamp[]}
            hasBind={ data?.get(paynow) ? true : false } 
            open={open}
            onClose={() => setOpen(false)}        
        />}

        <CenterSnackBar
            open={openSB}
            autoHideDuration={2000}
            onClose={() => setSnackbar(false)}
            message={msg}
        />
    
    </>
 
}

export default WithdrawDialog