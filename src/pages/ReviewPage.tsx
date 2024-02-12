import  { 
  FC,
  useState, 
  useEffect, 
  SyntheticEvent, 
  ChangeEvent,
  useRef,
} from 'react';

import {
  completed as completedKey, 
  comments as commentsKey, 
  ratings as ratingsKey, 
  REVIEWS, 
  USERS, uid, nickname as nicknameKey, 
  mobileUrl, 
  annonymous, 
  ratings2, 
  sender, 
  tele_id,
  APNSToken,
  orderIdKey,
} from "../keys/firestorekeys"

import { db } from "../store/firebase";
import { Helper } from '../utility/Helper';

import { 
  Avatar, 
  Box, 
  Button, 
  Card, 
  CardContent, 
  CardHeader, 
  DialogActions, 
  FormControlLabel, 
  Grid, 
  LinearProgress, 
  Rating, 
  Switch, 
  TextField, 
  Typography
} from '@mui/material';
  
import { doc, getDoc } from 'firebase/firestore';

import { red } from '@mui/material/colors';
import { APNSTokenProps, useUser } from '../store';

import LoginPage from './LoginPage';
import LoadingScreen from '../components/Loaders/LoadingScreen';

import { functions } from '../store/firebase';
import { httpsCallable } from 'firebase/functions';
import { isAnnon } from '../keys/localStorageKeys';

// import './css/FormStyle.scss';
import './scss/ReviewPage.scss';
import CenterSnackBar from '../chats/components/Snackbar/CenterSnackBar';
import { sendPushNotificationFunction, sendTelegramNotificationFunction, updateUserReviewFunction } from '../keys/functionNames';
import CenterFlexBox from '../components/Box/CenterFlexBox';
import CompletedService from '../components/Payment/CompletedService';

