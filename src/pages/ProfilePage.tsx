import React, { useEffect, useRef, version } from 'react';

import './scss/NewAwesomeSlider.scss';
import './scss/ProfilePage.scss';

import { Box, Button, Card, CircularProgress, Divider, Fab, IconButton, Skeleton, Snackbar, Typography } from '@mui/material';

import useState from 'react-usestateref';

import {
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  onSnapshot,
  serverTimestamp,
  setDoc,
  Timestamp,
  where
} from "firebase/firestore";
import { analytics, db } from '../store/firebase';

import {
  admin,
  APNSToken,
  availability as availabilityKey,
  balance,
  bio as bioKey,
  club,
  completed,
  CREDIT,
  dob as dobKey,
  emeets,
  end,
  // video_verification, 
  foodPref,
  // chat_room_id, 
  geoEncodings,
  gonow_bio,
  height as heightkey,
  HISTORY,
  isg_access_token,
  isOnline,
  mobileUrl as mobileUrlKey,
  nickname as nicknameKey,
  orientation,
  points,
  price as priceKey,
  priceLimit,
  privacy,
  PUBLIC,
  race as raceKey,
  raceName,
  ratings,
  REVIEWS,
  services,
  state,
  tele_id,
  //currency as currencyKey,
  time_stamp,
  uid,
  url_height,
  url_width,
  urls as urlsKey,
  USERS,
  video_verification,
  views as viewsKey,
  voice_url
} from "../keys/firestorekeys";

import { APNSTokenProps, useConversationStore, useUser } from '../store';
import { Helper } from '../utility/Helper';

import history from '../utility/history';
import Events from './javascripts/Events';

import { LazyLoadImage } from 'react-lazy-load-image-component';
import { useLocation } from 'react-router-dom';

import { operator, RBAC } from '../enum/MyEnum';
import Conversation from '../utility/Conversation';
// import { mobileWidth } from '../dimensions/basicSize';

//hooks
import { useWindowSize } from '../hooks/useWindowSize';

//compoenents
import CoverLayer from '../components/Loaders/CoverLayer';
import LoadingScreen from '../components/Loaders/LoadingScreen';
import AwesomeSlider from '../components/react-awesome-slider';
import ReviewForm from '../components/Reviews/ReviewForm';
// import { countries } from '../components/AdminPage/components/CurrencySelect';
import AwesomeSliderDialog from '../components/AwesomeSliderDialog';
import ReportDialog from '../components/Dialogs/Rent/ReportDialog';
import DefaultTooltip from '../components/Tooltip/DefaultTooltip';

import { useTranslation } from 'react-i18next';
import shallow from 'zustand/shallow';
import InsufficientFundDialog from '../components/Dialogs/Warning/InsufficientFundDialog';
import VoiceButton from '../components/Voice/VoiceButton';
import { Item, StarProps } from '../keys/props/profile';
import { detailProps, servicesProps, ServiceType } from '../keys/props/services';
import { Calculator } from '../utility/Calculator';
import { ServicesHelper } from '../utility/ServicesHelper';

import ScrollContainer from 'react-indiana-drag-scroll';
import Approvals from '../components/admin/Admission/Approvals';
import SendTelegramMsg from '../components/admin/components/SendTelegramMsg';
import CenterFlexBox from '../components/Box/CenterFlexBox';
import ShareProfileDialog from '../components/Dialogs/Profile/ShareProfileDialog';
import VerticalTabs from '../components/Services/component/VerticalTabs';
import { hideServicesKey, serviceTypeStorage } from '../keys/localStorageKeys';

import { green } from '@mui/material/colors';
import { logEvent } from 'firebase/analytics';
import CenterSnackBar from '../chats/components/Snackbar/CenterSnackBar';
import GovApprovals from '../components/admin/Admission/GovApprovals';
import FlexBox from '../components/Box/FlexBox';
import FlexGap from '../components/Box/FlexGap';
import RequestOrderDialog from '../components/Dialogs/Profile/RequestOrderDialog';
import AgencyHeader from '../components/Headers/AgencyHeader';
import EmeetsPrefStack from '../components/Misc/EmeetsPrefStack';
import ImageWithFallback from '../components/Misc/ImageWithFallback';
import RatingLabel from '../components/RentPage/components/RatingLabel';
import ReviewCard from '../components/Reviews/ReviewCard';
import { PriceLimitProps } from '../components/Services/PriceLimit';
import Ellipsis from '../components/Typography/Ellipsis';
import UserCardAvatar from '../components/User/UserCardAvatar';
import { isLoyalPeriod, loyalPointsLimit } from '../data/data';
import { useGetDocuments } from '../hooks/useGetDocuments';
import { AnalyticsNames } from '../keys/analyticNames';
import { ClubProps, EmeetsProps, HistoryProps, Reviews } from '../keys/props/common';
import { generateFirebaseDynamicLink } from '../utility/GlobalFunction';
import HorizontalServicesScrollView from './components/profile/HorizontalServicesScrollView';
import ImageIndicatorTabs from './components/profile/ImageIndicatorTabs';
import ProfilePageContainer from './components/profile/ProfilePageContainer';
import ProfileMoreButton from './components/ProfileMoreButton';
import RequestOrderBottomBar from './components/RequestOrderBottomBar';

interface props{
  chatRoomId?: string
  data?:Item | null | undefined
  onClose?: () => void
  fromModal? : boolean 
  isPrivate: boolean | undefined
}

export interface ServiceDetails {
  id?: string
  serviceType?: ServiceType
  details?: detailProps
}


