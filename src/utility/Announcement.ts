import dayjs from "dayjs";

import { 
    QueryDocumentSnapshot, 
    DocumentData 
} from "firebase/firestore";
import { ServiceType } from "../keys/props/services";

import {
    status,
    additional_fees,
    date,
    location,
    time,
    activity,
    additional_info,
    services
} from "../keys/firestorekeys";

export class Announcement {

    public convertToAnnouncementMsg(snapShot: QueryDocumentSnapshot<DocumentData>) {

        const _serviceType = (snapShot.get(services) as ServiceType | undefined) ?? ServiceType.meetup

        const _venue = snapShot.get(location) as string
        const _date = snapShot.get(date) as string
        const _time = snapShot.get(time) as string
        const _status = snapShot.get(status) as number
        const _activity = snapShot.get(activity) as string
        const _additonal_fees = snapShot.get(additional_fees) as string
        const _requirements = (snapShot.get(additional_info) as string) ?? '-'

        const _fDate = dayjs(_date).format("ddd, DD MMM")
        const _fTime = dayjs(_time).format("h:mm A")

        const fees = _additonal_fees

        const isMeetup = _serviceType === ServiceType.meetup

        const _statusMsg = `Status: ${_status === 0 ? 'Searching...' : 'FOUND, JOB CLOSED'}\n`
        const _dateMsg = `Date: ${_fDate}\n`
        const _timeMsg = `Time: ${_fTime}\n`
        const _venueMsg =  isMeetup ? `Venue: ${_venue}\n` : ""
        const _activityMsg = isMeetup ? `Activity: ${_activity}\n` : ""
        const _cabFare = isMeetup ? `Cab fare: ${fees}\n` : ""
        const _InfoMsg = `Info: ${_requirements}`

        const post = `${_statusMsg}${_dateMsg}${_timeMsg}${_venueMsg}${_activityMsg}${_cabFare}${_InfoMsg}`

        return post
      }

}