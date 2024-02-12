import { APNSTokenProps, MyReferrer, user } from "../store";
import { DocumentData, DocumentSnapshot, Timestamp } from "firebase/firestore";
import { inactive, admin as adminKey, url } from '../keys/localStorageKeys';

import {
    admin,
    APNSToken,
    app,
    club,
    currency,
    dob,
    emeets,
    gender,
    geoEncodings,
    hasGamingProfileImageForAll,
    legalName,
    myReferrer,
    // mobileUrl, 
    name,
    nickname,
    number_of_rents,
    pref,
    ratings,
    reject_reason_after,
    services,
    state,
    stripeApproved,
    stripeConnectAccount,
    tele_id,
    time_stamp,
    urls,
    video_verification,
} from '../keys/firestorekeys';
import { ClubProps, EmeetsProps } from "../keys/props/common";
import { detailProps, servicesProps, ServiceType } from "../keys/props/services";
import { StarProps } from "../keys/props/profile";
import { Calculator } from "./Calculator";

export const defaultProfileImages = [
  "https://images.rentbabe.com/IMAGES/AVATAR/kitty0.png",
  "https://images.rentbabe.com/IMAGES/AVATAR/kitty1.png",
  "https://images.rentbabe.com/IMAGES/AVATAR/kitty2.png",
  "https://images.rentbabe.com/IMAGES/AVATAR/kitty3.png",
  "https://images.rentbabe.com/IMAGES/AVATAR/kitty4.png",
]

export class ProfileHelper { 

    hasGamingProfileImageForAll(_services: servicesProps): boolean {

        for (const serviceType of Object.keys(_services)){
            const values = Object.values(_services[serviceType])

            if(values.length > 0){
                for(const detail of values){

                    const v = detail as detailProps
    
                    if(typeof(v) === "string") continue

                    if(!v.profile && serviceType === ServiceType.games.toString()){
                      
                      return false
                    }
                }
            }
        }

      return true
    }


