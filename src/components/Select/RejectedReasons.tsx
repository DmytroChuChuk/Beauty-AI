import { FC, useState} from 'react';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import ListItemText from '@mui/material/ListItemText';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Checkbox from '@mui/material/Checkbox';
import { Box } from '@mui/material';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

export enum reasonEnum {
    VENUE_TOO_FAR,
    VENUE_NOT_COMFORTABLE,
    NOT_AVAILABLE
}

const names = [
  'Venue is too far',
  "Not comfortable with venue",
  'Not available',
];

interface props {
    // defaultValues: string[]
    onChange: (value: number[]) => void
}

const RejectedReason: FC<props> = ({onChange}) => {

  const [personName, setPersonName] = useState<string[]>([]);

  const handleChange = (event: SelectChangeEvent<typeof personName>) => {
    const {
      target: { value },
    } = event;

    setPersonName(
      // On autofill we get a stringified value.
      typeof value === 'string' ? value.split(',') : value,
    );

    let num = []

    if(typeof value === 'string'){
        const _num = parseInt(value)
        num.push(_num)
    }else{
        for (let index = 0; index < value.length; index++) {
            const _v = value[index];
            const _num = parseInt(_v)
            num.push(_num)
        }
    }
    onChange(num)

  };

  return (
    <Box marginTop="16px">
      <FormControl size='small' fullWidth>
        <InputLabel color='secondary'>Select reason</InputLabel>
        <Select
          multiple
          value={personName}
          onChange={handleChange}
          input={<OutlinedInput  color="secondary" label="Select reason" />}
          renderValue={(selected) => {
            let _value: string[] = []
            selected.forEach(element => {
                const _n = names[parseInt(element)] 
                _value.push(_n)
            });
            return _value.join(", ")
          }}
          MenuProps={MenuProps}
        >
          {names.map((name, index) => (
            <MenuItem key={name} value={`${index}`}>
              <Checkbox color="secondary" checked={personName.indexOf(`${index}`) > -1} />
              <ListItemText primary={name} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
}

export default RejectedReason