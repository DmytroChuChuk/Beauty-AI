import { Select, MenuItem, SelectProps } from "@mui/material"
import { FC } from "react"
import { race } from "../../../enum/MyEnum";

interface props extends SelectProps{
    selected: string | undefined

}

const SelectRace: FC<props> = ({selected, ...props}) => {

    // const [value, setValue] = useState<race>(selected)


    return  <Select
        {...props}
        defaultValue={selected}
    >

      <MenuItem value={race.asian}>Asian</MenuItem>
      <MenuItem value={race.chinese}>Chinese</MenuItem>
      <MenuItem value={race.malay}>Malay</MenuItem>
      <MenuItem value={race.indian}>Indian</MenuItem>
      <MenuItem value={race.japan}>Korean / Japanese</MenuItem>
      <MenuItem value={race.caucasian}>White / Caucasian</MenuItem>
      <MenuItem value={race.black}>Black</MenuItem>
      <MenuItem value={race.mixed}>Mixed</MenuItem>
      <MenuItem value={race.others}>Others</MenuItem>

    </Select>



}

export default SelectRace