import { Card, DialogContent, DialogContentText, Typography } from '@mui/material';
import { Timestamp } from 'firebase/firestore';
import { FC, useContext, useEffect, useRef } from 'react';
import shallow from 'zustand/shallow';
import { Reviews } from '../../keys/props/common';
import { ServiceDetails } from '../../pages/ProfilePage';
import { useUser } from '../../store';
import { VariableWindowListContext } from '../List/VariableWindowList';
import ReplyReview from './ReplyReview';
import ReviewCardHeader from './ReviewCardHeader';

interface props {
    index: number
    docId: string
    reviews: Reviews
    getReviewFromUUID: string
    myUrl: string | undefined
    disallowReply?: boolean
}

const ReviewCard : FC<props> = ({index, docId, reviews, getReviewFromUUID, myUrl, disallowReply = false}) => {

    const [myUID] = useUser((state) => [
        state.currentUser?.uid
    ], shallow)

    const { size, setSize } = useContext(VariableWindowListContext)
    const root1 = useRef<HTMLDivElement>(null)

    const isAnnon = reviews.annon
    const reviewSender = reviews.sen

    const reviewRatings = ( reviews.rts as number | undefined ) ?? 0
    const reviewRatings2 = reviews.rts2 as number | undefined 
    const numberOfStars =  reviewRatings2 ??  (reviewRatings > 4  ? 4  : reviewRatings ) + 1

    const date = (reviews.t as Timestamp | undefined)?.toDate()

    const repliedToReview = reviews.r as string | undefined 
    const reviewServices = reviews.services as ServiceDetails | undefined
    const serviceTitle = reviewServices?.details?.title
    const title = serviceTitle ? `Service: ${serviceTitle}` : ""

    const comments = reviews.cmts

    function setHeight(additionalHeight: number = 0){
        const height1 =  root1.current?.getBoundingClientRect().height ?? 0
        setSize?.(index, height1 + additionalHeight)
    }

    useEffect(() => {
        setHeight()
    }, [size?.width]) // eslint-disable-line

    return <Card key={index} ref={root1} elevation={0} sx={{borderRadius : 0}} >

    <ReviewCardHeader
        isAnnon={isAnnon} 
        sender={reviewSender}
        numberOfStars={numberOfStars}
        date={date}
    />

    <DialogContent  sx={{padding : '0 1em 0 72px'}}>

    <Typography 
    fontWeight="bold" 
    variant='caption' 
    color="text.secondary" sx={{ fontStyle: 'italic' }}>{title}</Typography>

    <DialogContentText fontStyle={comments ? 'normal' : 'italic'} fontSize={14}>
        {comments ?? "The user didn't write a review and has left just a rating."}
    </DialogContentText>

    <ReplyReview
    myUrl={myUrl} 
    getReviewFrom={getReviewFromUUID} 
    myUID={myUID} 
    reviewDocumentID={docId} 
    repliedToReview={repliedToReview}
    disallowReply={disallowReply}
    onChangeReplyState={(additionalHeight)=>{
        setHeight(additionalHeight)
    }}
    /> 


    <br/>
    </DialogContent>
  
    </Card>
}

export default ReviewCard