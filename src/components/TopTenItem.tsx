import { FC, useState } from 'react';

import { Item } from '../keys/props/profile';
import './TopTenItem.scss'
import { Skeleton } from '@mui/material';
import { Box } from '@mui/system';

import RatingLabel from './RentPage/components/RatingLabel';
import { cardGray } from '../keys/color';
// import { ServicesHelper } from '../utility/ServicesHelper';
// import { ServiceType } from './Services/ChooseServices';
import RentTag from './RentPage/components/RentTag';
import { ServiceType } from '../keys/props/services';
import ImageWithFallback from './Misc/ImageWithFallback';


interface TopTenItemProps {
    item:Item
    index: number
    onOpenProfile: (item:Item) => void
}

const TopTenItem : FC<TopTenItemProps> = ({item, index, onOpenProfile}) => {


    //const servicesHelper =  new ServicesHelper()

    const [loaded, setLoaded] = useState<boolean>(false)
    // const numberOfServices = servicesHelper.getNumberOfServices(item.services)
    // const _service = servicesHelper.getFirstDetailByType(item.services, item.gonow_servce)
    // const _price = _service?.price
    // const firstprice = _price ?? servicesHelper.getFirstServicePrice(item.services) 
    // const prevPrice = item.price
    // const price = firstprice ? firstprice / 100 : prevPrice
    // const suffix = servicesHelper.convertUnits(_service?.suffix) ?? "Hr"
    
    function formatAMPM(date: Date | undefined) : string{

        if(!date) return "error"

        var hours = date.getHours();
        var minutes: string | number = date.getMinutes();
        var ampm = hours >= 12 ? 'pm' : 'am';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        minutes = minutes < 10 ? '0'+minutes : minutes;
        var strTime = hours + ':' + minutes  + ampm;

        return strTime;

    }

    const onLoad = () => {
        setLoaded(true)
    }

    return (<div 
        key={index} 
        className = "top-ten-ava" 
        style = {{
            position: "relative", 
            minHeight: "160px", 
            height: "160px",
            maxHeight: "160px", 
            maxWidth: "120px" ,
            width: "120px" 
        }} 
        onClick={() => onOpenProfile(item)}>

            {/* {
                item?.isGamer ? <>{MyRentTag(ServiceType.games)}</>
                : item.services?.[ServiceType.eMeet] ?  <>{MyRentTag(ServiceType.eMeet)}</>
                : <></>
            } */}


            {!loaded && <Skeleton
                style={{borderRadius: "8px", position: "absolute", zIndex: -1}}
                variant='rectangular'
                width={120}
                height={120}
            />}

            <Box className = "ava" 
            bgcolor={cardGray}
            style={{
            maxHeight:  "120px",
            maxWidth: "120px", 
            borderRadius:"8px" }} >

            <ImageWithFallback 
                fallback={[
                    item.mobileUrl?.toCloudFlareURL() ?? "",
                    item.urls.length > 0 ? item.urls[0]?.toCloudFlareURL() : ""
                ]}
                style={ {borderRadius: "8px", objectFit: "scale-down", objectPosition: "center"}}
                srcSet={ `${item.urls.length > 0 ? item.urls[0].toCloudFlareURL() : ""}`.srcSetConvert() }
                width={120}
                height={120}
                onLoad={onLoad}
                alt = ''
            />

                <div className={"groupx"}>
                    <RatingLabel 
                        ratings={item.ratings}
                        marginLeft="auto"
                        marginTop="auto"
                        marginRight="8px"
                    />
                </div>

                {/* {price && <Box className="group-top-nbg darker" 
                sx={{
                    borderTopLeftRadius: "8px!important", 
                    borderTopRightRadius: "8px!important", 
                    paddingLeft: "8px!important", 
                    paddingTop: "2px!important"
                }}>

                    <FlexGap/>
                    { ((item.state === "Singapore" || item.currency === "SGD" ) && price) && 
                        <PriceLabel hideDecimal suffix={suffix} itemPrice={price}/>
                    }
      
                </Box> } */}

            </Box>
            <p className="info">{formatAMPM(item.start)} - {formatAMPM(item.end)}</p>
            {/* <p className="info">From: {formatAMPM(item.start)}</p>
            <p className="info">To: {formatAMPM(item.end)}</p> */}
          
            {
                item.gonow_servce === ServiceType.meetup ?  <p className="info">📍 {item.gonow_coming_from ?? "Town"}</p> :
                <Box position="relative" height="32px" width="100%"><RentTag size='small'
                title={item.gonow_servce === ServiceType.eMeet ? "E-Meets" : item.gonow_servce === ServiceType.games ? "games" : ""}/></Box>
            }
           
        </div>)

}

export default TopTenItem;