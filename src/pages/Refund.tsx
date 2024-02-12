import { Avatar, Button, Card, CardContent, CardHeader, 
    CircularProgress, 
    LinearProgress, Skeleton, TextField, Typography } from '@mui/material';
import { Box } from '@mui/system';
import { doc, getDoc } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { FC, useEffect, useState } from 'react';
import CenterSnackBar from '../chats/components/Snackbar/CenterSnackBar';
import CenterFlexBox from '../components/Box/CenterFlexBox';
import CoinImage from '../components/CustomImage/CoinImage';
import { OrderStruct } from '../keys/props/FirestoreStruct';
import { OrderStatusEnum } from '../enum/OrderEnum';
import { ORDER } from '../keys/firestorekeys';
import { requestRefundFunction, sendTelegramNotificationFunction } from '../keys/functionNames';
import { useUser } from '../store';
import { db, functions, storage } from '../store/firebase';
import { Helper } from '../utility/Helper';
import LoginPage from './LoginPage';

const Refund : FC = () => {

    const helper = new Helper()
    const id = helper.getQueryStringValue("id")

    const [myUID] = useUser((state) => [state.currentUser?.uid])

    const [error, setError] = useState<boolean>(false)
    const [loading, setLoading] = useState<boolean>(true)
    const [loadingSubmit, setLoadingSubmit] = useState<boolean>(false)

    const [reason, setReason] = useState<string>()
    const [data, setData] = useState<OrderStruct | undefined>()

    const [file, setFile] = useState<File | undefined>()

    const [alert, setAlert] = useState<boolean>(false)
    const [msg, setMsg] = useState<string>()


    function openAlert(msg: string){
        setMsg(msg)
        setAlert(true)
    }

    const onHandleReason = 
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> ) => {
  
        const value = event.currentTarget.value
        
        setReason(value)
    
    }

    const onChangeHandle = (e:React.ChangeEvent<HTMLInputElement>) => {

        const element = e?.target as HTMLInputElement
        let files = (element).files

        if (files !== null && files.length !== 0){
            const _file = files[0]
            setFile(_file)
        }
    }

    useEffect(() => {
        if(id){

            getDoc(doc(db, ORDER, id))
            .then((snap) => {
    
                if(snap.exists()){
                    const _data = snap.data() as OrderStruct
                    if(myUID) setReason(_data.rrn?.[myUID]?.n)
                    setData(_data)
    
                }else{
                    setError(true)
                }
    
            }).finally(() => {
                setLoading(false)
            })

        }else setError(true)

        // eslint-disable-next-line
    } , [id])

    const onSubmit = async (e: any) => {
        e.preventDefault();

        if(!file || !reason || !myUID) return
        if(loadingSubmit) return

        setLoadingSubmit(true)

        const uploadImageRef = ref(storage, 
            (`REPORT/REFUND/${id}/${new Date().getTime()}-${file.name}`))


        try{
            const uploadTask = await uploadBytes(uploadImageRef, file)
            const _url = await getDownloadURL(uploadTask.ref) as string

            try{
                const sendTelegramMessage = httpsCallable(functions, sendTelegramNotificationFunction);
                sendTelegramMessage({
                    tele_id: "858353262",
                    text: encodeURIComponent(`Refund request: ${id}`)
                })
            }catch{}

            const requestRefund = httpsCallable(functions, requestRefundFunction);
            await requestRefund({
                id: id,
                url: _url?.toCloudFlareURL() ?? "",
                reason: reason
            })

            openAlert("Success")

            window.location.reload()

        }catch(error) {

            openAlert(`${error}`.replace("FirebaseError: ", ""))
        }
      
        setLoadingSubmit(false)
    }

    function getTitle(index: OrderStatusEnum | undefined) {
        switch (index) {
            case OrderStatusEnum.pending_refund:                
                return "Refund"

            case OrderStatusEnum.refund_rejected:                
                return "Rejected"

            case OrderStatusEnum.refunded:                
                return "Refunded"
        
            default:
                return "Refund"
        }
    }



    if(!myUID) return <LoginPage/>
    
    else if(error) return <CenterFlexBox className='chat-background' height="100vh">
        <Typography variant='caption' color="text.secondary">Error, not found</Typography>
    </CenterFlexBox>

    else return <CenterFlexBox className='chat-background' height="100vh">

        <Card sx={{minWidth: 350, maxWidth: 550, width: "100%", margin: "0px 10px"}}>

        {loadingSubmit && <LinearProgress color="warning" />}

            { (data?.st === OrderStatusEnum.pending_refund && data?.rrn?.[myUID]) ? <CardContent>
                <Typography color="error" 
                variant="caption">Please wait for our review team to investigate the refund request. 
                You may check on the status by click on "Order"</Typography>

            </CardContent> : <CardContent>
                    <Typography 
                        color={data?.st === OrderStatusEnum.refunded ? "error" : "inherit"}
                        variant="h6"
                    >
                        {getTitle(data?.st)}
                    </Typography>
                    <Typography 
                        color="text.secondary" 
                        variant="caption">{`${data?.st === OrderStatusEnum.refunded ? `${data?.pr} Credits`  : "Please issue refund within 72 hours"}`}</Typography>

                    { data?.rrn2?.[myUID]?.rrn &&  <>
                        <br/>
                        <Typography color="error" 
                        variant="caption">{data?.rrn2[myUID]?.rrn}</Typography>
                    </>}
        
                    
                </CardContent>
            }

        {
            loading ? <CardHeader

              avatar ={
                <Avatar 
                variant='rounded'
                sx={{width: 100, height: 100}}
              >
                <Skeleton variant='rectangular' width={100} height={100}/>
              </Avatar>}

              title={<Skeleton variant='text' width="100px"/>}
              subheader={ 
                <CardHeader
                avatar={
                  <Avatar
                  variant='circular'
                  sx={{width: 38, height: 38}}
                  >
                    <Skeleton variant='circular'/>
                  </Avatar>
                }
                subheader={<Skeleton variant='text' width="50px"/>}
              />
              }>
               
                <Skeleton variant='rectangular' height={150} width="100%"/>
              </CardHeader>
              :

              <CardHeader
                sx={{cursor: "pointer"}}
                avatar ={
                  <Avatar 
                    variant='rounded'
                    src={data?.services?.details?.image ?? "https://images.rentbabe.com/assets/rentblogo.svg"}
                    sx={{width: 100, height: 100}}
                  />
                }
                title={data?.st === OrderStatusEnum.refunded ? "" : data?.services?.details?.title ?? "Rent a Date, Rent a Friend"}
                subheader={
                  <CardHeader
                    avatar={
                      <Avatar src={myUID === data?.cuid ? data?.inf?.[data.buid]?.u?.toCloudFlareURL() 
                        : data?.inf?.[data.cuid]?.u?.toCloudFlareURL()}
                      />
                    }

                    title={<>
                        {
                            data?.st === OrderStatusEnum.refunded ? <>
                                <Typography>We have refunded you the Credits to your <a href="/wallet">Wallet</a>.</Typography>
                            </> : <></>
                        }
                    </>}
                  />
                }
              /> 
            }

            {
                data?.st !== OrderStatusEnum.refunded && <form onSubmit={onSubmit}>
            <CardContent>

                <Box>
                    <Typography fontWeight="bold">
                        Refund Reason
                    </Typography>
                    <TextField
                        margin="dense"
                        value={reason}
                        required
                        fullWidth
                        // placeholder="Enter a reason"
                        variant='standard'
                        color="warning"
                        multiline
                        maxRows={3}
                        onChange={onHandleReason}
                    />
                </Box>

                <br/>
                <br/>

                <Box>
                    <Typography fontWeight="bold">
                        Photo Evidence
                    </Typography>

                    {(data?.rrn?.[myUID]?.u && !file) && <a 
                        rel="noreferrer" 
                        href={data?.rrn?.[myUID]?.u} 
                        target="_blank"
                    >
                        <img
                            style={{borderRadius: "8px", objectFit: "cover", objectPosition: "center"}}
                            width={150}
                            height={150}
                            src={data?.rrn?.[myUID]?.u}
                            alt=""
                        />
                    </a>}

                </Box>
     
                <input required type="file" onChange={onChangeHandle} ></input>

                <br/>
                <br/>


                <Box marginTop={4} marginBottom={1} display="flex" width="100%">

                    <Box display="flex" alignItems="center">
                        <Typography>Amount:&nbsp;&nbsp;</Typography>

                        <CoinImage
                            imageWidth={21}
                        />
                        <Typography>{loading ? <Skeleton variant='text' width={50} /> : (data?.pr as number / 100).toFixed(2)} </Typography>
                    </Box>

                    <Button 
                    type="submit"
                    disabled={loadingSubmit}
                    endIcon={ loadingSubmit && <CircularProgress color="primary" size={12}/>}
                    sx={{marginLeft: "auto"}} variant='contained' color="warning">{
                       (data?.st === OrderStatusEnum.pending_refund && data?.rrn?.[myUID] )? "RE-SUBMIT" : "SUBMIT"
                    }</Button>
                </Box>

                {
                    data?.st === OrderStatusEnum.pending_refund 
                    && <Typography variant='caption' color="text.secondary">
                        You may update your refund request by re-submitting it.
                    </Typography>
                }
               
            </CardContent>
            </form>
            }


        </Card>

        <CenterSnackBar
            message={msg}
            open={alert}
            onClose={() => setAlert(false)}
            onClick={() => setAlert(false)}
            autoHideDuration={2000}
        />
        
    </CenterFlexBox>
 
}

export default Refund