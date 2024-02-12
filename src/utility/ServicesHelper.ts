import { detailProps, servicesProps, ServiceType } from "../keys/props/services"
import { Units } from "../enum/MyEnum"
import { serviceTypeStorage } from "../keys/localStorageKeys"

export type UnitType = "15Min" | "1Hr" | "Game"

export class ServicesHelper {

    public getCheapestService(cheapest: number, services: servicesProps | undefined): [string, string]{
        if(cheapest){
             if(services){
                 for (const [type,v] of Object.entries(services)) {
                     for (const [cat,d] of Object.entries(v)) {
                         if(typeof d === "string") continue
                         if(d.sbyprt === cheapest){
                             return [type, cat]
                         }
                     }
                 }
             }
         }
         return ["", ""]
    }

    public scrollToService(ele: HTMLElement, _my: servicesProps, _se: ServiceType, _id: string){
        let index = NaN

        for(const [_cat, _d] of Object.entries(_my)){

          let counter = 0

          for ( const value of Object.values(_d) ){
            const id = typeof value === "string" ? value : value.id ?? ""


            if(_cat === `${_se}` && id === _id){
              index = counter
              break
            }

            counter  += 1
          }

        }

        try{
          const zxc = ele.firstChild?.firstChild?.childNodes[index] as HTMLDivElement
          ele.scrollLeft = zxc.offsetLeft
        }catch{
        }
    }

    public hasServiceType(services: servicesProps | undefined, 
        serviceType: ServiceType | undefined) : boolean {

        if(!services || serviceType === undefined) return false

        const _details = services[serviceType]
        if(!_details) return false

        for (const _value of Object.values(_details)){
            if(typeof _value !== "string"){
                return true
            }
        }
        
        return false
    }

    public getDefaultType(services: servicesProps | undefined) : ServiceType{


        if(!services) return ServiceType.meetup


        const numOfServices = this.getNumberOfServices(services)

        if(numOfServices === 1){
 
            return this.getFirstServiceType(services)

        }else if(numOfServices > 1){
    
            const prefer = parseInt(localStorage.getItem(serviceTypeStorage) ?? "-1") as ServiceType
            
            if( this.hasServiceType(services, prefer) ){
                return prefer
            }else{
                return this.getFirstServiceType(services)
            }

        }else {
            return ServiceType.meetup
        }
    }

    public getDefaultSuffix(serviceType: ServiceType | undefined) : Units | undefined{
        switch (serviceType) {
            case ServiceType.meetup:
                return Units.hr
        
            case ServiceType.eMeet:
                return Units.min

            case ServiceType.games:
                return Units.game

            case ServiceType.sports:
                return Units.hr
            default:
                return undefined
        }
    }

    public convertUnits(units: Units | undefined) : UnitType{

        switch (units) {
            case Units.hr:
                return "1Hr";

            case Units.min:
                return "15Min";

            case Units.game:
                return "Game";

            default:
                return "15Min";
        }
    }

    public createDefault(price: number | undefined, bio: string | undefined) : servicesProps | undefined{


        if(!price || !bio) return undefined


        let services : servicesProps = {
            [ServiceType.meetup]: {
                "0": {
                    id: "0",
                    title: "Meals",
                    description:"Dinner, lunch or breakfast together",
                    image: "https://images.rentbabe.com/IMAGES/SERVICES/MEETUP/meals.jpg?",
                    price: price * 100,
                    bio: bio,
                    suffix: Units.hr
                },
                id: "0"
            }
        }
        return services
    }

    public getServiceSuffix(id: string) : string{

        if(id === "0") return "1Hr"
        else if(id === "1") return "15Min"

        return "1Hr"
    }

    public getNumberOfServices(services: servicesProps | undefined): number{

        if(!services) return 0

        let counter = 0

        for (const value of Object.values(services)){
            for (const detail of Object.values(value)){
                if(typeof(detail) !== "string"){
                    if(Object.values(detail).length > 0){
                        counter += 1
                        break;
                    }
                }
            }
        }

        return counter
    }

    public getTotalNumberOfServices(services: servicesProps | undefined): number{

        if(!services) return 0

        let counter = 0

        for (const value of Object.values(services)){
            for (const detail of Object.values(value)){
                if(typeof(detail) !== "string"){
                    if(Object.values(detail).length > 0){
                        counter += 1
                    }
                }
            }
        }

        return counter
    }


    public getFirstServiceDetail(services: servicesProps | undefined ): detailProps | undefined {

        if(!services) return undefined

        const keys = Object.keys(services)

        if(keys.length > 0){

            const details = services[keys[0]]
            const values = Object.values(details)
            if(values.length > 0){
                const detail = values[0]

                return typeof detail === "string" ? undefined : { ...detail, serviceType: parseInt(keys[0])}

            } else return undefined

        }else return undefined

    }


    public getFirstServiceType(services: servicesProps | undefined): ServiceType {



        if(!services) return ServiceType.meetup

        for (const [id, _details] of Object.entries(services)){


            let details = _details
            delete details["id"]


            if(Object.values(details).length > 0){


                const _type = parseInt(id)

                return _type
            }
     
        }

        return ServiceType.meetup
    }

    public getFirstServiceSuffix(services: servicesProps | undefined) : string{


        if(!services) return "1Hr"

        for (const key of Object.keys(services)){

            return this.getServiceSuffix(key)
        }

        return "1Hr"
    }

    public getFirstDetailByType(
        services: servicesProps | undefined, 
        whichService: ServiceType | undefined) : detailProps | undefined{
        

        if(services === undefined || whichService === undefined) {
            return undefined
        }

        const details = services[whichService]

        if(!details){
            return undefined
        }


        for (const detail of Object.values(details)){
            
            if(typeof detail !== "string"){
            
                return {...detail, serviceType: whichService.valueOf()} as detailProps
            }
        }

        return undefined
        
    }

    public getServicePriceById(services: servicesProps | undefined, serviceType: ServiceType, id: number) : number | undefined{

        if(!services) return undefined

        return (services[serviceType]?.[id] as detailProps)?.price
        
    }

    public getFirstServicePriceByType(services: servicesProps | undefined, serviceType: ServiceType) : number | undefined{

        if(!services || !services?.[serviceType]) return undefined

        for (const value of Object.values(services[serviceType])){
            const v = value as detailProps
            return v.price
        }
        return undefined
        
    }

    public getFirstServicePrice(services: servicesProps | undefined) : number | undefined{

        if(!services) return undefined

        for (const value of Object.values(services)){
            for (const _value of Object.values(value)){
                const v = _value as detailProps
                return v.price
            }
        }
        return undefined
        
    }

    public getFirstServiceBio(services: servicesProps | undefined) : string | undefined{


        if(!services) return undefined

        for (const value of Object.values(services)){
            
            for (const _value of Object.values(value)){
                const v = _value as detailProps
                return v.bio
            }
        }
        return undefined
        
    }

    public getMinPrice(services: servicesProps | undefined) : number | undefined {


        if(!services) return undefined

        let prices: number[] = []
        for (const value of Object.values(services)){
            
            for (const _value of Object.values(value)){

                const v = _value as detailProps
                if(v.price) prices.push(v.price)
            }
        }

        if(prices.length === 0) return undefined

        const minValue = Math.min.apply(Math, prices)

        if(minValue < 1) return undefined

        return minValue
    }

}