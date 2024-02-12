import {  Autocomplete, Box, TextField } from '@mui/material';
import { useState } from 'react';
import shallow from 'zustand/shallow';
import { drinks as drinksEnum, race, genderEnum , priceRange, profile as profileEnum} from '../../enum/MyEnum';
import { useUser } from '../../store';

import '../scss/FilterBy.scss'
import { ServiceType } from '../../keys/props/services';
import FlexGap from '../Box/FlexGap';
import { filterProfile, filterGender, filterPrice, filterRace } from '../../keys/localStorageKeys';
import { defaultRace, defaultProfile, defaultGender, defaultPrices } from '../../keys/defaultValues';
import { logEvent } from 'firebase/analytics';
import { analytics } from '../../store/firebase';
import { AnalyticsNames } from '../../keys/analyticNames';
import { isLoyalPeriod } from '../../data/data';

export enum filterType {
    race,
    price,
    drinks,
    profile,
    gender,
    default
}

const FilterBy : React.FC<{ 
    onSearch: (filters : filter[]) => void
    onChange: (filters : filter[]) => void
}> = ({onSearch, onChange}) => {

    const allFilters : filter[] = [
        ...defaultAllFilter,
        ...profileFilter,
        ...genderFilter,
        ...raceFilter,
        // ...drinksFilter,
    ]

    const [isPremium, points] = useUser((state) => [
        state.currentUser?.isPremium,
        state.currentUser?.points
    ], shallow)

    const [options, setOptions] = useState<filter[]>(allFilters)

    const isLoyal = (!isPremium && (points ?? 0) >= 20000) && isLoyalPeriod

    //const defaultArray = [defaultAllFilter[0]]
    const defaultArray =  (function() : any[] {

        let defaultArray : any[] = []

        function gets(defaults:string | null){

            if(defaults){
                let index = allFilters.findIndex((e) => e.title === defaults)
                defaultArray.push(allFilters[index])
            }
        }

        gets(defaultRace)
        gets(defaultProfile)
        gets(defaultGender)
        gets(defaultPrices)

        if(defaultArray.length === 0){
            defaultArray.push(defaultAllFilter[0])
        }

        return defaultArray
    })()

    const [getSelectedFilters, setSelectedFilters] = useState<any[]>(defaultArray)

    const onSearchClick = () => {

        try{
            logEvent(analytics, AnalyticsNames.buttons, {
              content_type: "panel location",
              item_id: "panel location", 
            })  
        }catch{}

        localStorage.removeItem(filterProfile)
        localStorage.removeItem(filterGender)
        localStorage.removeItem(filterPrice)
        localStorage.removeItem(filterRace)

        getSelectedFilters?.forEach((value) => {

            const id = value.title as string
            const type = value.type as filterType

            switch (type) {
                case filterType.profile:
                    localStorage.setItem(filterProfile, id)
                    break

                case filterType.gender:
                    localStorage.setItem(filterGender, id)
                    break

                case filterType.price:
                    localStorage.setItem(filterPrice, id)
                    break

                case filterType.race:
                    localStorage.setItem(filterRace, id)
                    break
            
            }
        })

        onChange( getSelectedFilters )   
        onSearch(getSelectedFilters) 
        //onSearch( getSelectedFilters )        
    }

    // const onSearchClick = () => {
    //     onSearch()        
    // }

    function filterOptions(data: any[]){

        let arrayNow : any[] = defaultAllFilter
        // const filtered = arrayNow.filter((_v) => {
        //     return !!data.find((v) => v.index !== _v.index) 
        // })

        // console.log(filtered)
        if(!data.some(e => e.type === filterType.profile)){
            arrayNow = [...arrayNow, ...profileFilter]
        }

        if(!data.some(e => e.type === filterType.gender)){
            arrayNow = [...arrayNow, ...genderFilter]
        }

        if(!data.some(e => e.type === filterType.race)){
            arrayNow = [...arrayNow, ...raceFilter]
        }

        setOptions(arrayNow)
    }


    return <div className = "flex justify-center filter-wrapper">
        <Autocomplete
            size="small"
            sx={{maxWidth: 500, width: 500}}
            multiple
            color='secondary'
            options={options}
            groupBy={(option) =>  {

                let group = ""
                switch (option.type) {
                    case filterType.race:
                        group = "Ethnicity"
                        break;

                    case filterType.profile:
                        group = "Privacy"
                        break;
                    case filterType.gender:
                        group = "Gender"
                        break;
                    case filterType.default:
                        group = "Default"
                        break;
                }
                return `${group}`
            }}

            getOptionLabel={(option : filter) => {
                return`${option.title}`
            }}
            
            renderOption={(props, option) => {

                const _index = option.index

                if(_index === 2 || _index === 3 || _index === 0){

                    const promo = "https://images.rentbabe.com/assets/mui/promo/new.svg"
                    const vip = "https://images.rentbabe.com/assets/mui/promo/vip.svg"

                    const url = _index === 0 ? vip : promo
                    return <Box component="li" sx={{ '& > img': { mr: 2, flexShrink: 0 } }} {...props}>

                        {option.title}
                        <FlexGap/>
                        <img
                            loading="lazy"
                            width="20"
                            src={url}
                            alt=""
                        />
            
                    </Box>
                }else{
                    return <Box component="li" {...props}>
                        {option.title}
                    </Box>
                }


            }}

            isOptionEqualToValue={() => {
                return false
            }}

            value = {getSelectedFilters}
            defaultValue={defaultArray}
            filterSelectedOptions
            onChange={( _, data) => {

                let myArray = data

                if(myArray.length === 0){
                    myArray.push(defaultAllFilter[0])
                }
                else{

                    let index = -1;
                    for (var i = 0; i < myArray.length; ++i) {

                        const _index = myArray[i].type
                        if ( _index === filterType.default) {
                            index = i;
                            break;
                        }
                    }
           
 
                    if(index === 0 ) {
                        // no matter what, all profile tag must be removed during selection
                        myArray.splice(index, 1)
                    }
                    else if(index >= 0) myArray = [myArray[index]]
   
                }
                
                filterOptions(myArray)
                setSelectedFilters(myArray)
       

            }}
            getOptionDisabled={(option) =>{
                    return !isPremium ? (isLoyal ? false : (option === profileFilter[0])) : false
                }
            }
            renderInput={(params) => (
            <TextField
                {...params}
                label={  'Filter by' }
                margin='dense'
                color='secondary'
                variant='outlined'
            />
            )}
        />

        <div className='search-btn' onClick={onSearchClick}>
            <img 
            height={24} 
            width={24}
            src="https://images.rentbabe.com/assets/mui/filter_search.svg" alt=''/>
        </div>
    </div>
}

