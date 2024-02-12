import { FC, useEffect, useState } from 'react';
import { styled } from '@mui/material/styles';

import { 
    Box, 
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
import FlexBox from '../Box/FlexBox';
import UploadGamingPhotoInput from './component/UploadGamingPhotoInput';
import { useUser } from '../../store';
import { Helper } from '../../utility/Helper';
import { maxCreditForMalaysiaBuddy } from '../../version/basic';

const MySelect = styled((props: any) => <Select {...props} />)(
    () => ({
      fontSize: '12px',
    }),
  );


interface props {
    serviceType: ServiceType
    index: string
    myServices: servicesProps | undefined
    data: detailProps
    onSelected: (id: string, data: detailProps) => void
    deSelect: (id: string) => void
}


const ServiceGrid : FC<props> = ({index, serviceType, myServices, data, onSelected, deSelect}) => {


    // const [profileAtWhichState, gender] = useUser((state) => [
    //     state.currentUser?.profileAtWhichState, 
    //     state.currentUser?.gender
    // ])


    const [ratings, numberOfRents, isActive, profileAtWhichState] = useUser((state) => [
        state.currentUser?.ratings, 
        state.currentUser?.numberOfRents,
        state.currentUser?.isActive,
        state.currentUser?.profileAtWhichState
    ])

    const limitUserPriceInput = profileAtWhichState?.toLowerCase().includes("malaysia") || profileAtWhichState?.toLowerCase().includes("indonesia") || profileAtWhichState?.toLowerCase().includes("philippines")

    const helper = new Helper()
    const servicesHelper = new ServicesHelper()
    const cacheServices = myServices?.[`${serviceType}`]

    const isSelected = cacheServices?.[index] ? true : false

    const detail = cacheServices?.[index] as detailProps
    const price = detail?.price
    const bio = detail?.bio
    const suffix = detail?.suffix
    const gameImage = detail?.profile
    const uploadFile = detail?.uploadFile

    // const limit = (profileAtWhichState?.toLowerCase() === "singapore") && gender === genderEnum.female.toString()
    // && serviceType === ServiceType.meetup.valueOf() ? 20  : 1

    const [ storeGameImage, setStoreGameImage ] = useState(gameImage)
    const [ file, setFile ] = useState<File| undefined>(uploadFile)
    const [selected, setSelected] = useState<boolean>(isSelected)
    const [priceState, setPrice] = useState<string | undefined>( 
        price ? (price / 100)?.toFixed(2).toString() : undefined
    )
    const [bioState, setBio] = useState<string | undefined>(bio)
    const [suffixState, setSuffix] = useState<number | undefined>(suffix ?? servicesHelper.getDefaultSuffix(serviceType))
    const [error, setError] = useState<boolean>(
        (limitUserPriceInput && parseFloat(priceState ?? "") > maxCreditForMalaysiaBuddy) ? true : false
    )


    const [focusPrice, setFocusPrice] = useState<boolean>(false)

    const cachePrice = priceState ? parseFloat(priceState) * 100 : undefined

    useEffect(() => {
        if(gameImage){
            setStoreGameImage(gameImage)
        }

    }, [gameImage])

    function getSbyprtValue(
        price: number, ratings: number, numberOfRents: number
    ){
        const sort = helper.sortByPricesValue(price, ratings, numberOfRents)

        return sort
    }


    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {

        const v = event.target.value
        setPrice(v)

        let p = parseFloat(v)

        if(limitUserPriceInput && p >= maxCreditForMalaysiaBuddy){
            setError(true)
            p = maxCreditForMalaysiaBuddy
            setPrice(`${maxCreditForMalaysiaBuddy}`)
        }else{
            setError(false)
        }


        let map: detailProps =   {   
            id: `${index}`,
            bio: bioState, 
            price: p * 100, 
            suffix: suffixState, 
            t: Timestamp.now(),
            profile: storeGameImage,
            uploadFile: file,
            sbyprt: getSbyprtValue(p * 100, ratings ?? 0, numberOfRents ?? 0),
            ...data
        }

        if(p && isActive) map.sbyprt = getSbyprtValue(p * 100, ratings ?? 0, numberOfRents ?? 0)

        onSelected(`${index}`, map)

    }

    const onHandleBioChange = (event: React.ChangeEvent<HTMLInputElement>) => {

        const v = event.target.value
        setBio(v)
  
        // const _price = priceState ? parseFloat(priceState) * 100 : undefined
        let map: detailProps = {
            id: `${index}`,
            bio: v, 
            price: cachePrice, 
            suffix: suffixState, 
            t: Timestamp.now(),
            profile: storeGameImage,
            uploadFile: file,
            ...data
        }

        if(cachePrice && isActive) map.sbyprt = getSbyprtValue(cachePrice, ratings ?? 0, numberOfRents ?? 0)

        onSelected(`${index}`, map)

    };

    const onHandleSuffixChange = (event: SelectChangeEvent<number>) => {
        const v = event.target.value as number
        setSuffix(v)

        // const _price = priceState ? parseFloat(priceState) * 100 : undefined
        let map: detailProps = {
            id: `${index}`,
            bio: bioState, 
            price: cachePrice, 
            suffix: v, 
            t: Timestamp.now(),
            profile: storeGameImage,
            uploadFile: file,
            ...data
        }

        if(cachePrice && isActive) map.sbyprt = getSbyprtValue(cachePrice, ratings ?? 0, numberOfRents ?? 0)

        onSelected(`${index}`, map)
    }

    const onSelect = () => {
        setSelected(true)
        // const _price = priceState ? parseFloat(priceState) * 100 : undefined
        let map: detailProps = {
            id: `${index}`,
            bio: bioState, 
            price: cachePrice, 
            suffix: suffixState, 
            t: Timestamp.now(),
            profile: storeGameImage,
            uploadFile: file,
            ...data
        }

        if(cachePrice && isActive) map.sbyprt = getSbyprtValue(cachePrice, ratings ?? 0, numberOfRents ?? 0)

        onSelected(`${index}`, map)
    }

    const onClick = () => {

        setSelected(!selected)
        if(!selected){

            let map: detailProps = {
                id: `${index}`,
                bio: bioState, 
                price: cachePrice, 
                suffix: suffixState, 
                t: Timestamp.now(),
                profile: storeGameImage,
                uploadFile: file,
                ...data
            }
    
            if(cachePrice && isActive) map.sbyprt = getSbyprtValue(cachePrice, ratings ?? 0, numberOfRents ?? 0)

            //const _price = priceState ? parseFloat(priceState) * 100 : undefined

            onSelected(`${index}`, map)
        }else{
            setFocusPrice(false)
            deSelect(index)
        }
    }

    return <Box display="flex">
        <Box className="service-grid-main">

            <Box className="service-grid-wrapper" >

            <Box width={100}>

                <img 
                    style={{
                        borderRadius: ".5rem", 
                        objectFit: "cover", 
                        objectPosition: "center",
                        background: "white"
                    }}
                    height={100}
                    width={100}
                    src={data.image}
                    alt=""
                />

            </Box>

            <FlexGap/>

            <Box>

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

            {
                serviceType === ServiceType.games && <UploadGamingPhotoInput
                    index={index}
                    file={file} 
                    selected={selected} 
                    gameImage={storeGameImage} 
                    fileUploaded={(file) => {
                        setFile(file)
                        onSelected(`${index}`, {
                            id: `${index}`,
                            bio: bioState, 
                            price: cachePrice, 
                            suffix: suffixState, 
                            t: Timestamp.now(),
                            profile: storeGameImage,
                            uploadFile: file,
                            ...data
                        })
                        
                        if(!selected){
                            onClick()
                        }
               
                    }}                    
                />
            }

            </Box>


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


                <MobileTooltip title={"1.00 credit = $1.00 SGD"}>
                    <FlexBox 
                        onClick={() => {
                            setFocusPrice(true)
                            onSelect()
                        }}
                        marginLeft="auto" 
                        marginTop="auto" 
                        width="100%">

                        <PaymentInput
                            fullWidth
                            size='small'
                            autoComplete='off'
                            sx={{ marginTop: "auto" }}
                            inputRef={input => focusPrice && input ? input.focus() : undefined}
                            placeholder="credit"
                            focused={focusPrice}
                            disabled={!selected}
                            error= {(!priceState && selected)}
                            label={(!priceState && selected ) ? <Typography fontSize={12} color="error.main" variant='caption'>
                                Requried</Typography> : (error && selected) ? <Typography variant='caption' color="error">
                                    Maximum 50 Credits
                                </Typography> : null
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
                    </FlexBox>
                </MobileTooltip>

                <FlexGap/>

            
            </Box>

            <Divider/>
        </Box>

        <Box margin="auto">
            <Checkbox color='secondary' checked={selected} onClick={onClick} />
        </Box>

    </Box>
}

export default ServiceGrid