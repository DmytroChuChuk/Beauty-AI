import { Avatar, CardHeader, CircularProgress, Skeleton, Typography } from '@mui/material';
import { grey, red } from '@mui/material/colors';
import { Timestamp } from 'firebase/firestore';
import { FC } from 'react';
import { useGetUserData } from '../../hooks/useGetUserData';
import { mobileUrl, nickname, ratings, time_stamp } from '../../keys/firestorekeys';
import { StarProps } from '../../keys/props/profile';
import FlexBox from '../Box/FlexBox';
import RatingLabel from '../RentPage/components/RatingLabel';


interface props {
    uid: string | undefined
    isAnnon?: boolean
    showLastSeen?: boolean
    showRatings?: boolean
}

const UserCardAvatar : FC<props> = ({uid, showRatings = false, showLastSeen = false, isAnnon = false}) => {


    const {loading, error, data} = useGetUserData(uid)


    const firstChar = isAnnon ? "A" : data?.get(nickname)?.[0].toUpperCase() ?? "-"
    const ago = (data?.get(time_stamp) as Timestamp | undefined)?.toDate().timeSince(true)

    const username = data?.get(nickname) as string | undefined
    const _ratings = data?.get(ratings) as StarProps | undefined

    return <CardHeader
        sx={{cursor: "pointer"}}
        onClick={() => {
            window.open(`${window.location.origin}/Profile?uid=${uid}`, "_blank")
        }}
        avatar={
            <Avatar
            variant="circular" 
            src={isAnnon ? undefined : (data?.get(mobileUrl) as string)?.toCloudFlareURL()} 
            sx={{ bgcolor: isAnnon ? red[500]  : grey[500] }}>
            

                {isAnnon || !uid ?  firstChar : <>
                    {
                        loading || error ? <CircularProgress color="secondary" size={12}/> : <>
                        {
                            !data?.get(mobileUrl) && <>
                                { firstChar}
                            </>
                        }
                        </>
                    }
                </>}
            </Avatar>
        }
        subheader={<Typography variant='caption' color="error">
            {
                !loading ? <>
                    {showLastSeen ? ago ? `Last seen ${ago}` : "Inactive" : <></>}
                </> : <>
                    <Skeleton variant='text' />
                </>
            }
            
        </Typography>}
        title={username ? <FlexBox>@{username} {showRatings && <RatingLabel marginLeft="auto" fontColor="black" fontWeight='inherit' ratings={_ratings}/>}</FlexBox> : <Skeleton variant='text' width={80} /> }
     
    />
 
}

export default UserCardAvatar