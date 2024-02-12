import { Timestamp } from "firebase/firestore"
import { Units } from "../../enum/MyEnum"

export enum ServiceType {
    meetup, eMeet, games, sports
}

export interface detailProps {
    id?: string
    category?: string
    serviceType?: number
    title?: string
    description?: string
    image: string
    price?: number
    bio?: string
    suffix?: Units
    t?: Timestamp
    rank?: number
    dd?: string
    profile?: string
    uploadFile?: File | undefined
    sbyprt?: number | undefined
}

export interface servicesProps {
    [serviceType: string] : {
        [category: string] : detailProps | string
    }
}

export interface UploadImageServiceProps{
    serviceType: string | undefined
    url: string | undefined
    category: string | undefined
}