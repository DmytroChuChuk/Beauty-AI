import { ChangeEvent, FC, useEffect, useState } from 'react';
import TextField from '@mui/material/TextField/TextField';
import Typography from '@mui/material/Typography';
import { Autocomplete, Box, Button, Chip, Divider, Drawer, FormControlLabel, Radio, RadioGroup} from '@mui/material';


// import FilterBy, { filter, filterType } from '../../Filter/FilterBy';
import FlexGap from '../../Box/FlexGap';
import CenterFlexBox from '../../Box/CenterFlexBox';
import shallow from 'zustand/shallow';
import { race, genderEnum, priceRange,  profile as profileEnum, drinks as drinksEnum, sortBy} from '../../../enum/MyEnum';
import { defaultRace, defaultProfile, defaultGender, defaultPrices, defaultSortedBy } from '../../../keys/defaultValues';
import { filterProfile, filterGender, filterPrice, filterRace } from '../../../keys/localStorageKeys';
import { useUser } from '../../../store';
import { ServiceType } from '../../../keys/props/services';
import { logEvent } from 'firebase/analytics';
import { AnalyticsNames } from '../../../keys/analyticNames';
import { analytics } from '../../../store/firebase';
import { club, sortByRatings } from '../../../keys/firestorekeys';
import FlexBox from '../../Box/FlexBox';
import FilterButton from '../../Buttons/FilterButton';
import SearchUsernameInput from '../../Inputs/SearchUsernameInput';
import { useTranslation } from 'react-i18next';
import { useWindowSize } from '../../../hooks/useWindowSize';
import { hideFilterButtonSize } from '../../../dimensions/basicSize';
import BlackButton from '../../Buttons/BlackButton';
import { isLoyalPeriod, loyalPointsLimit } from '../../../data/data';

export enum filterType {
  race,
  price,
  drinks,
  profile,
  gender,
  default
}

interface props {
    openMenu: boolean
    title: string | undefined
    getRegionState: string[]
    value: string
    openCountryDialogClick: () => void
    onSearch: () => void
    onChange: (filters : filter[], sortByKey: string) => void
    setMenu: (setter: boolean) => void
}

