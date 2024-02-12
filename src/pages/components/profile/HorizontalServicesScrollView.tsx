import { FC, useEffect, useRef } from 'react';
import ScrollContainer from 'react-indiana-drag-scroll';
import DisplayService from '../../../components/Services/component/DisplayService';
import { detailProps, servicesProps, ServiceType } from '../../../keys/props/services';
import { ServiceDetails } from '../../ProfilePage';

interface props {
    isProfileAdmin: boolean
    hideServices: boolean
    numberOfServices: number
    serviceDetails: ServiceDetails
    myServices: servicesProps | undefined
    serviceType: ServiceType | undefined
    _xservices: servicesProps | undefined
    _xselected:  {
        serviceType: number
        id: string
    } | undefined
    onSelected: (service: ServiceDetails, serviceType: number) => void
}

const HorizontalServicesScrollView : FC<props> = ({
    isProfileAdmin, 
    hideServices, 
    numberOfServices, 
    serviceDetails,
    myServices,
    serviceType, 
    _xservices, 
    _xselected,
    onSelected
}) => {

    const displayServiceRef: any = useRef<ScrollContainer | null>(null)
    const ele = displayServiceRef.current?.getElement()
    const _my = _xservices
    const _se = _xselected?.serviceType as number
    const _id = _xselected?.id

    const data = Object.entries(myServices?.[`${serviceType}`] ?? {})
    const moreThan = numberOfServices === 1 ? 4 : 2 

    useEffect(() => {
      const ele = displayServiceRef.current?.getElement()
      const _my = _xservices

      const _se = _xselected?.serviceType as number
      const _id = _xselected?.id

      if(ele && _my && _id){
        scrollToService(ele, _my, _se, _id)
      }
      // eslint-disable-next-line
    }, [])

    useEffect(() => {

      if(_xselected?.serviceType !== serviceType){
        const element = displayServiceRef.current?.getElement()
        if(element) element.scrollLeft = 0
      }

    }, [serviceType, _xselected])

    useEffect(() => {
        if(ele && _my && _id){
          scrollToService(ele, _my, _se, _id)
        }
    }, [ele, _my, _se, _id])

    function scrollToService(ele: HTMLElement, _my: servicesProps, _se: ServiceType, _id: string){
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

    return <ScrollContainer ref={displayServiceRef} vertical={false} className="isg-fab horizontal-scroll"
    style={{

      left: numberOfServices === 1 ? "0px" : "70px",
      paddingLeft:  numberOfServices === 1 ? "10px" : "0px",
      right: data.length > moreThan ? "0px" : "",
      width: data.length > moreThan ? `calc(100%  - ${numberOfServices === 1 ? "0px" : "70px"})` : numberOfServices === 1 ? "100%" : "auto"
    }}
    
    >

        {(isProfileAdmin && serviceType !== undefined && !hideServices)  
        && <DisplayService
          numberOfServices={numberOfServices}
          serviceType={serviceType}
          id={serviceDetails.id}
          services={myServices}
          onSelected={(serviceType, id) => {

            const _category = parseInt(serviceType)
            const _myServices = myServices?.[_category]

            const currentCategory = serviceDetails.id
            const currentServiceType = serviceDetails.serviceType

            if(`${currentCategory}` === `${id}` 
                && `${currentServiceType}` === `${serviceType}`){
              return
            }

            const _detail = _myServices?.[id] as detailProps

            onSelected({
                    id: id,
                    serviceType: _category,
                    details: _detail
                  }, _category)
            // setServiceDetails({
            //   id: id,
            //   serviceType: _category,
            //   details: _detail
            // });
            // setServiceType(_category)
          }}/>}

    </ScrollContainer>

}

export default HorizontalServicesScrollView