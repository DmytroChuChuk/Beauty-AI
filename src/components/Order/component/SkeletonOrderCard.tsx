import { Avatar, Box, Card, CardContent, CardHeader, Chip, Skeleton, Typography } from '@mui/material';
import { FC } from 'react';

const SkeletonOrderCard : FC = () => {

    return <Card  >

        <CardHeader
            avatar={
                <Skeleton variant='circular'>
                     <Avatar/>
                </Skeleton>
            }

            title = {
                <Skeleton width="100px" variant='text'/>
            }

            subheader={
                <Skeleton width="250px" variant='text'/>
            }
        />

        <CardContent>
            <Box display="flex">

            <Typography variant='caption'> <Skeleton width="50px" variant='text'/> </Typography>

            <Chip size='small' sx={{marginLeft: "auto"}} label={
                <Skeleton width="50px" variant='text'/>
                }
            />
                
            </Box>
        </CardContent>
      
    </Card>
 
}

export default SkeletonOrderCard