import { Box, Grid, Stack } from '@mui/material';
import { FC, useEffect, useState } from 'react';
import FlexGap from '../../Box/FlexGap';
import { ServiceType, servicesProps, detailProps } from '../../../keys/props/services';
import DisplayGrid from './DisplayGrid';
import { Units } from '../../../enum/MyEnum';

interface props {
    numberOfServices: number
    serviceType: ServiceType
    id: string | undefined
    services: servicesProps | undefined
    onSelected: (category: string, id: string) => void
}

const DisplayService : FC<props> = ({
    numberOfServices, 
    serviceType, 
    id, 
    services, 
    onSelected}) => {

  
    const data = Object.entries(services?.[serviceType] ?? {})
    const moreThan = numberOfServices === 1 ? 4 : 2 

    if(serviceType === ServiceType.meetup){
        const dd = "7"
        const findIndex = Object.entries(services?.[serviceType] ?? {}).findIndex((x) => (x[1] as detailProps).id === dd )
        if(findIndex !== -1){
            data.unshift(data.splice(findIndex, 1)[0])
        }
       
    }
   
    interface selectProps{
        [category: string] : string
    } 

    function getSelect(serviceType: ServiceType) : selectProps | undefined{

        if(!services) return undefined
        if(!id){
            for (const key of Object.keys(services[serviceType]) ){
     
                return {
                    [serviceType]: key
                }
            }
        }else{
            return {
                [serviceType]: id
            }
        }
    }

    const [selected, setSelected] = useState<selectProps | undefined>(getSelect(serviceType))

    useEffect(() => {
        setSelected(getSelect(serviceType))
        // eslint-disable-next-line
    }, [serviceType, services])

    if(!services || !selected || data.length === 0) return null

    else if (services[serviceType]) return <Box  display="inline-block" >


            <Stack marginBottom={.5} direction="row" columnGap={1} >

            {
                data.map((value) => {
        
                    const id = value[0]
                    const detail = value[1] as detailProps | string

                    if(typeof(detail) === "string") {
                        return null
                    }

                    if(!detail.price || !detail.bio){
                        return null
                    }

                    return <DisplayGrid
                                id={id}
                                key={`${id}-${serviceType}`}
                                title={detail.title}
                                image={detail.image}
                                price={detail.price}
                                suffix={detail.suffix ?? Units.hr}
                                selected= {selected[serviceType] === id ? true : false}
                                serviceType={serviceType}
                                onClick={(id) => {
                                    if(!id) {
                                        return
                                    }
                                    const selected = {
                                        [serviceType]: id
                                    }
                                    onSelected(`${serviceType}`, id)
                                    setSelected(selected)
                                }}
                        />
       

                })
            }

            {
                data.length > moreThan && <Grid item>
                    <FlexGap gap={18}/>
                </Grid>
            }

            </Stack>

    </Box>
    
        
    else return null
    

 
}

export default DisplayService