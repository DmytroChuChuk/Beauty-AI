import { BoxProps, TextField } from '@mui/material';
import { FC } from 'react';

interface props extends BoxProps {
    label : string
    defaultValue? : string
    placeholder: string
    onClick? : (event: any) => void
    onChange?: (event: any) => void
    readOnly? : boolean
    value? : string
}

const AdminInput : FC<props> = ({value, label, defaultValue, placeholder, onChange, onClick, readOnly = false, ...props}) => {

    return <TextField
        fullWidth
        color="secondary"
        label={label}
        variant="standard"
        type="text"
        value={value} 
        placeholder={placeholder} 
        defaultValue={defaultValue} 
        onChange={onChange}
        onClick={onClick}
    />
}

export default AdminInput