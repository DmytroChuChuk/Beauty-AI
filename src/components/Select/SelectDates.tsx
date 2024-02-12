import { FC, useState } from 'react';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import ListItemText from '@mui/material/ListItemText';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Checkbox from '@mui/material/Checkbox';

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

const dates = [
    "Mon",
    "Tues",
    "Wed",
    "Thurs",
    "Fri",
    "Sat",
    "Sun"
];

interface props {
    onChange: (value: string[]) => void
}

const SelectDates: FC<props> = ({onChange}) => {
  const [dateName, setDateName] = useState<string[]>([]);

  const handleChange = (event: SelectChangeEvent<typeof dateName>) => {
    const {
      target: { value },
    } = event;

    const _value = typeof value === 'string' ? value.split(',') : value
    setDateName(_value)
    onChange(_value)
  };

  return (
    <div>
      <FormControl size='small' color='secondary' fullWidth>
        <InputLabel  color="secondary">Select dates</InputLabel>
        <Select
          multiple
          value={dateName}
          onChange={handleChange}
          input={<OutlinedInput label="Select dates" />}
          renderValue={(selected) => selected.join(', ')}
          MenuProps={MenuProps}
        >
          {dates.map((name) => (
            <MenuItem key={name} value={name}>
              <Checkbox color="secondary" checked={dateName.indexOf(name) > -1} />
              <ListItemText primary={name} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
}

export default SelectDates