const ProfilePage: React.FC<props> = ({chatRoomId, data, onClose, fromModal, isPrivate }) => {

  const { t } = useTranslation()

  const [
    isPremium,
    myUID, 
    profileImage, 
    myNickname, 
    userRBAC,
    myBalance,
    myPoints
  ] = useUser((state) => 
  [
    state.currentUser?.isPremium, 
    state.currentUser?.uid,
    state.currentUser?.profileImage,
    state.currentUser?.nickname,
    state.currentUser?.userRBAC,
    state.currentUser?.balance,
    state.currentUser?.points
  ], shallow)


  const mainBoxRef = useRef<HTMLParagraphElement | null>(null)
  const goNowDivRef = useRef<HTMLParagraphElement | null>(null)

  const [ size ] = useWindowSize()

  const maxWidth = 580
  const isLoyal = (!isPremium && (myPoints ?? 0) >= loyalPointsLimit) && isLoyalPeriod;

  const mobileView = (!fromModal && size.width >= maxWidth) ? false : true
  const currentConversation = useConversationStore((state) => state.currentConversation)  
  const clubName = sessionStorage.getItem(club)
  const clubState = sessionStorage.getItem(state)

  const location = useLocation<Item>()

  const convoHelper = new Conversation()
  const helper = new Helper()
  const cal = new Calculator()
  const servicesHelper = new ServicesHelper()
  const events = new Events()

  const isVerify = helper.getQueryStringValue("verify") === "true" && userRBAC === RBAC.admin
  const isAdminPage = helper.getQueryStringValue("admin") === "true" && userRBAC === RBAC.admin
  const isExact = helper.getQueryStringValue("exact") === 'true'

  const hasPage = window.location.href.includes("/page/")
  const min = 0
  const max = 10

  const pageProfileUUID = location.state?.uid ?? data?.uid ?? helper.getQueryStringValue("uid")

  const limitCount = 3
  const { data: reviews } = useGetDocuments(
    `${pageProfileUUID}-reviews-from-page`,
    collection(db, REVIEWS),
    [where(completed, "==" , true), where(uid, "==" , pageProfileUUID)],
    time_stamp,
    limitCount
  )

  const _xtimeStamp = location.state?.time_stamp ?? data?.time_stamp
  const _xemeets = location.state?.emeets ?? data?.emeets
  const _xselected = location.state?.selected ?? data?.selected
  const _xadmin = location.state?.admin ?? data?.admin
  const _xorientation = location.state?.orientation ?? data?.orientation
  const _xratings = location.state?.ratings ?? data?.ratings
  const _xuserGender = location.state?.userGender ?? data?.userGender
  const _xmobileUrl = location.state?.mobileUrl ?? data?.mobileUrl
  const _xisOnline = location.state?.isOnline ?? data?.isOnline
  const _xapply_info = location.state?.apply_info ?? data?.apply_info
  const _xgonow_bio = location.state?.gonow_bio ?? data?.gonow_bio
  const _urls = location.state?.urls ?? data?.urls
  const _vurls = location.state?.video_urls ?? data?.video_urls
  const _xnickname = location.state?.nickname ?? data?.nickname
  const _xbio = location.state?.bio ?? data?.bio

  const _xprice = location.state?.price ?? data?.price
  const _xvoiceUrl = location.state?.voiceUrl ?? data?.voiceUrl
  const _xheight = location.state?.mHeight ?? data?.mHeight ?? 0
  const _xrace = location.state?.race ?? data?.race
  const _xavailability = location.state?.availability ?? data?.availability
  const _xisg_access_token = location.state?.isgToken ?? data?.isgToken
  const _xVideoVerification = location.state?.videoVerification ?? data?.videoVerification
  const _xgeoEncodings = location.state?.geoEncodings ?? data?.geoEncodings
  const _xfood = location.state?.food ?? data?.food
  const _xdob = location.state?.dob ?? data?.dob
  const isTim : boolean = isPremium ?? false
  const isProfilePrivate = useRef<boolean | undefined>(isPrivate ?? location.state?.isPrivate)
  const _xIsTeleId = location.state?.teleId ?? data?.teleId
  const _xAPNSToken = location.state?.APNSToken ?? data?.APNSToken
  const _xactive = location.state?.active ?? data?.active
  //const _xcurrency = location.state?.currency ?? data?.currency
  const _xpriceLimit = location.state?.priceLimit ?? data?.priceLimit
  const _xservices = location.state?.services ?? data?.services ?? servicesHelper.createDefault(_xprice, _xbio)
  const _xclubName = location.state?.clubName ?? data?.clubName
  const _xclubState = location.state?.clubState ?? data?.clubState

  // const displayServiceRef = useRef<ScrollContainer | null>(null)

  const [timeStamp, setTimeStamp] = useState<Timestamp | undefined>(_xtimeStamp)
  const [emeetState, setEmeets] = useState<EmeetsProps | undefined>(_xemeets)
  const [currentIndex, setCurrentIndex] = useState<number>(0)
  const [bio, setBio] = useState<string>(_xbio)
  const [v, setV] = useState<number | undefined>()
  const [showCover, setCover] = useState<boolean | undefined>()
 
  const [profileClubName, setProfileClubName] = useState<string | undefined>(_xclubName)
  const [profileClubState, setProfileClubState] = useState<string | undefined>(_xclubState)

  const [loadingShare, setLoadingShare] = useState<boolean>(false)
  const [shareLink, setShareLink] = useState<string>()

  const [openWarningDialog, setWarningDialog] = useState<boolean>(false)
  const [openRequestDialog, setRequestDialog] = useState<boolean>(false)

  const [loadingChat, setLoadingChat] = useState<boolean>(false)
  const [ratingState, setRatings] = useState<StarProps | undefined>(_xratings)
  const [checkSent, setSent] = useState<boolean>(false)

  const [isProfileAdmin, setProfileAdmin] = useState<boolean>(_xadmin)
  const [totalUrls, setTotalUrls] = useState<Array<string>>(( _urls ?? Array<string>()).concat( _vurls ?? Array<string>()));
  const [isAbleToView, setAbleToView] = useState<boolean>( true )
  const [nickname, setNickname] = useState<string | undefined>(helper.capitalize(_xnickname))
  const [goNowBio , setGoNowBio] = useState<string | undefined>( _xapply_info ?? _xgonow_bio);
  const [height, setHeight] = useState<number | undefined>( _xheight);

  const [race, setRace] = useState<string | undefined>( _xrace);
  const [availability, setAvailability] = useState<string | undefined>( _xavailability)
  const [price, setPrice] = useState<number | undefined>(_xprice)
  const [voiceUrl, setVoiceUrl] = useState<string | undefined>(_xvoiceUrl)

  const [myServices, setServices] = useState<servicesProps | undefined>(_xservices )
  const [hideServices, setHide] = useState<boolean>(localStorage.getItem(hideServicesKey) ? true : false)

  const defaultServiceType: ServiceType = getDefaultServiceType(_xservices, _xselected?.serviceType)

  const getFirstDetail = _xservices && _xselected?.id ? (_xservices[defaultServiceType][_xselected.id] as detailProps | undefined 
    ?? servicesHelper.getFirstDetailByType(_xservices, defaultServiceType) )
  : servicesHelper.getFirstDetailByType(_xservices, defaultServiceType)

  const _serviceType = _xservices ? defaultServiceType : undefined

  const [serviceType, setServiceType] = useState<ServiceType | undefined>(_serviceType) 

  function getDefaultServiceType(_xservices: servicesProps | undefined, serviceType: ServiceType | undefined){

    if(serviceType === undefined){
      return servicesHelper.getDefaultType(_xservices)
    }else {
      if(servicesHelper.hasServiceType(_xservices, serviceType)){
        return serviceType
      }else{
        return servicesHelper.getDefaultType(_xservices)
      }
    }

    // return _xselected?.serviceType === undefined ? 
    // servicesHelper.getDefaultType(_xservices) : 
    // servicesHelper.hasServiceType(_xservices, _xselected?.serviceType) ?
    // _xselected?.serviceType :
    // servicesHelper.getDefaultType(_xservices)
  }

  function getFirstIdWorkaround(detail: detailProps | undefined): string {

    let id = detail?.id

    if(id && Number(id)){
      return `${id}`
    }else {

      let newId = detail?.category
      if(newId && Number(newId)){
        return `${newId}`
      }else{
        return "0"
      }
    }
  }


  const defaultServiceDetails = {
    id:  getFirstIdWorkaround(getFirstDetail),//getFirstDetail?.id ?? "0",
    serviceType: _serviceType,
    details: getFirstDetail ? {...getFirstDetail,
      suffix: getFirstDetail?.suffix ?? servicesHelper.getDefaultSuffix(defaultServiceType) 
    } : undefined
  }


  const [serviceDetails, setServiceDetails] = useState<ServiceDetails>(defaultServiceDetails)
  const gameProfileImage = serviceDetails.details?.profile?.toCloudFlareURL().srcSetConvert()

  const [priceLimitState, setPriceLimit] = useState<PriceLimitProps | undefined>(_xpriceLimit)
  const [isPriceLimit, setLimit] = useState<boolean>(false)
  const [geoEncoding, setGeoEncoding] = useState<string[] | undefined>( _xgeoEncodings)
  const [orientationArray, setOrientationArray] = useState<string[] | undefined>( _xorientation)

  const [alert, setAlert] = useState<boolean>(false)
  const [alertMsg, setAlertMsg] = useState<string>()
  const [alertAction, setAlertAction] = useState<React.ReactNode | null>(null)

  const numberOfServices = servicesHelper.getNumberOfServices(myServices)


  const openAlert = (msg: string, action: React.ReactNode | null = null) => {
      setAlertMsg(msg)
      setAlert(true)
      setAlertAction(action)
  }

  const openChatRoom = (chatRoomId: string | null | undefined) => () => {
    // open chatbox . 
    if(chatRoomId){
      history.push(`/page/chatbox?cri=${chatRoomId}`)
    }else{
      history.push(`/page/chat?v=${version}`)
    }
 
  }

  const [food, setFood] = useState<string | undefined>( _xfood)
  const [dob, setDob] = useState<number | string>(_xdob)

  const [isgUrls, setIsgUrls] = useState<string[]>([])
  const [isgTimeStamp, setIsgTimeStamp] = useState<string[]>([])
  const [isgDays, setIsgDays] = useState<number>()
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const indexISG = useRef<number>(0)

  const [showReport, setShowReport] = useState<boolean>(false)
  const [openReview, setOpenReview] = useState<boolean>(false)

  const [videoVerification, setVideoVerification] = useState<boolean>( _xVideoVerification ?? false)

  const [getTeleId, setTeleId] = useState<string | undefined>(_xIsTeleId);
  const [getAPNSToken, setAPNSToken] = useState<APNSTokenProps | undefined>(_xAPNSToken)
  
  // (serviceDetails.id && serviceDetails.details) ? serviceDetails : defaultServiceDetails

  function catchActiveError(){
    try{
      _xactive?.toDate()
      return _xactive
    }catch{
      return undefined
    }
  }

  const [ isUserOnline, setIsUserOnline ] = useState<boolean>(_xisOnline)
  const [ getActive, setActive ] = useState<Timestamp | undefined>(catchActiveError())
  const [mobileUrlState, setMobileUrlState, mobileUrl] = useState<string | undefined>(_xmobileUrl)
  const hasBottomInfo = (isgUrls.length > 0 || ((orientationArray?.length ?? 0) > 0) || (food?.trim() && serviceType === ServiceType.meetup))

  const showReviews = ((reviews?.length ?? 0) > 0) || myUID === pageProfileUUID

  function shouldShowCover(isPremium: boolean){
    if(pageProfileUUID === myUID){
      return false
    }

    const shouldShow : boolean = isProfilePrivate.current === undefined ? false : (isProfilePrivate.current && !isPremium) 


    return isLoyal ? false : shouldShow
  }
  
  useEffect(() => {

      // define the extra offset
      if(nickname){
        logEvent(analytics, "select_content", {
          content_type: nickname,
          content_id: pageProfileUUID, 
        }); 
      }


      if(isProfilePrivate.current !== undefined){
        setCover(shouldShowCover(isTim))
      }
      
      getData()

      let preLoadImages = []
      // pre load images
      _urls?.forEach((_url) => {
        const img = new Image()
        img.width = window.innerWidth
        const srcset = _url.toCloudFlareURL().srcSetConvert()
        if(srcset) img.srcset = srcset
        preLoadImages.push(img)
      })
      
      const unsub = onSnapshot(doc(db, USERS, pageProfileUUID), async (doc) => {

        const _admin = doc.get(admin) as boolean
        const _isOnline = doc.get(isOnline) as boolean
        const _availability = doc.get(availabilityKey) as string 

        const _race2 = doc.get(`${raceKey}2`) as {[key: string] : boolean} | undefined
        const _raceKeys = _race2 ? Object.keys(_race2).length > 0 : false
        const _raceK = _race2 && _raceKeys ? Object.keys(_race2)[0] : NaN

        const _race = helper.raceEnumToName(parseInt(_raceK as string)) ?? doc.get(raceName) as string

        const _isg_access_token = doc.get(isg_access_token) as string
        const _videoVerification = (doc.get(video_verification) as boolean) ?? false
        const _food = doc.get(foodPref) as string
        const timeStamp = doc.get(time_stamp) as Timestamp | undefined
        const _privacy = (doc.get(privacy) as number) ?? 0
        const _gonow_bio = doc.get(gonow_bio) as string
        const urls_ = (doc.get(urlsKey) as string[]) ?? []

        if(!_urls){
          let preLoadImages = []
          // pre load images
          urls_?.forEach((_url) => {
            const img = new Image()
            img.width = window.innerWidth
            const srcset = _url.toCloudFlareURL().srcSetConvert()
            if(srcset) img.srcset = srcset
            preLoadImages.push(img)
          })
        }

        const vurls_ = helper.getVideoURL(doc)
        const _price = doc.get(priceKey) as number
        const _nickname = doc.get(nicknameKey) as string
        const _bio = doc.get(bioKey) as string
        const _height = doc.get(heightkey) as number
        const _ratings = doc.get(ratings) as StarProps | undefined
        const _emeets = doc.get(emeets) as EmeetsProps | undefined
  
        let _geoEncodings = doc.get(geoEncodings) as string[] | undefined
        if(_geoEncodings?.length === 1){
          const state = _geoEncodings[0].toLowerCase()
          if(state === 'metro manila') _geoEncodings.push("Philippines")
          else if(state === 'jakarta') _geoEncodings.push("Indonesia")
          else if(state === 'kuala lumpur') _geoEncodings.push("Malaysia")
          else if(state === 'johor bahru') _geoEncodings.push("Malaysia")
        }

        const _dob = doc.get(dobKey) as Timestamp

        const _mobileUrl = doc.get(mobileUrlKey) as string
        const _teleId = doc.get(tele_id) as string
        const _APNSToken = doc.get(APNSToken) as APNSTokenProps | undefined
        //const _currency = doc.get(currencyKey) as string
        const _voiceUrl = doc.get(voice_url) as string | undefined
        const _active = doc.get(time_stamp) as Timestamp 
        
        const _orientation = doc.get(orientation) as string[] | undefined

        const _services = doc.get(services) as servicesProps | undefined
        const _priceLimit = doc.get(priceLimit) as PriceLimitProps | undefined
  
        const _club = doc.get(club) as ClubProps | undefined 

        setMobileUrlState(_mobileUrl)
        setTeleId(_teleId)
        setAPNSToken(_APNSToken)

        setIsUserOnline(_isOnline)
        setTimeStamp(timeStamp)

        let ableToView = true

        if(userRBAC !== RBAC.admin){
          if (pageProfileUUID !== myUID) {
            if( _privacy === 1 && _admin){
              if(!isPremium && !isLoyal){
                ableToView = false
                setCover(true)
              }
            }
          }
        }

        // else if (_isApproved && (isAdmin || isPremium) ) {
        //   ableToView = true
        // }else if (_isApproved && !myUID) {
        //   history.push("/Login")
        // }
        
        setAbleToView(ableToView)

        if(ableToView) {

          setProfileAdmin( userRBAC === RBAC.admin ? true : _admin)
          setNickname(helper.capitalize(_nickname))
          setPriceLimit(_priceLimit)

          const _se = _xselected?.serviceType
          const _id = _xselected?.id


          if(_se !== undefined && _id && _services?.[_se]?.[_id] !== undefined){

            setServiceType(_se)

            const firstDetail = _services[_se][_id] as detailProps
            const fId = firstDetail?.id
         
            setServiceDetails({
              id: fId, 
              serviceType: _serviceType,
              details: firstDetail ? {...firstDetail,
                suffix: firstDetail?.suffix ?? servicesHelper.getDefaultSuffix(_serviceType)
              } : undefined
            })

          }else{
 
            const _serviceType = getDefaultServiceType(_services, _se)

            const getService = servicesHelper.getFirstDetailByType(_services, _serviceType)
            const firstDetail = getService ?? getFirstDetail

            if(getService !== undefined){
              setServiceType(_serviceType)
            }

            const fId = getFirstIdWorkaround(firstDetail) //firstDetail?.id

            setServiceDetails({
              id: fId, 
              serviceType: _serviceType,
              details: firstDetail ? {...firstDetail,
                suffix: firstDetail?.suffix ?? servicesHelper.getDefaultSuffix(_serviceType)
              } : undefined
            })

          }

          setPrice(_price)
          
          setServices( _services ?? servicesHelper.createDefault(_price, _bio) )

          // setCurrency( getCurrency(_currency, _geoEncodings) )

          const _end = doc.get(end) as Timestamp
          const free = helper.amIFreeToday(_end)

          if(free && !_xapply_info){
            setGoNowBio(_gonow_bio)
          }

          setEmeets(_emeets)
          setBio(_bio)
          setRatings(_ratings)
          setRace(_race)
          setHeight(_height)
          setProfileClubName(_club?.name)
          setProfileClubState(_club?.state)
          setAvailability(_availability)
          setVideoVerification(_videoVerification)
          setGeoEncoding(_geoEncodings)
          setVoiceUrl(_voiceUrl)
          setFood(_food)
          setDob(helper.ageFromDateOfBirthday(_dob?.toDate()))
          setOrientationArray(_orientation)

          setActive(_active)

          const total = urls_.concat(...vurls_).filter(a => a !== "")

          setTotalUrls(total)

          if(_isg_access_token){
            if(_isg_access_token !== _xisg_access_token){
              fetchISGPhotos(_isg_access_token)
            }
          }else{
            setIsgUrls([])
          }
        }
      })

      if(!fromModal) {
        window.scrollTo(0, 1)
      }

      events.init(document.getElementById('profile-page'))

      return () => {
        events.deinit()
        unsub()
      }
        
  },[]) // eslint-disable-line react-hooks/exhaustive-deps


  const copySharedLink = async ()=>{
                    
    //The image should be at least 300x200 px, and less than 300 KB.

    // const title = `${nickname} | RentBabe`;
    // const previewImage = isProfilePrivate ? "" : ( mobileUrl.current ?? totalUrls[0])

    // const baseURI = "https://firebasedynamiclinks.googleapis.com/v1"
    // const url = `${baseURI}/shortLinks?key=${config.apiKey}`;

    // let profile = `https://rentbabe.com`

    // profile += `/Profile?uid=${__uid}`

    // const response = await fetch(url, {
    //   "method": "POST",
    //   "headers": {
    //     "content-type": "application/json"
    //   },
    //   "body": JSON.stringify( {"dynamicLinkInfo": { 

    //     "domainUriPrefix": "https://rentbabe.com/user",
    //     "link": profile,
        
    //     "socialMetaTagInfo" :{
    //       "socialImageLink": previewImage,
    //       "socialTitle": title,
    //       "socialDescription": 
    //         `${serviceDetails.details?.bio ?? bio ?? "Check me out at this Rent a Friend, Rent a Date platform."}`
    //     }} , "suffix": {
    //     "option": "SHORT"
    //   }} )
    // });

    // const data = await response.json();
    // const link = data.shortLink;

    // if(link){
    //   try{
    //     logEvent(analytics, "share", {
    //       method: "Dynamic link",
    //       content_type: nickname ?? "user",
    //       item_id: __uid,
    //     })  
    //   }catch{}

    //   try{
    //     logEvent(analytics, AnalyticsNames.buttons, {
    //       content_type: "profile share button",
    //       item_id: "profile share button", 
    //     })  
    // }catch{}
    // }

    setLoadingShare(true)

    const link = await generateFirebaseDynamicLink(
      pageProfileUUID, 
      nickname,
      dob,
      geoEncoding,
      isProfilePrivate.current ? "" : ( mobileUrl.current ?? totalUrls[0]), 
      serviceDetails.details?.bio ?? bio ?? `${t("social.descrip")}`)

    if(link){
      try{
        logEvent(analytics, "share", {
          method: "Dynamic link",
          content_type: nickname ?? "user",
          item_id: pageProfileUUID,
        })  
      }catch{}

      try{
        logEvent(analytics, AnalyticsNames.buttons, {
          content_type: "profile share button",
          item_id: "profile share button", 
        })  
    }catch{}
    }

    setShareLink(link)
    setLoadingShare(false)

  }

  const reportButtonClick = () => {
    if(!myUID){
      history.push("/login")
      return
    }
    setShowReport(true)
  }

  const sendRequestOrder = async () => {



    if(!timeStamp){
      openAlert("User is currently not accepting any new orders.")
      return
    }

    if(!myUID){
      history.push("/login")
      return
    }

    if (!myNickname || !profileImage ){
      history.push(`/page/Admin?uid=${myUID}`)
      onClose?.()
      return
    }

    if(typeof(myNickname) === 'undefined' || typeof(profileImage) === 'undefined'){
      history.push(`/page/Admin?uid=${myUID}`)
      onClose?.()
      return
    }

    if(myUID === pageProfileUUID){
      return
    }

    if(!myServices){
      openAlert(t("no.services"))
      return
    }

    if(!isProfileAdmin){
      openAlert(t("under.review"))
      return
    }

    let access = false

    if(priceLimitState?.slmt || priceLimitState?.wlmt){
      try{
        
        let _balance = 0
        let _total = 0

        if(hasPage){
          _balance = myBalance ?? 0
          _total = myPoints ?? 0
        }else{
          setLoadingChat(true)
          const snapShot = await getDoc(doc(db, CREDIT, myUID))
          if(snapShot.exists()){
            _balance = (snapShot.get(balance) as number) ?? 0
            _total = (snapShot.get(points) as number) ?? 0
          }
          setLoadingChat(false)
        }

        let _spent = _total - _balance

        if(_spent < 0){
          _spent = _total
        }

        const spendLimit = priceLimitState.slmt ?? 0
        const walletLimit = priceLimitState.wlmt ?? 0
        const _operator = priceLimitState.opkey ?? operator.either
        const aboveSL = _spent >= spendLimit
        const aboveWL = _balance >= walletLimit

        if(_operator === operator.both){
          if(aboveSL && aboveWL){
            access = true
          }else{
            setLimit(true)
            setWarningDialog(true)
            return
          }
        }else{
          if(aboveSL || aboveWL){
            access = true
          }else{
            setLimit(true)
            setWarningDialog(true)
            return
          }
        }
        
      }catch(error){
        // console.log(error)
      }
    }else access = true

    // serviceDetails.id ? serviceDetails : defaultServiceDetails
    if(access){
      setRequestDialog(true)
    }

  }

  async function getData(){

    const queryUid = pageProfileUUID 

    if(_xisg_access_token){
      fetchISGPhotos(_xisg_access_token)
    }

    const r = helper.randomInt(min, max)
    let new_views = 0

    let promises = 
    [
      setDoc(doc(db, PUBLIC, queryUid, viewsKey, r.toString()) , {
        [viewsKey]: increment(1)
      }, { merge: true }), 
      getDocs(collection(db, PUBLIC, queryUid, viewsKey)).then((docs) => {
          docs.forEach((doc) => {
  
            var _views = doc.get(viewsKey) as number
            if(_views !== undefined && _views !== null){
              new_views += _views
            }
          })
          setV(new_views)
      })
    ]

    if(myUID && queryUid && nickname){
      const map: HistoryProps = {
        nick: nickname,
        t: serverTimestamp(),
        uid: queryUid
      }

      if(mobileUrl.current){
        map.u = mobileUrl.current
      }
      
      promises.push(
        setDoc(doc(db, HISTORY, myUID, USERS, queryUid), map, {merge: true})
      )
    }

    Promise.all(promises)
  }

  function fetchISGPhotos(isgAccessToken: any){
    

    const baseURI = "https://graph.instagram.com/me/media?"
    const fields = "fields=media_url,timestamp"
    
    const isgRequest = `${baseURI}${fields}&access_token=${isgAccessToken}`

    fetch(isgRequest).then(async (res) => {
      const body = await res.json()
      const isgError = body["error"]
   
      if(isgError){
        return
      }
      
      const array = body.data

      const holder: string[] = []
      const timeHolder: string[] = []

      for (let index = 0; index < array.length; index++) {

        const element = array[index];

        const mediaUrl:string | undefined = element["media_url"];
        const time:string = element["timestamp"];

        if(!mediaUrl) continue
        
        holder.push(mediaUrl)
        timeHolder.push(time)
      }

     
      setIsgUrls(holder)
      setIsgTimeStamp(timeHolder)
      
      
    }).catch((error) => {
      console.log(error)
    })
  }

  function getDays(index:number) : number{

    const date = (new Date(isgTimeStamp[index].split('+')[0]))

    var diff = Math.abs(new Date().getTime() - date.getTime());
    var diffDays = Math.ceil(diff / (1000 * 3600 * 24)); 
  
    return diffDays
  }

  // function isVideo(url:string) {
  //   return(url.split("?")[0].toLowerCase().match(/\.(mp4|mov|webm|avi|wmv|mkv)$/) !== null)
  // }

  const closeOverLay = () => {
    setIsOpen(false)
  }

  const handleClose = (sent?:boolean) => {
    setWarningDialog(false)
    setSent(!!sent)
  }

  const onCloseReview = () => {
    setOpenReview(false)
  }

  if (showCover) return <CoverLayer/>
  else if(!isAbleToView) return <LoadingScreen/>
  else if(!showCover && isAbleToView)return (
  
  <Box ref={mainBoxRef} className={`page ${mobileView ? "" : "chat-background"}`} bgcolor="white" id = "profile-page">
    <ProfilePageContainer mobileView={mobileView} numberOfServices={numberOfServices} maxWidth={maxWidth}>

    <textarea readOnly id= 'link'  style={{position:"absolute" , top: -999}}/>

    {!window.location.href.split("/").includes("page") && <AgencyHeader clubName={clubName} clubState={clubState}/> }

    {
      totalUrls.length > 1 && 
      <ImageIndicatorTabs 
        index={currentIndex} 
        width={size.width} 
        maxWidth={maxWidth} 
        totalUrls={totalUrls} 
        fromModal={fromModal}        
      />
    }

    <Box id="top-main-div-id" className="top-main-div" position="relative">
      <AwesomeSlider
      
      currentIndex={(index: number) => {
        setCurrentIndex(index)
      }} 
      organicArrows= {false}
      mobileTouch
      className="slides">
          {totalUrls?.map((url, index) => {

            const height = parseInt(url.getQueryStringValue(url_height) ?? "300")
            const width = parseInt(url.getQueryStringValue(url_width) ?? "300")

            return ( !url.isURLVideo() )?
              (
 
              <div key={index} className="profile-main">
                    <ImageWithFallback
                      style={{objectFit: size.width > 500 && !fromModal ? "scale-down" : "cover"}}
                      draggable={false}
                      fallback={[url.toCloudFlareURL()]}  
                      srcSet={
                        url.toCloudFlareURL().srcSetConvert()
                      } 
                      src={url.toCloudFlareURL()}
                      alt=""
                    />
              </div>
              )

              : 

              (<div key={index}>
              <div>
                <video height={height} width={width} className="profile-main-vid" autoPlay muted loop playsInline src={url.toCloudFlareURL()}></video>
              </div>

            </div>)
          })}
      </AwesomeSlider>

      <FlexBox
        position="absolute"
        zIndex={9}
        marginLeft=".5rem"
        sx={{WebkitTransform: "translateZ(0)"}} 
        // top={goNowBio ? gap <= 0 ? 72 : 20 : 20}
        top={15}
        right={10}
        width="100%">

        {(isProfileAdmin && myServices && !hideServices) &&
              <Box 
              marginLeft="16px" 
              marginRight="auto">
                {(serviceType === ServiceType.meetup && serviceDetails.details?.id === "7" && serviceDetails.details?.dd) && 
                  <Card elevation={8} sx={{borderRadius:5}}>
                    <UserCardAvatar uid={serviceDetails.details.dd} showRatings showLastSeen/>
                  </Card>
                }
        </Box>}
          
          <FlexBox marginLeft="auto" marginRight={2} marginBottom="auto">
            <ProfileMoreButton
              isLoading={loadingShare}
              shareButtonClick={copySharedLink}
              reportButtonClick={reportButtonClick}
            />
          </FlexBox>
      </FlexBox>

      <HorizontalServicesScrollView 
        isProfileAdmin={isProfileAdmin} 
        hideServices={hideServices} 
        numberOfServices={numberOfServices} 
        serviceDetails={serviceDetails} 
        myServices={myServices} 
        serviceType={serviceType}
        _xservices={_xservices} 
        _xselected={_xselected} 
        onSelected={(service: ServiceDetails, serviceType: number) => {
          setServiceDetails(service)
          setServiceType(serviceType)
        }}        
      />

      {(isProfileAdmin && myServices && !hideServices) &&
        <Box
          left={5}
          bottom={numberOfServices * 50 > 120 ? numberOfServices * 50 : 120}
          position="absolute"
          zIndex={6}
        >
          {serviceType === ServiceType.eMeet && <EmeetsPrefStack emeetState={emeetState}/>}
      </Box>}


      {(isProfileAdmin && myServices && numberOfServices > 1) && <Box className="vertical-tab">

          <VerticalTabs
            index={serviceType ?? 0}
            services={myServices}
            hideServices={hideServices}
            hideService={(hide) => setHide(hide)} 
            valueChanged={(category) => {

              // if(category !== serviceType){
              //   const element = displayServiceRef.current?.getElement()
              //   if(element) element.scrollLeft = 0
              // }
        
              if(myServices){
                const firstDetail = servicesHelper.getFirstDetailByType(myServices, category)
                const _Id = getFirstIdWorkaround(firstDetail) // firstDetail?.id ?? "0"

                setServiceDetails({
                  id: _Id,
                  serviceType: category,
                  details: firstDetail ? {...firstDetail, 
                  suffix: firstDetail?.suffix ?? servicesHelper.getDefaultSuffix(category)} : undefined
                })
              }

              setServiceType(category)
              localStorage.setItem(serviceTypeStorage, `${category}`)
              //setMore(false)
              //setShowing(false)

            }}
          />
        
        </Box>}
      
      { !isExact && <Fab 
            className="down-fab"
            variant="circular"
            onClick={ (typeof(onClose) === 'undefined' ? () => { 
              if(hasPage){
                history.goBack()
              }else{
                window.location.href = ""
              }
            
            } : onClose) }>

            <img src= "https://images.rentbabe.com/assets/down.svg" alt = ""/>
      
          </Fab>
      }
    </Box> 
       
      <div className="name-div">
          <FlexBox alignItems="center">
            {isUserOnline && <Box border="1px solid yellow" width={12} height={12} borderRadius={999} bgcolor={green[300]} marginRight="8px" /> }
            <Typography component="h6" variant='h6' fontWeight="bold" > { nickname  } { dob ? `(${dob})` : ""}</Typography>


            {videoVerification 
              && <>
              <FlexGap/> 
                <DefaultTooltip 
                  width={28} 
                  className='profile-icon' 
                  title={t("verified.done")}
                  url="https://images.rentbabe.com/assets/flaticon/card.svg"/> 

            </>}
            
            {getActive && isgUrls.length > 0 ?<> <FlexGap/> 
              <DefaultTooltip 
                className='profile-icon' 
                title="Instagram verified" 
                url="https://images.rentbabe.com/assets/igfill.svg"/>
            </>: null }


            {voiceUrl && <Box marginLeft={1}>
              <VoiceButton gray voiceUrl={voiceUrl}/> 
            </Box>}
            
          </FlexBox>
      </div>

      <Box padding="0px 16px">

      {goNowBio ? <FlexBox marginBottom={2}>

            <Box className = "gonow">
              <IconButton onClick={() => {
                    try{
                      logEvent(analytics, AnalyticsNames.buttons, {
                        content_type: "close gonow",
                        item_id: "close gonow", 
                      })  
                  }catch{}
                  setGoNowBio(undefined)
                }} sx={{position: "absolute", top: -15, right: -12}}>
                  <img
                    width={19}
                    src="https://images.rentbabe.com/assets/closewhite.svg?v=2"
                    alt=""
                  />
                </IconButton>
                <p
                  ref={goNowDivRef} 
                >{goNowBio}</p>
            </Box>

            </FlexBox> : <>
            {
              (isProfileAdmin && (isProfilePrivate.current || !geoEncoding?.toString().includes("Singapore")) ) ? <></> : <>
              {getActive ? 
                <> 
                  {
                    isUserOnline ? <></>
                    :  
                    <Typography 
                    variant='caption' 
                    color="error"> {`Last seen ${ (helper.timeSince(getActive.toDate()) ).toLowerCase() } ago` } </Typography>
                  }
                  
                  <FlexGap />

                </> 
                : 
                <>
                  <Skeleton variant='text' width={150}/>
                  <FlexGap/>
              </>}
              </>
            }
            </>
        }

        <Ellipsis 
        className="descrip"
        variant='body2'
        // color="text.secondary" 
        lines={3}>
          {serviceDetails.details?.bio}
        </Ellipsis>

      </Box>

      {/* <hr className= "divider" ></hr> */}

      <Divider sx={{margin: "10px 0px"}}/>

      {!serviceDetails.details?.bio && <Box padding="0px 16px">
          <p className="descrip">{serviceDetails.details?.bio ===  undefined ? bio : ""}</p>
          <br/>
      </Box>}

      {gameProfileImage && <CenterFlexBox width="100%" marginBottom={1}>

          <img
            style={{objectFit: "cover", objectPosition: "center", maxWidth: "500px", maxHeight: "300px", borderRadius: "16px"}} 
            srcSet={gameProfileImage}
            width="95%"
            alt=""
          />
      </CenterFlexBox>}

      <Box padding="0px 16px">

          {availability && <Typography className="descrip" >{t('availability.label')}:&nbsp;<strong>{availability}</strong></Typography>}
          
          <p className="descrip">
            {race && <strong>{race}</strong>}
            {height ? <>&nbsp;﹒&nbsp;<strong>{height}cm</strong></> : null}
          </p>
        
          {geoEncoding && <p className="descrip">{t('locationat.label')} {geoEncoding?.toString()}</p>}
      </Box>

      <FlexBox width="100%" alignItems="center" paddingLeft="16px">

        {/* <FlexBox
          onClick={() => {
            setOpenReview(true)
          }}
          sx={{cursor: "pointer"}}
          padding="4px 10px" 
          borderRadius={2}
          bgcolor="gray">

          <Typography
            fontWeight="bold"
            fontSize={12}
            color="primary" >
              {t('reviews.button')} 
          </Typography>

          <FlexGap/>

          <RatingLabel 
            fontColor="primary"
            fontWeight='bold'
            fontSize={12}
            ratings={ratingState}
          />

        </FlexBox> */}


        {showReviews && <RatingLabel fontColor="gray" fontSize="12px" ratings={ratingState}/>}

        <p className="views">{showReviews ? <>&nbsp;﹒&nbsp;</> : <></>}{<><strong>{ v !== undefined  ? cal.viewFormat(v) : <CircularProgress size={10} color="warning"/>}</strong> views</> }</p>
        {(ratingState && cal.numberOfMeetups(ratingState) !== 0) && <p className="views"></p>}

      </FlexBox>

        {showReviews &&  <Divider sx={{margin: "10px 0px"}}/> }
        {showReviews && <CenterFlexBox flexDirection="column" width="100%" marginBottom={1} padding="0px 16px">
          {reviews?.map((doc, index : number) => {

          const item = doc.data() as Reviews

          const getReviewFrom = uid

          return <Card key={index}  sx={{ width: "100%", marginBottom: "10px", borderRadius: "1rem"}} elevation={6}>
                <ReviewCard 
                index={index} 
                docId={doc.id} 
                reviews={item} 
                myUrl={mobileUrlState}
                getReviewFromUUID={getReviewFrom}
                disallowReply
              />
          </Card>})}

          {(reviews?.length ?? 0) === 3 && <Button variant='text' color="warning" onClick={() => {
              try{
                logEvent(analytics, AnalyticsNames.buttons, {
                  content_type: "view all reviews",
                  item_id: "view all reviews", 
                })  
            }catch{}
            setOpenReview(true)
          }}>{t("view.all.reviews")}</Button>}
        </CenterFlexBox>}

        {hasBottomInfo ?  
          <Divider sx={{margin: "10px 0px"}}/> : <>
            {numberOfServices !== 0 && <>
                <br/>
                <br/>
            </>}
          </>
        }
          
        <Typography fontWeight="bold" marginLeft="8px" hidden= {isgUrls.length === 0}>Recent instagram Photos</Typography>
        
        <ScrollContainer vertical={false} className= "isg-main-div horizontal-scroll" style ={{ padding : "0px"}}>

        {isgUrls.map((url, index) => {

          const isImage = !url.isURLVideo()

          if(isImage) return <LazyLoadImage 
            key={index}
            id = { "img-" + index.toString()}  
            src={url} 
            className="isg-img" 
            width={ 150 } 
            height = { 150 } 
            draggable={true}
            onClick = {() => {
              setIsgDays(getDays(index))
              setIsOpen(true) 
              indexISG.current = index + 1
            }}
            alt = ""
            ></LazyLoadImage>
          else return <Box
          className="isg-video" 
          width={ 150 } 
          height = { 150 } 
          ><Box
            display="inline-block"
            margin="0 auto"
          ><video  
          width={ 150 } 
          height = { 150 } 
          onClick = {() => {
            setIsgDays(getDays(index))
            setIsOpen(true) 
            indexISG.current = index + 1
          }}
          src={url} 
          autoPlay
          playsInline
          muted
          loop
          /></Box></Box>

        })}

        </ScrollContainer>

        {hasBottomInfo && <Box padding="16px">
          {orientationArray && orientationArray.length > 0 && <p className="descrip smaller">🌈 {orientationArray.join(', ')}.</p>}
          {food?.trim() && serviceType === ServiceType.meetup && <p className="descrip smaller">Food Preferences: {food}</p>}
        </Box>}
        
        <AwesomeSliderDialog 
          isOpen={isOpen}
          onClose={closeOverLay} 
          isgUrls = {isgUrls} 
          nextOne = {(index: number) => {
            setIsgDays(getDays(index))
          }}
          isgDays = {isgDays} 
          indexISG = {indexISG.current}/>
  
  
        <ReportDialog 
          chatRoomId={chatRoomId}
          open={showReport}
          reportBy={myUID}
          user={pageProfileUUID}
          onClose= {() => setShowReport(false)}
        />

        <InsufficientFundDialog
          isPriceLimit={isPriceLimit}
          priceLimit={priceLimitState}
          clientNickname={myNickname}
          open={openWarningDialog}
          price={ ((servicesHelper.getMinPrice(myServices) ?? 0 ) / 100) ?? price}
          nickname={nickname}
          onClose={() => handleClose()}
        />

        <ShareProfileDialog 
          url={shareLink}
          open={shareLink ? true : false}
          onClose={() => setShareLink(undefined)}
        />
  
        <RequestOrderDialog
          eMeetsPref={emeetState?.pref}
          eMeetsApp={emeetState?.app}
          clubName={profileClubName}
          clubState={profileClubState}
          state = {geoEncoding && geoEncoding.length > 0 ? geoEncoding[geoEncoding.length - 1] : "Singapore"}
          babeUID={pageProfileUUID} 
          onSuccess={(chatRoomId, hasErrorMessage) => {
            // if(chatRoomId && helper.isMobileCheck2()){
            //   history.goBack()
            // }
            openAlert(hasErrorMessage ? hasErrorMessage : "Sent", <Button
              onClick={openChatRoom(chatRoomId)}
            >Inbox</Button>)
          }}
          babeAPNSToken={getAPNSToken}
          babeTeleid={getTeleId}
          nickname={nickname}
          services={myServices}
          selectedService={(serviceDetails.id && serviceDetails.details) ? serviceDetails : defaultServiceDetails}
          open={openRequestDialog}
          onClose={() => setRequestDialog(false)}
          babeURL={mobileUrlState?.toCloudFlareURL() ?? totalUrls[0]}
          chatRoomID={convoHelper.getExistingConvo(currentConversation, pageProfileUUID)?.id}    
        />
        
        <Snackbar
          open={checkSent}
          onClose={() => setSent(false)}
          autoHideDuration={1500}
          message={"Message sent!"}/> 

        {(userRBAC === RBAC.admin && isAdminPage && !isVerify) && <Approvals
            dob={dob}
            geoEncoding={geoEncoding}
            profileImage={mobileUrlState} 
            uid={pageProfileUUID}
            nickname={nickname} 
            getTeleId={getTeleId} 
            babeAPNSToken={getAPNSToken}
            userGender={_xuserGender} 
            onClose={onClose}            
        />}

        {(userRBAC === RBAC.admin && !isVerify)  && <SendTelegramMsg
          userUid={pageProfileUUID} 
          teleId={getTeleId}
        />}

        {(userRBAC === RBAC.admin && isVerify) && <GovApprovals
            uid={pageProfileUUID} 
            getTeleId={getTeleId} 
            userAPNSToken={getAPNSToken} 
            onClose={onClose}    
        />}

        {numberOfServices !== 0 && <RequestOrderBottomBar 
          maxWidth={maxWidth}
          loadingChat={loadingChat}
          sendRequestOrder={sendRequestOrder}
        />}

        <CenterSnackBar   
            autoHideDuration={3000}
            message={alertMsg}
            onClose={() => setAlert(false)}
            open={alert}
            action={alertAction}
        />
    </ProfilePageContainer>

    {openReview && <ReviewForm 
          myUrl={mobileUrlState}
          uid = {pageProfileUUID} 
          open={openReview} 
          onClose = {onCloseReview}/>}
  </Box>)


  else return <LoadingScreen/>

};


export default ProfilePage;