const FilterByPanel : FC<props> = ({
  openMenu, 
  title, 
  getRegionState, 
  value, 
  openCountryDialogClick, 
  onSearch, 
  onChange,
  setMenu
}) => {

  const allFilters : filter[] = [
    ...defaultAllFilter,
    ...profileFilter,
    ...genderFilter,
    ...raceFilter,
    // ...drinksFilter,
  ]

  const drawerWidth = 250
  const widthLimit = hideFilterButtonSize //500
  const clubName = sessionStorage.getItem(club)

  const [ t ] = useTranslation()
  const [ size ] = useWindowSize()
  const screenWidth = size.width

  //const [openMenu, setMenu] = useState<boolean>(false)
  const [defaultSortedByValue, setDefaultSortedByValue] = useState<string>(defaultSortedBy)
  const [sortedBy, setSortedBy] = useState<string>(defaultSortedByValue)
  // const defaultSortedByValue = defaultSortedBy

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
  const [getChips, setChips] = useState<any[]>(defaultArray)

  const [isPremium, points] = useUser((state) => [
    state.currentUser?.isPremium,
    state.currentUser?.points
  ], shallow)

  const [options, setOptions] = useState<filter[]>(allFilters)

  const isLoyal = (!isPremium && (points ?? 0) >= loyalPointsLimit) && isLoyalPeriod

  useEffect(() => {
    filterOptions(defaultArray)
    // eslint-disable-next-line
  }, []) 

  const onChangeHandle = (event: ChangeEvent<HTMLInputElement>, value: string) => {
    setSortedBy(value)
    onChange(getSelectedFilters, value)
  }

  const onResetClick = () => {
    setSelectedFilters(defaultAllFilter)
    setOptions(allFilters)
    setSortedBy(sortBy.RECENTLY.toString())
  }

  const onSearchClick = () => {

      localStorage.removeItem(filterProfile)
      localStorage.removeItem(filterGender)
      localStorage.removeItem(filterPrice)
      localStorage.removeItem(filterRace)
      localStorage.removeItem(sortByRatings)

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

      localStorage.setItem(sortByRatings, sortedBy)
      setDefaultSortedByValue(sortedBy)

      try{
        // console.log(getSelectedFilters)
        const fs = Object.values(getSelectedFilters)
        fs.forEach((f) => {
          const title = (f.title)
          logEvent(analytics, AnalyticsNames.buttons, {
            content_type: `filter ${title}`,
            item_id: `filter ${title}`
          })  
        })
 
        if(sortedBy === sortBy.RECENTLY.toString()){
          logEvent(analytics, AnalyticsNames.buttons, {
            content_type: `filter RECENTLY`,
            item_id: `filter RECENTLY`
          })
        } else if(sortedBy === sortBy.HIGHEST_RATINGS.toString()){
          logEvent(analytics, AnalyticsNames.buttons, {
            content_type: `filter HIGHEST_RATINGS`,
            item_id: `filter HIGHEST_RATINGS`
          })
        } else if(sortedBy === sortBy.LOWEST_PRICE.toString()){
          logEvent(analytics, AnalyticsNames.buttons, {
            content_type: `filter LOWEST_PRICE`,
            item_id: `filter LOWEST_PRICE`
          })
        }
      }catch{}
      
      //setMenu(false)
      setMenu(false)
      setChips(getSelectedFilters)
      onSearch() 
      //onSearch( getSelectedFilters )        
  }

  // function shorten(title: string, limit: number): string{
  //   return title.length > limit ? title.substring(0,limit) + "..." : title;
  // }

  function filterOptions(data: any[]){

    let arrayNow : any[] = defaultAllFilter
    // const filtered = arrayNow.filter((_v) => {
    //     return !!data.find((v) => v.index !== _v.index) 
    // })

    // console.log(filtered)
    if(data.some(e => e.index === -1)){
      arrayNow = allFilters
    }else{
      if(!data.some(e => e.type === filterType.profile)){
        arrayNow = [...arrayNow, ...profileFilter]
      }

      if(!data.some(e => e.type === filterType.gender)){
        arrayNow = [...arrayNow, ...genderFilter]
      }

      if(!data.some(e => e.type === filterType.race)){
        arrayNow = [...arrayNow, ...raceFilter]
      }
    }

    setOptions(arrayNow)
  }

  const getOptionDisabledHandler = (option: filter) => {
    //return !isPremium ? (option === profileFilter[0]) : false
    return !isPremium ? (isLoyal ? false : (option === profileFilter[0])) : false
  }

  function filterOptionHandler(data: filter[]): filter[]{

    let myArray = data
    if(myArray.length === 0){
      myArray.push(defaultAllFilter[0])
    }else{
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

    return myArray
  }

  function toggleDrawer(event:any = null) {

    if (event?.type === 'keydown' && (event?.key === 'Tab' || event?.key === 'Shift' || event?.key === 'Esc')) {
      return;
    }

    if(openMenu){
      filterOptions(getChips)
      setSelectedFilters(getChips)
      setSortedBy(defaultSortedByValue)
      onChange(getChips, defaultSortedByValue)
    }else{
      try{
        logEvent(analytics, AnalyticsNames.buttons, {
          content_type: "filter btn side",
          item_id: "filter btn side", 
        })  
      }catch{}
    }

    setMenu(!openMenu)

    //setMenu(!openMenu);
  }
  // onClick={toggleDrawer}

  return <>
    <FlexBox height={30} position="relative" width="100%" >

      <FlexBox
        display="flex"
        position="absolute" 
        width="100%"
        zIndex={1}
      >

        <FlexGap/>

        <CenterFlexBox
          onClick={openCountryDialogClick}
          sx={{cursor: "pointer"}}
          //width={screenWidth > widthLimit ? "100%" : "auto"}  
          // paddingLeft={screenWidth > widthLimit ? 0 : 0} 
          // marginLeft={screenWidth > 500 ? "auto" : "0"} 
          marginRight="auto"
          marginLeft="auto"
        >

         <img
            width={16}
            height={16}
            // src= "https://images.rentbabe.com/assets/mui/location_filled.svg" 
            src="https://images.rentbabe.com/assets/flaticon/location.svg"
            alt=""
          />

          <Typography marginLeft={0.4} marginRight={0.2} fontWeight="bold" variant='body2' color="text.secondary">
            {getRegionState.join(", ").shorten(
              screenWidth < widthLimit ? 35 : 60
            )}
          </Typography>

           <img
            width={16}
            height={16}
            //src= "https://images.rentbabe.com/assets/mui/location_filled.svg" 
            src="https://images.rentbabe.com/assets/flaticon/down.svg"
            alt=""
          />


        </CenterFlexBox>
        </FlexBox>


      <CenterFlexBox 
        position="absolute" 
        zIndex={2} 
        right={10} 
        onClick={toggleDrawer} 
        sx={{cursor: "pointer"}} >

        {(getChips && getChips.length > 0) &&
          getChips.map((value, index) => {
            if(value.title === "All profiles") return null
            else return <Chip
              key={index}
              sx={{margin: "0 2px"}}
              variant="filled" 
              color="secondary"
              label={
                <Typography variant='caption'>{value.title.shorten(8)}</Typography> 
              }
              size='small'/>
        })}

        {size.width >= widthLimit && <>
          <FlexGap/>
          <FilterButton/>
        </>}

      </CenterFlexBox>

    </FlexBox>


  <Drawer anchor={"right"} open={openMenu} onClose={toggleDrawer}>
      <Box sx={{minWidth: drawerWidth, height: "100vh"}} marginTop={4} marginLeft={2} marginRight={2}>
        <Typography variant='h5' margin={1}>{t("filter")}{title ? ` by: ${title.shorten(14)}` : ""}</Typography>

        <Box marginTop={3}>
          <SearchUsernameInput
        />
        </Box>

        <Box marginTop={3}>
        {getRegionState.length > 0 ? <>

          <CenterFlexBox onClick={openCountryDialogClick}>

          <TextField
            fullWidth 
            inputProps={{readOnly: true}} 
            label='Search location'
            color='secondary'
            size="small"
            value = {value}
          />

            <img width={24} height={24} style={{marginLeft: '.5em'}} 
            src = "https://images.rentbabe.com/assets/location/find.svg" alt=''></img>

          </CenterFlexBox><br/></> : null}

          <Divider/>
       
          <br/>
 
          <RadioGroup value={sortedBy} onChange={onChangeHandle} >
            <FormControlLabel value={sortBy.RECENTLY} control={<Radio color="warning" />} label={
                <Typography variant='caption'>{t("recently.active")}</Typography>
              }
            />

            {
              !clubName && <>
                <FormControlLabel value={sortBy.HIGHEST_RATINGS} control={<Radio color="warning"  />} label={
                    <Typography variant='caption'>{t("highest.ratings")}</Typography>
                  }
                />

                <FormControlLabel value={sortBy.LOWEST_PRICE} control={<Radio color="warning"  />} label={
                  <Typography variant='caption'>{t("lowest.price")}</Typography>
                }/>

                {/* <FormControlLabel value={sortBy.HIGHEST_PRICE} control={<Radio color="warning"  />} label={
                  <Typography variant='caption'>Highest Price</Typography>
                }/> */}
              </>
            }


            {/* <FormControlLabel value={2} control={<Radio color="warning"  />} label={
              <Typography variant='caption'>Highest Price</Typography>
            }/>
            <FormControlLabel value={3} control={<Radio color="warning"  />} label={
              <Typography variant='caption'>Lowest Price</Typography>
            }/> */}
          </RadioGroup>

          <br/>

          <div className = "filter-wrapper">
            <Autocomplete
                sx={{maxWidth: drawerWidth}}
                size="small"
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
                        return <Box key={_index} component="li" sx={{ '& > img': { mr: 2, flexShrink: 0 } }} {...props}>

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
                        return <Box key={_index} component="li" {...props}>
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
                    let myArray = filterOptionHandler(data)
                    
                    filterOptions(myArray)
                    setSelectedFilters(myArray)
                    onChange(myArray, sortedBy)
                }}
                getOptionDisabled={getOptionDisabledHandler}
                renderInput={(params) => (
                <TextField
             
                    {...params}
                    inputProps={{ ...params.inputProps, readOnly: true }}
                    label={  'Filter by' }
                    margin='dense'
                    color='secondary'
                    variant='outlined'
                />
                )}
            />
          </div>
          <br/>

          <FlexBox marginTop={2}>

            <BlackButton
             variant='contained' 
             onClick={onSearchClick}
            >
              Apply
            </BlackButton>

            {/* <Button 
              sx={{background: "black", color: "white!important"}}
              variant='contained' 
              onClick={onSearchClick}>Apply</Button> */}

            <FlexGap/>

            <Button color="inherit" variant='contained' onClick={onResetClick}>
              Reset
            </Button>

          </FlexBox>


        </Box>     
      </Box>
    </Drawer>
  </>
 
}

export default FilterByPanel

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