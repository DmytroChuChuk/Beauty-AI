import { Avatar, CardHeader, CircularProgress, Rating, Skeleton, Typography } from '@mui/material';
import { grey, red } from '@mui/material/colors';
import { FC } from 'react';
import { useGetUserData } from '../../hooks/useGetUserData';
import { mobileUrl, nickname } from '../../keys/firestorekeys';

import { Helper } from '../../utility/Helper';


interface props {

    sender: string | undefined
    isAnnon: boolean
    numberOfStars: number
    date: Date | undefined
}

const ReviewCardHeader : FC<props> = ({ sender, isAnnon, numberOfStars, date}) => {

    const helper = new Helper()

    const {loading: isLoading, error, data} = useGetUserData(sender)

    const username = data?.get(nickname)


    const firstChar = isAnnon ? "A" : data?.get(nickname)?.[0].toUpperCase() ?? "-"

    return  <CardHeader
        avatar={ <Avatar src={isAnnon ? undefined : (data?.get(mobileUrl) as string)?.toCloudFlareURL()} 
        sx={{ bgcolor: isAnnon ? red[500]  : grey[500] }}>
        

            {isAnnon || !sender ?  firstChar : <>
                {
                    isLoading || error ?    <CircularProgress color="secondary" size={12}/> : <>
                    {
                        !data?.get(mobileUrl) && <>
                            { firstChar}
                        </>
                    }

                    </>

                }
            </>}
        </Avatar>}

    title={ isLoading ? <>
        <Skeleton variant="text" style={{width: 80}} />
      </> :  isAnnon ? "Anonymous" : username ?? "Account Deleted"
     
    }

    subheader={<div>
      <div className='flex align-center'>
        

        <Rating size='small' value={numberOfStars} readOnly />

        <Typography  sx={{fontSize:'11px' , marginLeft:'.5em'}}> { date && helper.timeSince(date, true) }</Typography>

      </div>

    </div>}
  />
 
}

export default ReviewCardHeader