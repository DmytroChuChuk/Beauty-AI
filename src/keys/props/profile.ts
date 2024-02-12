import { Timestamp } from "firebase/firestore"
import { ServiceType, servicesProps } from "./services"
import { PriceLimitProps } from "../../components/Services/PriceLimit"
import { PostType, genderEnum } from "../../enum/MyEnum"
import { APNSTokenProps } from "../../store"
import { EmeetsProps } from "./common"

export interface StarProps {
    [star: number] : number
  }
  
  export interface Item {
    type: PostType
    admin: boolean
    uid: string
    userGender: genderEnum
    nickname: string
    bio: string
    urls: string[]
    video_urls: string[] | undefined
    price: number
    drinks: string
    race: string
    availability: string
    time_stamp: Timestamp | undefined
    visible: boolean
    width: number | undefined
    height: number | undefined
    mHeight: number | undefined
    vac: number | undefined
    isgToken : string | undefined
    age: number | undefined
    dob: number | string
    videoVerification: boolean | undefined
    geoEncodings: string[] | undefined
    sponsor: boolean
    food: string | undefined
    state : string
    voiceUrl : string | undefined
    rec:string[] | undefined
    onClose?: () => void
    mobileUrl:string | undefined
    isPrivate: boolean
    gonow_servce: ServiceType
    gonow_bio: string | undefined
    gonow_coming_from: string | undefined
    start: Date | undefined
    end: Date | undefined
    apply_info: string | undefined
    nor: number
    teleId : string | undefined
    APNSToken: APNSTokenProps | undefined
    active: Timestamp | undefined
    currency: string | undefined
    choosen: boolean
    ratings : StarProps | undefined
    ranking?: { [uid: string] : number } | undefined
    orientation: string[] | undefined
    services: servicesProps | undefined
    isGamer: boolean
    priceLimit: PriceLimitProps | undefined
    selected?: {
      serviceType: number,
      id: string
    }
    extra?: any
    createdAt?: Timestamp | undefined
    clubName: string | undefined
    clubState: string | undefined
    emeets: EmeetsProps | undefined
    sbyprt?: {[key: string]: any} | undefined
    isOnline: boolean
  }