export default FilterBy;

export interface filter {
    title: string
    index: number
    type?: filterType 
    firebase?: race | profileEnum | drinksEnum | genderEnum | priceRange | ServiceType
}

export const defaultAllFilter : filter[] = [
    { title: 'All profiles', index: -1 , type: filterType.default},
    // { title: 'E-Meet', index: 2 , type: filterType.default , firebase: ServiceType.eMeet },
    // { title: 'Gamers', index: 3 , type: filterType.default , firebase: ServiceType.games },
]

export const profileFilter : filter[] = [
    { title: 'Private', index: 0, type: filterType.profile, firebase: profileEnum.private },
    { title: 'Public', index: 1 , type: filterType.profile , firebase: profileEnum.public },
]

// export const drinksFilter : filter[] = [
//     { title: 'Sure 🍺', index: 4 , type: filterType.drinks, firebase: drinksEnum.sure },
//     { title: 'Nope 🍺', index: 5 , type: filterType.drinks , firebase: drinksEnum.nope},
//     { title: 'Social 🍺', index: 6 , type: filterType.drinks , firebase: drinksEnum.social },
// ]

export const genderFilter : filter[] = [
    { title: 'Female', index: 7, type: filterType.gender, firebase : genderEnum.female },
    { title: 'Male', index: 8 , type: filterType.gender,  firebase : genderEnum.male }
]

export const raceFilter : filter[] = [
    { title: 'Chinese', index: 9, type: filterType.race, firebase: race.chinese },
    { title: 'Malay', index: 10, type: filterType.race , firebase: race.malay},
    { title: 'Indian', index: 11, type: filterType.race , firebase: race.indian},
    // { title: 'White / Caucasian', index: 12, type: filterType.race , firebase: race.caucasian},
    // { title: 'Japanese / Korean', index: 14, type: filterType.race , firebase: race.japan},

    // { title: 'Asian', index: 18, type: filterType.race, firebase: race.asian },
    // { title: 'Black', index: 15, type: filterType.race , firebase: race.black},
    // { title: 'Mixed', index: 16, type: filterType.race , firebase: race.mixed},
    // { title: 'Others', index: 17, type: filterType.race , firebase: race.others}
]

// export const priceFilter = [
//     { title: 'Highest $', index: 0, type: filterType.price, firebase : priceRange.highest},
//     { title: 'Lowest $', index: 1 , type: filterType.price, firebase : priceRange.lowest} ,
// ]