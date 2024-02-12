import { TextField, Button, Dialog, DialogContentText, Typography, DialogTitle, DialogActions, DialogContent, Avatar, CardHeader } from '@mui/material';
import { deleteField, doc, updateDoc } from 'firebase/firestore';
import { FC, useEffect, useState } from 'react';
import { reply, REVIEWS } from '../../keys/firestorekeys';
import { db } from '../../store/firebase';
import { reviewState } from './ReviewForm';

interface props {
    reviewDocumentID: string
    repliedToReview: string | undefined
    getReviewFrom : string
    myUID: string | undefined | null
    myUrl: string | undefined
    disallowReply: boolean
    onChangeReplyState: (additionalHeight: number) => void
}

const ReplyReview : FC<props> = ({
    myUrl, 
    reviewDocumentID, 
    repliedToReview, 
    getReviewFrom, 
    myUID, 
    disallowReply,
    onChangeReplyState}) => {

    const [open, setOpen] = useState<boolean>(false)
    const [isDisable, setDisable] = useState<boolean>(true)
    const [text, setText] = useState<string | undefined>(repliedToReview)
    const [replyEditor, setReplyEditor] = useState<reviewState>(repliedToReview ? reviewState.replied : reviewState.noRepliesYet)
    // repliedToReview ? reviewState.replied : reviewState.noRepliesYet

    useEffect(() => {
        // BAD PRACTICE
        onChangeReplyState(replyEditor === reviewState.replied ? 24 : 0)
        // eslint-disable-next-line
    }, [replyEditor])

    const replyClick = () => {
        setReplyEditor(reviewState.goingToReply)
    }

    const editClick = async () => {
        // updateDoc
        setReplyEditor(reviewState.goingToReply)
    }
  
    const postReplyClick = async () => {
        // updateDoc
        updateDoc( doc(db, REVIEWS, reviewDocumentID) , {[reply] : text} )
        setReplyEditor(reviewState.replied)
    }
  
    const cancelClick = () => {
        setReplyEditor(repliedToReview ?  reviewState.replied : reviewState.noRepliesYet)
        setDisable(true)
    }
  
    const deleteClick = () => {
        setOpen(true)
    }

    const onCloseHandle = () => {
        setOpen(false)
    }

    const onDeleteReplyClick = () => {

        updateDoc( doc(db, REVIEWS, reviewDocumentID) , {[reply] : deleteField()} )
        setOpen(false)
        setReplyEditor(reviewState.noRepliesYet)
    }

    const onChangeTextField = (e: any) => {

        setText(e.target.value)
        setDisable(false)
    }


    if(getReviewFrom === myUID && !disallowReply) return <>
    
        {replyEditor === reviewState.goingToReply  ?
            <>
                <TextField 

                defaultValue={repliedToReview} 
                sx={{paddingRight: '2em'}} 
                label='Your reply' 
                margin='dense' 
                fullWidth color='secondary' 
                variant='standard'
                onChange={onChangeTextField}
                ></TextField>
            
                <br/>
            </> : null }

            {replyEditor === reviewState.replied  ?
            <>
                <br/>
                <Typography>Response</Typography>
                <DialogContentText
                sx={{paddingRight: '2em'}} 
                >{repliedToReview} </DialogContentText>

            </> : null }

            <br/>
            <>
              {replyEditor === reviewState.noRepliesYet && <Button size='small' variant='contained' color='secondary' onClick={replyClick}>Reply</Button>}
              {replyEditor === reviewState.replied && <Button size='small' variant='contained' color='secondary' onClick={editClick}>Edit</Button>}
              {replyEditor === reviewState.goingToReply && <Button disabled={isDisable} size='small' variant='contained' color='secondary' onClick={postReplyClick} >Post reply</Button>}
              
            </>

            <>
              {replyEditor === reviewState.goingToReply &&  <Button sx={{marginLeft: '1em'}} size='small' color='secondary' onClick={cancelClick} >Cancel</Button>}
              {replyEditor === reviewState.replied &&  <Button sx={{marginLeft: '1em'}} size='small' color='secondary' onClick={deleteClick} >Delete</Button>}
            </>
    
        <Dialog open={open} onClose={onCloseHandle}>
            <DialogTitle>Delete reply</DialogTitle>

            <DialogContent>
                <DialogContentText>Are you sure you want to delete this reply?</DialogContentText>
            </DialogContent>
        
            <DialogActions>

                <Button color='inherit' onClick={onCloseHandle}>Cancel</Button>
                <Button color='secondary' onClick={onDeleteReplyClick}>Delete</Button>

            </DialogActions>
        </Dialog>
    </>

    else if(replyEditor === reviewState.replied) return <>

    <br/>


    <CardHeader sx={{padding: 0}}
        avatar={
            <Avatar src={myUrl}/>
        }
        title = {
            <Typography 
            variant='caption' 
            fontWeight="bold" 
            // fontSize=""
            color="text.secondary">
                Response
            </Typography>
        }
        subheader= {repliedToReview}

    />
            
    </>


    else return null
 
}

export default ReplyReview