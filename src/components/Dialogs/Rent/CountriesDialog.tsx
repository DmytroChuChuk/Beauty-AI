import {useState, useRef} from 'react';

import { filterDrinks, filterGender, filterPrice, filterProfile, filterRace, pageArea, serviceIndexKey } from '../../../keys/localStorageKeys';
import { Dialog, DialogActions, 
  DialogContent, Button, FormControlLabel, Radio, RadioGroup, Typography} from '@mui/material';


import { area as areaKey } from '../../../keys/localStorageKeys';

import GeoInput from '../../Inputs/GeoInput';
import { club, state } from '../../../keys/firestorekeys';
import { useUser } from '../../../store';

export interface ConfirmationDialogRawProps {
  keepMounted: boolean
  value: string | undefined
  open: boolean
  onClose: (value?: string) => void
}

export default function CountriesDialog(props: ConfirmationDialogRawProps) {

  const [currentCountryCode]= useUser((state) => [state.currentUser?.countryCode])


  const clubName = sessionStorage.getItem(club)
  const clubState = sessionStorage.getItem(state)

  const { onClose, value: valueProp, open, ...other } = props;

  const [placeSelected, setPlaceSelected] = useState<string | undefined>()

  const radioGroupRef = useRef<HTMLElement>(null);

  const handleEntering = () => {
    if (radioGroupRef.current != null) {
      radioGroupRef.current.focus();
    }
  };

  const handleCancel = () => {
    onClose();
  };

  const handleOk = () => {

    if(placeSelected){
      // const venue = value.split(", ")[0]
      const key = (clubName && clubState) ? pageArea : areaKey
      localStorage.setItem(key, placeSelected)
    } 

    localStorage.removeItem(filterDrinks)
    localStorage.removeItem(filterProfile)
    localStorage.removeItem(filterGender)
    localStorage.removeItem(filterPrice)
    localStorage.removeItem(filterRace)
    localStorage.removeItem(serviceIndexKey)

    window.location.href = `page/Rent?no=${(new Date().getTime())}`
  }

  const onPlaceSelected = (formatted_address: string | undefined) => {
    setPlaceSelected(formatted_address)

  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPlaceSelected((event.target as HTMLInputElement).value);
  };


  return (
    <Dialog
      onClose={handleCancel}
      fullWidth
      maxWidth="xs"
      onTransitionEnd={handleEntering}
      open={open}
      {...other}>

      <DialogContent dividers>

      <br/>
      
      <div>
        <GeoInput searchFor='location' defaultValue={valueProp} onPlaceSelected={onPlaceSelected}/>
      </div>

      <br/>
      <Typography fontSize={12}>Popular cities</Typography>

      <RadioGroup
        defaultValue={""}
          ref={radioGroupRef}
          onChange={handleChange}>

            {
              currentCountryCode === "SG" ? <>
                        <FormControlLabel value={'Singapore'}  control={<Radio color='secondary'/>} label={'Singapore'}/> 
                        <FormControlLabel value={'Kuala Lumpur, Malaysia'}  control={<Radio color='secondary'/>} label={'Kuala Lumpur'}/>
                        <FormControlLabel value={'Jakarta, Indonesia'} control={<Radio color='secondary'/>} label={'Jakarta'}/>
                        <FormControlLabel value={'Metro Manila, Philippines'}  control={<Radio color='secondary'/>} label={'Metro Manila'}/>
                        <FormControlLabel value={'Colombia'}  control={<Radio color='secondary'/>} label={'Colombia'}/>
              </> : currentCountryCode === "MY" ? <>
                         <FormControlLabel value={'Kuala Lumpur, Malaysia'}  control={<Radio color='secondary'/>} label={'Kuala Lumpur'}/>
                         <FormControlLabel value={'Singapore'}  control={<Radio color='secondary'/>} label={'Singapore'}/> 
                         <FormControlLabel value={'Jakarta, Indonesia'} control={<Radio color='secondary'/>} label={'Jakarta'}/>
                         <FormControlLabel value={'Metro Manila, Philippines'}  control={<Radio color='secondary'/>} label={'Metro Manila'}/>
                         <FormControlLabel value={'Colombia'}  control={<Radio color='secondary'/>} label={'Colombia'}/>
              </> : currentCountryCode === "ID" ? <>
                    <FormControlLabel value={'Jakarta, Indonesia'} control={<Radio color='secondary'/>} label={'Jakarta'}/>
                    <FormControlLabel value={'Singapore'}  control={<Radio color='secondary'/>} label={'Singapore'}/> 
                    <FormControlLabel value={'Kuala Lumpur, Malaysia'}  control={<Radio color='secondary'/>} label={'Kuala Lumpur'}/>
                    <FormControlLabel value={'Metro Manila, Philippines'}  control={<Radio color='secondary'/>} label={'Metro Manila'}/>
                    <FormControlLabel value={'Colombia'}  control={<Radio color='secondary'/>} label={'Colombia'}/>
              </> : <>
                    <FormControlLabel value={'Singapore'}  control={<Radio color='secondary'/>} label={'Singapore'}/> 
                    <FormControlLabel value={'Kuala Lumpur, Malaysia'}  control={<Radio color='secondary'/>} label={'Kuala Lumpur'}/>
                    <FormControlLabel value={'Jakarta, Indonesia'} control={<Radio color='secondary'/>} label={'Jakarta'}/>
                    <FormControlLabel value={'Metro Manila, Philippines'}  control={<Radio color='secondary'/>} label={'Metro Manila'}/>
                    <FormControlLabel value={'Colombia'}  control={<Radio color='secondary'/>} label={'Colombia'}/>
              </>

            }

            {/* {currentCountryCode === "ID" && <FormControlLabel value={'South Jakarta, South Jakarta City, Jakarta, Indonesia'}  control={<Radio color='secondary'/>} label={'South Jakarta'}/> }
            {currentCountryCode === "ID" && <FormControlLabel value={'Central Jakarta, Central Jakarta City, Jakarta, Indonesia'}  control={<Radio color='secondary'/>} label={'Central Jakarta'}/> }
            {currentCountryCode === "ID" && <FormControlLabel value={'North Jakarta, North Jakarta City, Jakarta, Indonesia'}  control={<Radio color='secondary'/>} label={'North Jakarta'}/> }
            {currentCountryCode === "ID" && <FormControlLabel value={'West Jakarta, West Jakarta City, Jakarta, Indonesia'}  control={<Radio color='secondary'/>} label={'West Jakarta'}/> }
            {currentCountryCode === "ID" && <FormControlLabel value={'East Jakarta, West Jakarta City, Jakarta, Indonesia'}  control={<Radio color='secondary'/>} label={'East Jakarta'}/> } */}
      </RadioGroup>

      </DialogContent>

      <DialogActions>
        <Button autoFocus onClick={handleCancel} color='secondary' variant="contained">
          Cancel
        </Button>

        <Button disabled={!placeSelected} onClick={handleOk} color="secondary" variant="contained">
          GO
        </Button>

      </DialogActions>
    </Dialog>
  );
}