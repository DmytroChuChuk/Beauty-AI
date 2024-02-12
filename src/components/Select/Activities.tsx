import { FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import { FC, useState } from 'react';
import { meetupEnum } from '../../enum/MyEnum';


interface props {
  defaultValue: string | undefined
    onChange: (value: number) => void
}

const Activities : FC<props> = ({ defaultValue, onChange}) => {

    const [lang, setLang] = useState<number>(parseInt(defaultValue ?? ""));

    const handleChange = (event: SelectChangeEvent) => {
        const value = event.target.value
        const _value = parseInt(value)
        setLang(_value)

        onChange(_value)
    };


    return  <FormControl 
    variant="standard" 
    color='secondary' 
    size='small' 
    sx={{ m: 1, minWidth: 80, maxWidth: 80, 
        height: 32, fontSize: '10px!important'}}
    >

  <InputLabel variant="standard" >
    Actvitiy
  </InputLabel>

    <Select
      value={`${lang}`}
      onChange={handleChange}
      
    >

      <MenuItem  value={meetupEnum.meals}>Meal</MenuItem>

      <MenuItem  value={meetupEnum.drinks}>Drinks</MenuItem>

      <MenuItem  value={meetupEnum.hiking}>Hiking</MenuItem>

      <MenuItem  value={meetupEnum.dining}>Fine dining</MenuItem>

      <MenuItem  value={meetupEnum.photoshoot}>Photoshoot</MenuItem>

      <MenuItem  value={meetupEnum.gathering}>Gathering</MenuItem>

      <MenuItem  value={meetupEnum.movies}>Movies</MenuItem>

    </Select>

  </FormControl>
 
}

export default Activities