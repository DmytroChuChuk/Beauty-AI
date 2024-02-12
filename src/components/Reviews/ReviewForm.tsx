import React, { FC, memo, useMemo, useState } from 'react';
import './ReviewForm.scss';
// import '../../pages/css/FormStyle.scss';

import { db } from "../../store/firebase";
import { DialogContent, 
  DialogContentText, 
  DialogTitle, 
  LinearProgress, 
  Dialog,
  Card,
  CardHeader,
  Skeleton,
  Box
} from '@mui/material';

import { 
  collection, 
  where, 
  orderBy, 
  query, 
  limit, 
  DocumentData, 
  QueryDocumentSnapshot 
} from 'firebase/firestore';

import { 
  REVIEWS,
  completed, 
  time_stamp, 
  uid as uidKey
} from '../../keys/firestorekeys';
  
import { useCollectionQuery } from '../../chats/hooks/useCollectionQuery';

import { Reviews } from '../../keys/props/common';
import ReviewCard from './ReviewCard';
import { ListChildComponentProps } from 'react-window';
import VariableWindowList from '../List/VariableWindowList';

interface ReviewProps{
    uid: string
    myUrl: string | undefined
    open :boolean
    onClose?: () => void
}

export enum reviewState {
  noRepliesYet,
  goingToReply,
  replied
}

const ReviewSkeletonCard : FC = () => {

  return <Box padding={2}>
    <Card elevation={0} sx={{borderRadius : 0}} >

      <CardHeader
        avatar={
          <Skeleton
            sx={{height: 40, width: 40}}
            variant='circular'
          />
        }
        title={        <Skeleton 
          width={200}
          variant='text'
        />}
        subheader={        <Skeleton 
          width={80}
          variant='text'
        />}
      />

      <DialogContent  sx={{padding : '0 1em 0 72px'}}>

        <Skeleton 
          width="90%"
          height={50}
          variant='text'
        />

        
      </DialogContent>

      </Card>
    </Box>
}

// Define a type for your additional props
interface RowProps extends ListChildComponentProps<QueryDocumentSnapshot<DocumentData>[] | undefined> {
  uid: string;
  myUrl: string | undefined;
  hasNextPage: boolean;
}


const Row = memo(({index, style, data, uid, myUrl, hasNextPage}: RowProps)  => {

    const numberOfDocs = data?.length ?? 0
    const doc = data?.[index] 
    const docId = doc?.id
    const item = doc?.data() as Reviews

    if(!item || !docId) {

      return hasNextPage ? <div key={index}  style={style}> 
        <ReviewSkeletonCard/>
        <br/>
        {
          numberOfDocs === 0 && <>
            <ReviewSkeletonCard/>
            <br/>
            <ReviewSkeletonCard/>
            <br/>
            <ReviewSkeletonCard/>
            <br/>
            <ReviewSkeletonCard/>
            <br/>
          </>
        }

      </div> : null
      
    }

    else return  <div key={index}  style={style}>
        <ReviewCard 
          index={index} 
          docId={doc.id} 
          reviews={item} 
          myUrl={myUrl}
          getReviewFromUUID={uid}
      />
    </div>
})


const ReviewForm: React.FC<ReviewProps> = ({uid, myUrl, open : isOpen, onClose }) => {


    const itemHeight = 130
    const limitNumber = Math.ceil(window.innerHeight / itemHeight)

    const [limitCount, setLimitCount] = useState<number>(limitNumber)

    const { loading, error, data, hasNextPage } = useCollectionQuery(
      `${uid}-reviews-form`,
      query(collection(db, REVIEWS) 
      , where(completed, "==" , true)
      , where(uidKey, "==" , uid)
      , orderBy(time_stamp, "desc")
      , limit(limitCount)),
      limitCount
    )

    const MemoizedRow = useMemo(() => {
      return (props: ListChildComponentProps<QueryDocumentSnapshot<DocumentData>[] | undefined>) => <Row {...props} uid={uid} myUrl={myUrl} hasNextPage={hasNextPage} />;
  }, [uid, myUrl, hasNextPage]);
  

    function loadNextPage() {
      if(hasNextPage){       
        setLimitCount((prev) => {
          return prev +  limitNumber
        })
      }
    }

    return <Dialog 
        fullWidth
        open={isOpen}
        onClose={onClose}
        scroll='paper'
      >

    <DialogTitle>Reviews <img src = "https://images.rentbabe.com/assets/mui/close_rounded.svg" className = "closeDialog" onClick={onClose} alt = ""/></DialogTitle>

    {(data?.length === 0 && loading) && <LinearProgress color='secondary'/> }


    {data?.length as number === 0 && <DialogContent><DialogContentText>No feedbacks.</DialogContentText></DialogContent>}
    {error && <DialogContent><DialogContentText>Error, please try again</DialogContentText></DialogContent>}

 

      <VariableWindowList
          data={data ?? []}
          height={ (window.innerHeight / 3 ) * 4}
          width={"100%"}
          hasNextPage={hasNextPage}
          loadNextPage={loadNextPage}
          // component={Row(uid, myUrl, hasNextPage)}
          component={MemoizedRow}
      />

  
  </Dialog>

}

export default (ReviewForm);