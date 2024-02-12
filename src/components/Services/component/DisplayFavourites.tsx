import { Stack, Grid, Button } from '@mui/material';
import { FC, useState } from 'react';
import FlexGap from '../../Box/FlexGap';
import { detailProps, ServiceType } from '../../../keys/props/services';
import DisplayGrid from './DisplayGrid';
import { useTranslation } from 'react-i18next';

interface props {
    isRefreshing: boolean
    defaultServiceType: string | undefined
    defaultCategory: string | undefined
    favourites: detailProps[]
    onSelected: (category?: string | undefined, id?: string | undefined, title?: string) => void
}

const DisplayFavourites : FC<props> = ({isRefreshing, defaultServiceType , defaultCategory , favourites: services, onSelected}) => {

    const { t } = useTranslation();

    interface selectProps{
        [category: string] : string
    } 

    const [selected, setSelected] = useState<selectProps | undefined>( 
        defaultServiceType && defaultCategory ?
        {[`${defaultServiceType}`]: defaultCategory} : undefined)

    const onClick = (id?: string, title?: string, serviceType?: ServiceType) => {

        if(isRefreshing || !id) return

        // if(id === "-1"){
        //     onSelected(undefined, id)
        //     setSelected(undefined)
        //     return
        // }   
        
        // if(id === "-2"){
        //     onSelected(undefined, id)
        //     setSelected(undefined)
        //     return
        // }   

        if(serviceType === undefined) return 

        const selected = {
            [serviceType]: id
        }

        //const title = detail.title

        onSelected(`${serviceType}`, id, title)
        setSelected(selected)
    }


    if(!services) return null

    else return <Button sx={{textTransform: "none"}}>

            <Stack direction="row" columnGap={.5} paddingLeft={1} >

            <DisplayGrid
                id={"-1"}
                serviceType={ServiceType.meetup}
                borderWidth={3}
                height={80}
                opacity={0.3}
                title={`${t('for.you')}`}
                image={"https://images.rentbabe.com/IMAGES/SERVICES/DEFAULT/default.svg"}
                selected= { !selected ? false : selected[ServiceType.meetup] === "-1" }
                onClick={onClick}
            />

            <DisplayGrid
                id={"-2"}
                serviceType={ServiceType.games}
                borderWidth={3}
                height={80}
                opacity={0.3}
                title={`${t('games')}`}
                image={"https://images.rentbabe.com/IMAGES/SERVICES/DEFAULT/controller.png"}
                selected= { !selected ? false : selected[ServiceType.games] === "-2" }
                onClick={onClick}
            />

            {
               services.map((value, index) => {

                    const _serviceType = `${value.serviceType}`

                    const detail = value 
                    const id = detail.id

                    if(typeof(detail) === "string") return null
                    if(!id) return null

                    return <DisplayGrid
                        key={index}
                        id={id}
                        serviceType={parseInt(_serviceType)}
                        borderWidth={3}
                        height={80}
                        opacity={1}
                        title={detail.title}
                        image={detail.image}
                        selected= { !selected ? false : selected[_serviceType] === id }
                        onClick={onClick}
                    />
                })
            }

            <Grid item>
                <FlexGap gap={1}/>
            </Grid>

            </Stack>
    </Button>
 
}

export default DisplayFavourites