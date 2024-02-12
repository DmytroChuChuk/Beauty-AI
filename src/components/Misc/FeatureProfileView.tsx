import { Skeleton, Box, Typography } from '@mui/material';
import { CollectionReference, DocumentData, getDocs, query, QueryConstraint } from 'firebase/firestore';
import { FC, useEffect, useRef, useState } from 'react';
import ScrollContainer from 'react-indiana-drag-scroll';
import shallow from 'zustand/shallow';
import { RBAC } from '../../enum/MyEnum';
import { useWindowSize } from '../../hooks/useWindowSize';
import { cardGray } from '../../keys/color';
import { Item } from '../../keys/props/profile';
import { useUser } from '../../store';
import { Helper } from '../../utility/Helper';
import RatingLabel from '../RentPage/components/RatingLabel';
import SectionTitle from '../Typography/SectionTitle';
import VoiceButton from '../Voice/VoiceButton';
import ImageWithFallback from './ImageWithFallback';
import FlexBox from '../Box/FlexBox';

interface props {
    title: string
    collectionQuery: CollectionReference<DocumentData>
    queries:  QueryConstraint[]
    openProfile: (item: Item) => void
}

const FeatureProfileView : FC<props> = ({title, collectionQuery, queries, openProfile}) => {

    const imageSize = "18vh"
    const helper = new Helper()

    const [userRBAC] = useUser((state) => [state.currentUser?.userRBAC], shallow)
    const [size] = useWindowSize()

    const isAdminPage = helper.getQueryStringValue("admin") === "true" && userRBAC === RBAC.admin
    const isVerify = window.location.href.getQueryStringValue("verify") === "true"
    const isAnnouncement = window.location.href.getQueryStringValue("session")

    const topTenDiv = useRef<HTMLElement>(null)
    const divWidth = 1700 // topTenDiv.current?.scrollWidth ?? 0
    const marginLeft = size.width > divWidth? `${ (size.width - divWidth) / 3 }px!important` : 1.5

    // query(collection(db, USERS), where(admin, "==", true), where(privacy, "==", 0),
    // where(`${services}.1.id`, "==", "1"), orderBy(sortByRatings, "desc"), limit(10) )

    const [topTenProfiles, setTopTenProfiles] = useState<Item[]>([])
    const [loaded, setLoaded] = useState<boolean>(false)

    useEffect(() => {
        if(isAnnouncement || isAdminPage || isVerify){
            return
        }

        getDocs(query(collectionQuery, ...queries))
            .then((snapshot) => {
                const items: Item[] = []
                snapshot.docs.forEach((doc) => {
                    const item = helper.addItems(doc, false)
                    items.push(item)
                })
                setTopTenProfiles(items)
        })
        // eslint-disable-next-line
    } , [])

    const onLoad = () => {
        setLoaded(true)
    }

    return <Box hidden={topTenProfiles.length === 0 || isAdminPage} >
    
    <SectionTitle marginLeft={marginLeft}>{title}</SectionTitle>

    {/* <Typography  marginLeft={marginLeft} variant='h6' color="text.secondary"></Typography> */}
  
    <ScrollContainer 
      horizontal 
      vertical={false} 
      innerRef={topTenDiv} 
      className="live-container horizontal-scroll"
    >
      {topTenProfiles.map((item, index) => {
        
        return (<Box 
            key={index} 
            className = "top-ten-ava"
            style = {{
                position: "relative",
                width: imageSize,
                height: imageSize
            }}>
    
                {/* {
                    item?.isGamer ? <>{MyRentTag(ServiceType.games)}</>
                    : item.services?.[ServiceType.eMeet] ?  <>{MyRentTag(ServiceType.eMeet)}</>
                    : <></>
                } */}
    
    
                {!loaded && <Skeleton
                    style={{borderRadius: "1rem", position: "absolute", zIndex: -1}}
                    variant='rectangular'
                />}
    
                <Box className = "ava" 
                    bgcolor={cardGray}
                    style={{
                        position: "relative",
                        borderRadius: "1rem" ,
                        width: imageSize,
                        height: imageSize
                    }}>
    
                <ImageWithFallback 
                    onClick={() => openProfile(item)}
                    fallback={[
                        item.mobileUrl?.toCloudFlareURL() ?? "",
                        item.urls.length > 0 ? item.urls[0]?.toCloudFlareURL() : ""
    
                    ]}
                    style={ {borderRadius: "1rem", objectFit: "scale-down", objectPosition: "center"}}
                    srcSet={ `${item.urls.length > 0 ? item.urls[0].toCloudFlareURL() : ""}`.srcSetConvert() }
                    alt = ''
                    onLoad={onLoad}
                />

                   <div className='group-top-nbg darker'>
                        {item.voiceUrl ? <VoiceButton
                            voiceUrl={item.voiceUrl}/> : <FlexBox>
                                <Typography 
                                    variant='body1' 
                                    fontWeight='bold'
                                    marginRight="auto"
                                    color="primary">
                                    {item.nickname?.capitalize()?.shorten(12)}
                                </Typography>
                        </FlexBox>}
                    </div>

                    <div className={"groupx"}    onClick={() => openProfile(item)}>
                        <RatingLabel 
                            ratings={item.ratings}
                            marginTop="auto"
                            marginLeft="auto"
                            marginRight="16px"
                        />
                    </div>
                </Box>
            </Box>)
  
      })}
    </ScrollContainer> 

  </Box>
}

export default FeatureProfileView