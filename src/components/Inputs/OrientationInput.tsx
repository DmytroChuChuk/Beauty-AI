import { Button, Checkbox, Dialog, DialogActions, DialogContent, DialogContentText, 
    List, ListItem, ListItemText } from '@mui/material';
import { ChangeEvent, FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { OrientationEnum } from '../../enum/MyEnum';
import { useWindowSize } from '../../hooks/useWindowSize';
import AdminInput from '../adminpage/components/AdminInput';
import DialogToolbar from '../Dialogs/components/DialogToolbar';

interface props {
    value: string[] | undefined
    onSelect: (value: string[]) => void 
}

const OrientationInput : FC<props> = ({value, onSelect}) => {

    const widthLimit = 400
    const [size] = useWindowSize()
    const { t } = useTranslation()
    const [open, setOpen] = useState<boolean>(false)
    

    const [counter, setCounter] = useState<number>(value?.length ?? 0)
    const [array, setArray] = useState<string[]>(value ?? [])

    const onClick = () => {
        setOpen(true)
    }

    const onClose = () => {
        setArray(value ?? [])
        setOpen(false)
        setCounter(value?.length ?? 0)
    }

    const onSave = () => {
        setOpen(false)
        // onSelect
        onSelect(array)
    }

    const checkBoxChange = (event: ChangeEvent<HTMLInputElement>, checked: boolean) => {

        const value = event.currentTarget.value

        setArray((prev) => {
            let prevArray = prev

            if(checked) prevArray?.push(value)
            else prevArray = prev.filter((e) => { return e !== value })

            return prevArray
        })
        
        setCounter(prev => {
            const count = prev + ( 1 * (checked ? 1 : -1))
            return count
        })
    }

    return <>

        <AdminInput 
            readOnly
            label='Orientation'
            placeholder="Gay/Lesbian/Straight"
            value={value?.join(", ")} 
            onClick={onClick}
            // onChange={(e) => setAct((e.target as HTMLInputElement).value)}
        />

        <Dialog fullWidth={size.width > widthLimit} fullScreen = {size.width <= widthLimit} open={open} onClose={onClose}>

            <DialogToolbar title={"Orietation"} 
            doneButtonName="RESET"
            onDoneClick={() => {
                setArray([])
                setCounter(0)
                onSelect([])
            }} onBackClick={onClose}            
            />
    
            <DialogContent>

                <DialogContentText>
                    {array.length > 0 && <>
                        {
                            array.map((value, index) => {
                                const lastIndex = array.length - 1
                                if (index === 0) return `I am ${value}${index === lastIndex ? "." : ""}`
                                else if (index < lastIndex) return `, ${value}`
                                else if (index === lastIndex) return ` or ${value}.`
                                else return ""
                                
                            })
                        }
                    </>}
                </DialogContentText>
            

                <List>

                    {
                        Object.values(OrientationEnum).map((value, index) => {
                            return <ListItem disabled={!array.includes(value) && counter > 4}  key={index} secondaryAction={
                                <Checkbox value={value} 
                                checked={array.includes(value)}
                                disabled={!array.includes(value) && counter > 4} color="secondary" onChange={checkBoxChange}/>
                            }>
                           
                                <ListItemText
                                    primary={value}
                                    secondary={t(`${value.toLowerCase()}.description`)}
                                />

                            </ListItem>
                        })
                    }

                </List>

            </DialogContent>

            <DialogActions>
                <Button color="secondary" onClick={onClose}>Cancel</Button>
                <Button disabled={array.length === 0} color="secondary" onClick= {onSave} >Update</Button>
            </DialogActions>

        </Dialog>

    </>
 
}

export default OrientationInput