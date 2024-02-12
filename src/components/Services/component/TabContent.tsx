import { Grid } from '@mui/material';
import { FC } from 'react';
import { detailProps, servicesProps, ServiceType } from '../../../keys/props/services';
import ServiceGrid from '../ServiceGrid';
import ServiceGridDD from '../ServiceGridDD';

interface props {
    services: servicesProps | undefined
    myServices: servicesProps | undefined
    index: number
    // loading: boolean
    // error: boolean
    onSelected: (id: string, data: detailProps) => void
    deSelect: (id: string) => void
}


const TabContent : FC<props> = ({services, index: serviceType, myServices, onSelected, deSelect}) => {

    return <Grid 
    container
    paddingTop="16px"  
    direction="row"
    spacing={{ xs: 2, md: 4 }} 
    columns={{ xs: 4, sm: 8, md: 12 }}
    >

    {
        (serviceType === ServiceType.meetup) && 
        <Grid key={-1} item xs={4} sm={4} md={4}> 
            <ServiceGridDD 
                serviceType={serviceType} 
                myServices={myServices} 
                data={{
                    title:"Double Dates",
                    category: "7",
                    id: "7",
                    image: "https://images.rentbabe.com/IMAGES/SERVICES/MEETUP/double.jpeg?",
                    description: "Client wants to meet 2 person at the same time. Invite your friend to join you on a 2 on 1 meetup."
            } as detailProps} 
            onSelected={onSelected} 
            deSelect={deSelect} />
        </Grid>
    }
       


           
    { Object.entries(services?.[`${serviceType}`] ?? {})?.map((data, index) => {

            const indexId = data[0]
            const details = data[1]


            return <Grid key={index} item xs={4} sm={4} md={4} >
           
            <ServiceGrid 
                serviceType={serviceType}
                index={indexId}
                myServices={myServices}
                data={details as detailProps}
                onSelected={onSelected}
                deSelect={deSelect}   
            />

            </Grid>
        })
    }



</Grid>
 
}

export default TabContent