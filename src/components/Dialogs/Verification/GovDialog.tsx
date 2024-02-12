import { 
    Dialog, 
    DialogTitle,
    DialogContent, 
    DialogContentText, 
    DialogActions, 
    Button, 
    DialogProps,
    Checkbox,
    FormControlLabel,
    Typography,
    Box,
    CircularProgress
} from '@mui/material';

import {
    VERIFY,
    USERS,
    time_stamp,
    uid,
    video_verification,
    reject_reason_after,
    urls
} from '../../../keys/firestorekeys';

import {  
    doc, 
    serverTimestamp, 
    deleteField, 
    writeBatch
} from 'firebase/firestore';

import { VERIFICATION } from '../../../keys/storagekeys';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { ChangeEvent, FC, useRef, useState } from 'react';
// import shallow from 'zustand/shallow';
import CenterSnackBar from '../../../chats/components/Snackbar/CenterSnackBar';
// import { useUser } from '../../../store';
import { db, storage } from '../../../store/firebase';
import CenterFlexBox from '../../Box/CenterFlexBox';
import { useWindowSize } from '../../../hooks/useWindowSize';
import { useTranslation } from 'react-i18next';


interface props extends DialogProps {
    myUID: string | null | undefined
    verified: boolean | undefined
    rejectedReasonAfter: string | null | undefined
    open: boolean
    onClose: () => void
}


interface InputProps {
    onChangeHandleFront: (e:React.ChangeEvent<HTMLInputElement>) => void
    onChangeHandleBack: (e:React.ChangeEvent<HTMLInputElement>) => void
}
const UploadFrontBackInput: FC<InputProps> = ({onChangeHandleFront, onChangeHandleBack}) => {
    return <Box>
        <label>
            Front ID:<br/>
            <input required type="file" accept="image/*" onChange={onChangeHandleFront} ></input>
        </label>
        <br/>
        <br/>
        <label>
            Back ID:<br/>
            <input required type="file" accept="image/*" onChange={onChangeHandleBack} ></input>
        </label>
    </Box>
}

