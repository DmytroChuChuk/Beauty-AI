import { FC, useEffect, useState } from 'react';
import { styled } from '@mui/material/styles';

import { 
    Box, 
    Button, 
    Checkbox, 
    Divider, 
    MenuItem, 
    Select, 
    SelectChangeEvent, 
    TextField, 
    Typography 
} from '@mui/material';

import { Units } from '../../enum/MyEnum';
import FlexGap from '../Box/FlexGap';
import PaymentInput from '../TextField/PaymentInput';
import { detailProps, servicesProps, ServiceType } from '../../keys/props/services';

import './scss/ServiceGrid.scss'
import { ServicesHelper } from '../../utility/ServicesHelper';
import { Timestamp } from 'firebase/firestore';
import MobileTooltip from '../Tooltip/MobileTooltip';
import CenterFlexBox from '../Box/CenterFlexBox';
import CenterSnackBar from '../../chats/components/Snackbar/CenterSnackBar';
import { useTranslation } from 'react-i18next';
import InviteDDDialog from './component/InviteDDDialog';
import FlexBox from '../Box/FlexBox';
import UserCardAvatar from '../User/UserCardAvatar';
import RemoveDDUserDialog from './component/RemoveDDUserDialog';

const MySelect = styled((props: any) => <Select {...props} />)(
    () => ({
      fontSize: '12px',
    }),
  );


interface props {
    serviceType: ServiceType
    myServices: servicesProps | undefined
    data: detailProps
    onSelected: (id: string, data: detailProps) => void
    deSelect: (id: string) => void
}

export const DDServiceIndex = "7"