const ReviewPage: FC = () => {
  
  const [
    myUID, 
    myUsername
  ] = useUser((state) =>  [
    state.currentUser?.uid, 
    state.currentUser?.nickname
  ])

  const helper = new Helper()

  const querySID = helper.getQueryStringValue("sid")
  const myReviewLinkId = helper.getQueryStringValue("myReviewLinkId")

  const [comments, setComments] = useState<string>()
  const [nickname, setNickname] = useState<string>()
  const [url, setUrl] = useState<string>()

  const [isServiceCompleted, setServiceCompleted] = useState<boolean>(false)
  const [isServiceRefunded, setServiceRefunded] = useState<boolean>(false)
  const [orderIdState, setOrderIdState] = useState<string>()
  const [otherUID, setOtherUID] = useState<string>()
  const [loading, setLoading] = useState<boolean>(true)

  const [babeUUID, setBabeUUID] = useState<string | undefined>()

  const [check, setCheck] = useState<boolean>( localStorage.getItem(isAnnon) === '1' )
  
  const [completed, setCompleted] = useState<boolean>(false)
  const [ratings, setRatings] = useState<number | null>(null)

  const prevRating = useRef<number>()

  const [toast, setToast] = useState<boolean>(false)
  const [toastInfo, setToastInfo] = useState<string>("")

  const [error, setError] = useState(false)
  const [submitting, setSubmit] = useState(false)

  const [teleid, setTeleid] = useState<string>("")
  const [apnsToken, setApnsToken] = useState<APNSTokenProps | undefined>()

  function operateToast(info: string){
    setToastInfo(info)
    setToast(true)
  }

  useEffect(() => {

    if(!querySID){
      operateToast("Cannot find review")
      return
    }

    getDoc(doc(db, REVIEWS, querySID)).then(async (snapShot) => {


        const _completed = snapShot.get(completedKey) as boolean | undefined
        const _uid = snapShot.get(uid) as string

        const _sender = snapShot.get(sender) as string

        if(_sender !== myUID){
          setError(true)
          return
        }

        let _ratings = snapShot.get(ratings2) as number ?? snapShot.get(ratingsKey) as number
        const _orderId = snapShot.get(orderIdKey) as string | undefined
        const _comments = snapShot.get(commentsKey) as string
        const _annonymous = snapShot.get(annonymous) as boolean | undefined

        setOrderIdState(_orderId)

        if(_ratings === 0){
          _ratings = 1
        }else if (_ratings > 5){
          _ratings = 5
        }

        if(_completed) setCompleted(_completed)

        if(_ratings) {
          prevRating.current = _ratings
          setRatings(_ratings)
        }
        if(_comments) setComments(_comments)

        if(_annonymous !== undefined) setCheck(_annonymous)

        setOtherUID(_uid)


        //get member details
        getDoc(doc(db, USERS, _uid)).then((snapShot) => {

            const _url = snapShot.get(mobileUrl) as string
            const _nickname = snapShot.get(nicknameKey) as string

            const _teleID = snapShot.get(tele_id) as string
            const _APNSToken = snapShot.get(APNSToken) as APNSTokenProps | undefined
          
            if(_teleID) setTeleid(_teleID)
            if(_APNSToken) setApnsToken(_APNSToken)
            
            if(!_nickname || !_url){
              operateToast("Cannot find profile")
              return
            }

            setNickname(_nickname)
            setUrl(_url)

            setLoading(false)

        })

    })

  },[]) // eslint-disable-line react-hooks/exhaustive-deps


  const onChangeRatings = (event: SyntheticEvent<Element, Event>, value: number | null) => {
    setRatings(value)
  }

  const onSubmit = async (e: any) => {

    e.preventDefault()

    if(submitting) return

    if(!isServiceCompleted && babeUUID !== myUID && !isServiceRefunded) {
      operateToast("Is the service completed?")
      return
    }

    if(!ratings) {
      operateToast("Ratings is requried")
      return
    }

    if(!otherUID){
      operateToast("Please try again")
      return
    }

    setSubmit(true)

    let map : { [key: string] : any } = {
      [ratings2] : ratings,
      [completedKey]: true,
      [annonymous]: check
    }

    if(comments) map[commentsKey] = comments

    try{

      const updateUserReview = httpsCallable(functions, updateUserReviewFunction)
      let promises = []

      const promise = updateUserReview({
        id: querySID,
        uid: otherUID,
        star: ratings,
        map: map,
        prevRating: prevRating.current
      });

      promises.push(promise)

      if(!completed) {

        const text = `You have received ${ratings} star review from ${myUsername?.capitalize() ?? "a user"}!`

        if(teleid){
          const sendTelegramNotification = httpsCallable(functions, sendTelegramNotificationFunction)
          const msg = encodeURIComponent(text)

          const promise = sendTelegramNotification({
            tele_id: teleid,
            text: msg
          })

          promises.push(promise)
        }

        if(apnsToken){
          const sendPushNotification = httpsCallable(functions, sendPushNotificationFunction)

          const promise = sendPushNotification({
              token: apnsToken,
              title: nickname ?? "",
              body: text ?? "",
              icon: url?.toCloudFlareURL() ?? ""
          })

          promises.push(promise)
        }
      }

      await Promise.all(promises)

      prevRating.current = ratings

      setTimeout(() => {
        setCompleted(true)
        operateToast("Thank you for the feedback")
      }, 500)
   
    }catch(error) {

      console.error(error)
      operateToast("Unexcepted error occur")

    } 
    
    setSubmit(false)
  }

  const onChangeCheck = (_: ChangeEvent<HTMLInputElement>, checked: boolean) => {
    localStorage.setItem(isAnnon, checked ? '1' : '0')
    setCheck(checked)
  }

  const onToastClose = () => {
    setToast(false)
  }



  function disableButton(): boolean{
    // orderIdState ? isServiceCompleted ? false : isServiceRefunded ? false : myUID !== babeUUID : false

    if(orderIdState){
      if(isServiceCompleted){
        return false
      }else{
        if(isServiceRefunded){
          return false

        }else return myUID !== babeUUID
      }
       
    } else return true
  }

  if(!myUID) return <LoginPage/>

  else if(error) return <CenterFlexBox height="100vh">
    <Typography>This page is not for you.</Typography>
  </CenterFlexBox>

  else if(loading || !otherUID) return <LoadingScreen/>

  else return <CenterFlexBox position="relative" height="100vh"  >

    <Box
      sx={{opacity: 0.56}}
      className='chat-background'
      zIndex={0}
      position="absolute"
      height="100vh"
      width="100vw"
    />
  
  <Grid zIndex={1} container spacing={0} direction="column" alignItems="center" >

      <Grid item minWidth={375} minHeight={400} >

      {completed && <Typography variant='h6' marginLeft={1} fontWeight="bold">Thank you for the feedback!</Typography>}

        <Card elevation={8}>

          {submitting && <LinearProgress color='secondary' /> } 

          <CardHeader
            avatar={
              <Avatar src={url} sx={{ bgcolor: red[500] }}>

              {nickname?.[0].toUpperCase() ?? "A"}

              </Avatar>
            }

            title={  ( (nickname?.charAt(0).toUpperCase() ?? "") + nickname?.slice(1) ?? "") ?? "Anonymous" }
            subheader={completed ? `Update your review` : `Give ${nickname} a review` }

            />
  
            <CardContent>

            <form onSubmit={onSubmit}>
      

            <FormControlLabel
              control={
                <Switch color='secondary' checked={check}  onChange={onChangeCheck} />
              }
              label="Annonymous"
            />  

            <br/>
            <br/>

            <Rating size='large' value={ratings} onChange={onChangeRatings} />

            <br/>
            <br/>

            <TextField 
              value={comments}
              rows={3} 
              multiline
              color='secondary'
              label='Share your experience'
              margin='dense'
              variant='outlined'
              fullWidth
              autoComplete='off'
              onChange={(e) => {
                  setComments((e.target).value)
              }}
            />
      
            <br/>
            <br/>

            {orderIdState && <CompletedService
              reviewId={orderIdState}
              orderId={orderIdState}
              myReviewLinkId={myReviewLinkId}
              serviceCompleted={() => setServiceCompleted(true)}
              serviceRefunded={() => setServiceRefunded(true)}
              getbabeUUID={(UUID) => {
                setBabeUUID(UUID)
              }}
            />}

            <br/>
            <br/>
            
            <DialogActions>
              <Button 
                disabled={disableButton()} 
                variant='contained' 
                color='secondary' 
                type='submit'>{completed ? "Update" : "Submit"}</Button>
            </DialogActions>
   
          </form>

        </CardContent>

        </Card>

      </Grid>
      
      <CenterSnackBar 
        open = {toast} message={toastInfo} autoHideDuration={2000} onClose={onToastClose}
      />

    </Grid>
    </CenterFlexBox>
};

export default ReviewPage;