    public updateUserProfile(userData: DocumentSnapshot<DocumentData> | undefined, setCurrentUser: (user?: user | undefined) => void){

        if(!userData) {
          return
        }

        const _admin = userData.get(admin) as boolean | undefined
        const _nickname = userData.get(nickname) as string
        const _teleId = userData.get(tele_id) as string
        const _videoVerification = userData.get(video_verification) as boolean
        const _stripeConnectAccount = userData.get(stripeConnectAccount) as string
        const _stripeApproved = userData.get(stripeApproved) as boolean
        const _gender = userData.get(gender) as number
        const _dob = userData.get(dob) as Timestamp | undefined
        const _ratings = userData.get(ratings) as StarProps | undefined
        const _isActive = (userData.get(time_stamp) as Timestamp) ? true : false
        const _APNSToken = userData.get(APNSToken) as APNSTokenProps | undefined
        const _myClub = userData.get(club) as ClubProps | undefined
        const _rejectReasonAfter = userData.get(reject_reason_after) as string | undefined
        const _geo = userData.get(geoEncodings) as string[] | undefined
        const _emeets = userData.get(emeets) as EmeetsProps | undefined
        const _services = userData.get(services) as servicesProps | undefined
        const _legalName = userData.get(legalName) as string | undefined
        const _currency = userData.get(currency) as string | undefined
        const _state = userData.get(state) as string | undefined
        // let _mobileUrl = userData.get(mobileUrl) as string 

        const _myReferrer = userData.get(myReferrer) as MyReferrer | undefined

        let map : { [key: string]: any } =  {
          isAdmin: _admin, 
          nickname: _nickname, 
          teleId: _teleId, 
          verified: _videoVerification, 
          stripeApproved: _stripeApproved,
          stripeConnectAccount: _stripeConnectAccount,
          inactive: _isActive,
          APNSToken: _APNSToken,
          club: _myClub?.name,
          clubState: _myClub?.state,
          _rejectReasonAfter: _rejectReasonAfter,
          services: _services,
          myReferrer: _myReferrer
        }

        if(_ratings){
       
          const cal = new Calculator()
          const v = cal.weightedAverageValue(_ratings)
          const numberOfRents = cal.numberOfMeetups(_ratings)

          if(v > 0){
            localStorage.setItem(ratings, v.toString())
            map.ratings = v
          }else {
            localStorage.removeItem(ratings)
            map.ratings = null
          }

          if(numberOfRents) {
            map.numberOfRents = numberOfRents
            localStorage.setItem(number_of_rents, `${numberOfRents}`)
          }
          else {
            localStorage.removeItem(number_of_rents)
            map.numberOfRents = null
          }

        }else{
          localStorage.removeItem(ratings)
          localStorage.removeItem(number_of_rents)
          map.numberOfRents = null
          map.ratings = null
        }

        if(_legalName){
          map.legalName = _legalName
          localStorage.setItem(legalName, _legalName)
        }else localStorage.removeItem(legalName)

        if(_currency){
          map.currency = _currency
          localStorage.setItem(currency, _currency)
        }else localStorage.removeItem(currency)
    
        // if(_mobileUrl) localStorage.setItem(url, _mobileUrl) 
        // else {
          const _urls = userData.get(urls) as string[]
    
          if(_urls && _urls.length !== 0){
    
            const _url = _urls[0]
            //_mobileUrl = _url
            localStorage.setItem(url, _url) 
            map.profileImage = _url
    
          }else localStorage.removeItem(url)
          
      //}

        if(_services){

          localStorage.setItem(services, JSON.stringify(_services))

          const keys = Object.keys(_services)
          if(keys.includes("1")){
            localStorage.setItem(emeets, "true")
            map.hasEmeets = true
          } else {
            localStorage.removeItem(emeets)
            map.hasEmeets = false
          }

          const hasGPIFA = this.hasGamingProfileImageForAll(_services)
          if(hasGPIFA){
            map.hasGamingProfileImageForAll = true
            localStorage.setItem(hasGamingProfileImageForAll, "true")
          }else{
            map.hasGamingProfileImageForAll = false
            localStorage.removeItem(hasGamingProfileImageForAll)
          }

        }else{

          localStorage.removeItem(services)
          localStorage.removeItem(emeets)
          map.hasEmeets = false
        }

        if(_myReferrer)
            localStorage.setItem(myReferrer, JSON.stringify(_myReferrer))
        else
            localStorage.removeItem(myReferrer)
    
        localStorage.setItem(video_verification, _videoVerification ? '1' : '0') 
        if(_emeets){
          const _app = _emeets?.app ?? []
          const _pref = _emeets?.pref ?? []

          if(_app.length > 0){
            localStorage.setItem(app, _app.join(","))
            map.emeetsApp = _app
          }else{
            localStorage.removeItem(app)
            map.emeetsApp = null
          }

          if(_pref.length > 0){
            localStorage.setItem(pref, _pref.join(",")) 
            map.emeetsPref = _pref
          }else{
            localStorage.removeItem(pref)
            map.emeetsPref = null
          }
        }else{
          map.emeetsApp = null
          map.emeetsPref = null
          localStorage.removeItem(app)
          localStorage.removeItem(pref)
        }

        if(_state) localStorage.setItem(state, _state)
        else localStorage.removeItem(state)

        if(_stripeConnectAccount) localStorage.setItem(stripeConnectAccount, _stripeConnectAccount) 
        else localStorage.removeItem(stripeConnectAccount)
    
        localStorage.setItem(stripeApproved, _stripeApproved ? '1' : '0') 
    
        if(_rejectReasonAfter){
          localStorage.setItem(reject_reason_after, _rejectReasonAfter)
        }else localStorage.removeItem(reject_reason_after)

        if(_geo && _geo.length > 0){
          const last = _geo[_geo.length - 1]
          localStorage.setItem(geoEncodings, last)
          map.profileAtWhichState = last
        }else{
          localStorage.removeItem(geoEncodings)
        }

        if(_myClub?.name) localStorage.setItem(`${club}.${name}`, _myClub.name)
        else localStorage.removeItem(`${club}.${name}`)

        if(_myClub?.state) localStorage.setItem(`${club}.${state}`, _myClub.state)
        else localStorage.removeItem(`${club}.${state}`)
    
        if(_nickname) localStorage.setItem(nickname, _nickname)
        else localStorage.removeItem(nickname)
    
        if(_teleId) localStorage.setItem(tele_id, _teleId)
        else localStorage.removeItem(tele_id)
        
        if(_admin !== undefined) localStorage.setItem(adminKey, _admin.toString())
        else localStorage.removeItem(adminKey)
    
        if(_isActive) localStorage.setItem(inactive, _isActive.toString())
        else localStorage.removeItem(inactive)
    
        if(_gender !== undefined && !isNaN(_gender)) {
          localStorage.setItem(gender, _gender.toString())
          map.gender = _gender.toString()
        }
        else localStorage.removeItem(gender)

        if(_dob){
          const time = `${_dob.toDate()?.getTime()}`
          localStorage.setItem(dob, time)
          map.dateOfBirth = time

        }else localStorage.removeItem(dob)
    
        setCurrentUser(map)
    
    }

}