const GovDialog : FC<props> = ({myUID: _uid, verified, rejectedReasonAfter, open, onClose,...props}) => {

    // const [_uid, verified, rejectedReasonAfter] = useUser((state) => [
    //     state.currentUser?.uid, state.currentUser?.verified, state.currentUser?.rejectedReasonAfter])

    const [ t ] = useTranslation()

    const [size] = useWindowSize()
    const [isLoading, setLoading] = useState<boolean>(false)

    const [firstCheck, setFirstCheck] = useState<boolean>(false)
    const [secondCheck, setSecondCheck] = useState<boolean>(false)

    const frontFile = useRef<File | undefined>()
    const backFile = useRef<File | undefined>()

    const [msg, setMsg] = useState<string>()
    const [openSnackBar, setSnackBar] = useState<boolean>(false)

    const [indicator, setIndicator] = useState<string>("")


    const onCloseSnackbar = () => {
        setSnackBar(false)
    }

    function openSB(msg: string){
        setMsg(msg)
        setSnackBar(true)
    }


    const onSubmitHandle = async (e: any) => {
        e.preventDefault();

        if(!_uid) return

        if(!frontFile.current){
            openSB(`Please upload front photo`)
            return
        }

        if(!backFile.current){
            openSB(`Please upload back photo`)
            return
        }
        
        const num = 8
        const fileSize = 1048576 * num
        if (frontFile.current.size > fileSize || backFile.current.size > fileSize) // 1 MiB for bytes.
        {   
            openSB(`File size too big (max ${num}MB)`)
            return;
        }

        setLoading(true)

        const upload = async (file: File) => {

            const uploadImageRef = ref(storage, (`${VERIFICATION}/${_uid}/${new Date().getTime()}-${file.name}`))
            const uploadTask = await uploadBytes(uploadImageRef, file)
            const _url = await getDownloadURL(uploadTask.ref) as string

            return `${_url}&t=${new Date().getTime()}`
        }

        try{

            setIndicator(`Please wait, uploading images...`)
            const _urls = await Promise.all([
                upload(frontFile.current),
                upload(backFile.current)
            ])
            
            const batch = writeBatch(db)

            batch.set(doc(db, VERIFY, _uid), {
                [urls] : _urls,
                [time_stamp]: serverTimestamp(),
                [uid]: _uid,
                [video_verification]: false
            }, {merge: true})
            batch.update(doc(db, USERS, _uid) , {
                [reject_reason_after]: deleteField(),
                [video_verification]: false
            })

            // await setDoc(doc(db, VERIFY, _uid) , {
            //     [urls] : _urls,
            //     [time_stamp]: serverTimestamp(),
            //     [uid]: _uid,
            //     [video_verification]: false
            // })

            // await updateDoc(doc(db, USERS, _uid) , {
            //     [reject_reason_after]: deleteField(),
            //     [video_verification]: false
            // })

            setIndicator(`Almost done...`)
            await batch.commit()

            openSB("Uploaded")

            //window.location.reload()

        }catch(error) {
            openSB("Unexpected error")
        }

        setIndicator("")
        setLoading(false)
    }

    const onChangeHandleFront = (e:React.ChangeEvent<HTMLInputElement>) => {

        const element = e?.target as HTMLInputElement
        let files = (element).files
        
        if (files !== null && files.length !== 0){
            const _file = files[0]
            frontFile.current = _file
        }
    }

    const onChangeHandleBack = (e:React.ChangeEvent<HTMLInputElement>) => {

        const element = e?.target as HTMLInputElement
        let files = (element).files

        if (files !== null && files.length !== 0){
            const _file = files[0]
            backFile.current = _file
        }
    }

    const onFirstCheckChange = (event: ChangeEvent<HTMLInputElement>, checked: boolean) => {
        setFirstCheck(checked)
    }

    const onSecondCheckChange = (event: ChangeEvent<HTMLInputElement>, checked: boolean) => {
        setSecondCheck(checked)
    }

    return <>
    <CenterSnackBar open={openSnackBar} message={msg} autoHideDuration={1500} onClose={onCloseSnackbar}/>
    <Dialog 
        fullWidth
        fullScreen={size.width < 480}
        {...props}
        open={open} onClose={onClose} >

    <form onSubmit={onSubmitHandle}>
        <DialogTitle color={verified === false ? "error" : "inherit"} >{verified === false ? "Waiting for approval" : verified ? "Approved" : `${t("upload.media.label")}`}</DialogTitle>

        <DialogContent>
            {(rejectedReasonAfter && verified === undefined) && <DialogContentText variant='caption' color="error" >{rejectedReasonAfter}<br/></DialogContentText>}

            {verified === false ? <>
            <DialogContentText gutterBottom><b>Our team will review your documents within 24 hours.</b><br/><br/>
                You may resubmit your documents. You may censor any sensitive information on the document except for <b>date of birth and face photo</b>.</DialogContentText>
                <UploadFrontBackInput 
                    onChangeHandleFront={onChangeHandleFront}
                    onChangeHandleBack={onChangeHandleBack}
                />
            </> : <>

                <CenterFlexBox marginBottom={2}>
                    <img    
                        style={{ maxWidth: "100%", maxHeight: "calc(100vh - 500px)" }}
                        src="https://images.rentbabe.com/assets/verification/verifiedselfie.webp" 
                        alt=""
                    />
                </CenterFlexBox>

                {verified !== true && <>
                    <DialogContentText gutterBottom>
                        {t("how.to.upload.v.doc")}

                    </DialogContentText>
                        <UploadFrontBackInput 
                    onChangeHandleFront={onChangeHandleFront}
                    onChangeHandleBack={onChangeHandleBack}
                />
                </>}
            </>}

        <br/>
        <br/>

        {verified === undefined && <Box><FormControlLabel 
            // sx={{width: "100%", paddingRight: "16px"}} 
            labelPlacement="end" 
            control={<Checkbox checked={firstCheck} onChange={onFirstCheckChange} color="secondary"/>} 
            label={
            <Typography color="text.secondary" fontSize={12}>
                I understand that I was informed to censor off all sensitive information on the documents that I had submitted except for <b>date of birth and face photo.</b>
            </Typography>
            } 
        />

        <br/>
        <br/>

        <FormControlLabel 
            // sx={{width: "100%", paddingRight: "16px"}} 
            labelPlacement="end" 
            control={<Checkbox checked={secondCheck} onChange={onSecondCheckChange} color="secondary"/>} 
            label={
            <Typography color="text.secondary" fontSize={12}>
                I consent that the platform may collect, use and disclose my date of birth and face photo information to verify my age and to prove my identity, in accordance with the Personal Data Protection Act 2012.
            </Typography>
            } 
        /></Box>}

        <br/>
        <br/>

        <Typography color="error" variant='caption'>{indicator}</Typography>

        </DialogContent>

        {verified !== true && <DialogActions>
            <Button color='secondary' variant='text' onClick={onClose}>Cancel</Button>
            <Button 
            disabled={isLoading ? true : verified === false ? false : !(secondCheck && firstCheck)} 
            type='submit' 
            color='secondary'
            endIcon={
                isLoading && <CircularProgress size={12} color="secondary"/>
            } 
            variant='text'>{verified === false ? "Update" : "Submit"}</Button>
        </DialogActions>}

        </form>
    </Dialog>



    </>
 
}

export default GovDialog