const ServiceGridDD : FC<props> = ({ serviceType, myServices, data, onSelected, deSelect}) => {

    const { t } = useTranslation()
    const index = DDServiceIndex


    // const [
    //     //myUUID, 
    //     profileAtWhichState, 
    //     gender
    // ] = useUser((state) => [
    //     //state.currentUser?.uid, 
    //     state.currentUser?.profileAtWhichState, 
    //     state.currentUser?.gender
    // ])
    const servicesHelper = new ServicesHelper()
    const _service = myServices?.[`${serviceType}`]

    const isSelected = _service?.[index] ? true : false

    //const [openInput, setOpenInput] = useState<boolean>(isSelected)

    const detail = _service?.[index] as detailProps

    const price = detail?.price
    const bio = detail?.bio
    const suffix = detail?.suffix
    const isInvited = detail?.dd ? true : false
    const OtherUUID = detail?.dd

    //const [ OtherUUID, setOtherUUID ] = useState<string | undefined>(detail?.dd)

    // const limit = (profileAtWhichState?.toLowerCase() === "singapore") && gender === genderEnum.female.toString()
    // && serviceType === ServiceType.meetup.valueOf() ? 20  : 1

    const [selected, setSelected] = useState<boolean>(isSelected)
    const [openDialog, setOpenDialog] = useState<boolean>(false)
    const [openRemoveDialog, setRemoveDialog] = useState<boolean>(false)

    const [priceState, setPrice] = useState<string | undefined>( price ? (price / 100)?.toFixed(2).toString() : undefined)
    const [bioState, setBio] = useState<string | undefined>(bio)
    const [suffixState, setSuffix] = useState<number | undefined>(suffix ?? servicesHelper.getDefaultSuffix(serviceType))
    // const [error, setError] = useState<boolean>(
    //     parseFloat(priceState ?? "") < limit ? true : false
    // )
    const [focusPrice, setFocusPrice] = useState<boolean>(false)

    const [alertMsg, setAlertMsg] = useState<string>()
    const [openAlert, setOpenAlert] = useState<boolean>(false)


    const _price = priceState ? parseFloat(priceState) * 100 : undefined

    function alert(msg: string){
        if(!msg) return
        setAlertMsg(msg)
        setOpenAlert(true)
    }

    useEffect(() => {

        if(!bioState && !_price && !OtherUUID) return

        onSelected(`${index}`, {   
            id: `${index}`,
            bio: bioState, 
            price: _price, 
            suffix: suffixState, 
            t: Timestamp.now(),
            dd: OtherUUID,
            ...data
        })
        // eslint-disable-next-line
    }, [OtherUUID])

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {

        const v = event.target.value
        setPrice(v)

  
        const _price = parseFloat(v)

        // setError(_price < limit)

        onSelected(`${index}` , 
        {   
            id: `${index}`,
            bio: bioState, 
            price: _price * 100, 
            suffix: suffixState, 
            t: Timestamp.now(),
            dd: OtherUUID,
            ...data
        })

    };

    const onHandleBioChange = (event: React.ChangeEvent<HTMLInputElement>) => {

        const v = event.target.value
        setBio(v)

        onSelected(`${index}` , {
            id: `${index}`,
            bio: v, 
            price: _price, 
            suffix: suffixState, 
            t: Timestamp.now(),
            dd: OtherUUID,
            ...data
        })

    };

    const onHandleSuffixChange = (event: SelectChangeEvent<number>) => {
        const v = event.target.value as number
        setSuffix(v)

        onSelected(`${index}` , {
            id: `${index}`,
            bio: bioState, 
            price: _price, 
            suffix: v, 
            t: Timestamp.now(),
            dd: OtherUUID,
            ...data
        })
    }

    const onSelect = () => {
        setSelected(true)

        onSelected(`${index}` , {
            id: `${index}`,
            bio: bioState, 
            price: _price, 
            suffix: suffixState, 
            t: Timestamp.now(),
            dd: OtherUUID,
            ...data
        })
    }

    const onClick = () => {

        setSelected(!selected)
        if(!selected){

            onSelected(`${index}` , {
                id: `${index}`,
                bio: bioState, 
                price: _price, 
                suffix: suffixState, 
                t: Timestamp.now(),
                dd: OtherUUID,
                ...data
            })
        }else{
            setFocusPrice(false)
            deSelect(index)
        }

    }

    const onInvited = () => {

        if(isInvited){
            setRemoveDialog(true)
            return
        }

        if(!bioState){
            alert("Please include intro before inviting")
            return
        }

        if(!priceState){
            alert("Please include price before inviting")
            return
        }

        // open dialog
        setOpenDialog(true)
        

    }


    return <Box display="flex">
        <Box className="service-grid-main">

            <Box className="service-grid-wrapper" >

            <Box  width={100}>

                <img 
                    style={{
                        borderRadius: ".5rem", 
                        objectFit: "cover", 
                        objectPosition: "center",
                        background: "white",
                    }}
                    height={100}
                    width={100}
                    src={data.image}
                    alt=""
                />

            </Box>

            <FlexGap/>

            <TextField
                fullWidth
                onClick={() => {
                    // setFocusPrice(false)
                    // if(!selected){
                    //     onClick()
                    // }
                    setFocusPrice(false)
                    onSelect()
                }}
                placeholder={"Use an eye-catching one-liner intro to gain potential clients"}
                label={
                    <Typography fontSize={12}>Intro</Typography>
                }
                defaultValue={bio}
                value={bioState}
                error= {!bioState && selected}
                size="small"
                inputProps={{ style: {fontSize: 12 }}}
                multiline
                maxRows={4}
                rows={3}
                color="secondary"
                variant='outlined'
                onChange={onHandleBioChange}  
            /> 

       

            </Box>

            <Box className='footer' paddingBottom={1}>

                <Box width={100} minWidth={100} display="flex">
                    <Typography fontWeight="bold">
                    {data.title}&nbsp;&nbsp;
                    {data.description && <MobileTooltip title={data.description}>
                        <img
                            width={16}
                            height={16}
                            src="https://images.rentbabe.com/assets/question.svg"
                            alt=""
                        />
                    </MobileTooltip>}
                    </Typography>
                </Box>
            
                <FlexGap/>
                <FlexGap/>

                <Box marginLeft="auto" marginTop="auto" width="100%" display="flex">
                    <PaymentInput
                        fullWidth
                        size='small'
                        sx={{marginTop: "auto"}}
                        inputRef={input => focusPrice && input ? input.focus() : undefined}
                        onClick={() => {
                            // if(!selected){
                            //     setFocusPrice(true)
                            //     onClick()

                            //     //
                            // }
                            setFocusPrice(true)
                            onSelect()
                        }}
                        placeholder="credit"
                        focused={focusPrice}
                        disabled={!selected}
                     
                        error= {(!priceState && selected)}
                        label={
                            (!priceState && selected )? <Typography fontSize={12} color="error.main" variant='caption'>
                            {/* {error ? `Min. ${limit}.00` : "Requried"} */}
                            Requried
                        </Typography> :  null
                        }
                        defaultValue={price}
                        value={priceState}
                        margin="dense"
                        color="secondary"
                        variant="outlined"
                        inputProps={{ style: {fontSize: 12 } }}
                        onChange={handleChange}
                    />

                    <FlexGap/>

                    {
                        serviceType === ServiceType.games ? 
                
                        <CenterFlexBox marginTop="auto" display="flex">

                
                        <Typography marginRight="4px" color="text.secondary" variant='body2'>/</Typography>
                        <MySelect
                    
                            value={suffixState}
                            size='small'
                            color="secondary"
                            variant='standard'
                            onChange={onHandleSuffixChange}
                        >
                            <MenuItem value={Units.min}>15min</MenuItem>
                            <MenuItem value={Units.hr}>1Hr</MenuItem>
                            <MenuItem value={Units.game}>Game</MenuItem>
                        </MySelect>
                        </CenterFlexBox>
                
                        :
                        <Typography
                        marginTop="auto" 
                        marginBottom="4px"
                        color="text.secondary" variant='caption'>/{serviceType === ServiceType.meetup || 
                            serviceType === ServiceType.sports ? "1Hr" : "15min"}</Typography>
                    }
                    </Box>

                    <FlexGap/>

            
            </Box>
            <br/>
            <FlexBox height="32px">

                {OtherUUID && <UserCardAvatar
                    uid={OtherUUID}
                />}

                <FlexGap/>

                <Button
                    fullWidth
                    disabled={selected ? false : true} 
                    onClick={onInvited}  
                    variant='contained' 
                    color={OtherUUID ? "error" : "warning"}>{OtherUUID ? "REMOVE USER" : "INVITE USER"}</Button>
      
            </FlexBox>


            {(!isInvited && selected)&& <Typography color="error" variant='caption'>{t("dd.required")}</Typography>}

            <br/>
   

            <Divider/>
        </Box>

        <Box margin="auto">
            {!OtherUUID && <Checkbox color='secondary' checked={selected} onClick={onClick} />}
        </Box>

        <CenterSnackBar
            message={alertMsg}
            open={openAlert}
            autoHideDuration={2000}
            onClose={() => setOpenAlert(false)}   
        />

        { (openDialog && !isInvited) && <InviteDDDialog
            open={openDialog && !isInvited}
            priceState={priceState ? parseFloat(priceState) * 100 : undefined}
            bioState={bioState}
            onClose={() => setOpenDialog(false)}
        />}

        <RemoveDDUserDialog
            otherUUID={OtherUUID} 
            callback={() => {
                //setOtherUUID(undefined)
                setFocusPrice(false)
                deSelect(index)
            }}
            open={openRemoveDialog && isInvited && !!OtherUUID}
            onClose={() => setRemoveDialog(false)}
        />



    </Box>
}

export default ServiceGridDD