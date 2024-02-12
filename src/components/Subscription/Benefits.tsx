import { List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { FC } from 'react';
// import { useTranslation } from 'react-i18next';


const Benefits : FC = () => {

  // const { t } = useTranslation()

  // "unlimited.benefit": "No transaction fees",
  // "access.benefit": "Acccess to private profiles",
  // "discount.benefit": "10% more Credit and no transaction fees",

    return  <List 
    sx={{  width : "300px"}}>


    <ListItem>
      <ListItemIcon>
        <img width={24} src = "https://images.rentbabe.com/assets/subscription/messages.svg" alt = ''></img>
      </ListItemIcon>
      <ListItemText primary={"No transaction fees"} />
    </ListItem>
    <ListItem>
      <ListItemIcon>
        <img  width={24} src = "https://images.rentbabe.com/assets/subscription/unlock.svg" alt = ''></img>
      </ListItemIcon>
      <ListItemText primary={"Acccess to private profiles"}  />
    </ListItem>
    <ListItem >
      <ListItemIcon>
        <img width={24} src = "https://images.rentbabe.com/assets/subscription/discount.svg" alt = ''></img>
      </ListItemIcon>
      <ListItemText primary={"10% more credit and 0% transaction fees"}  />
    </ListItem>
  </List>
 
}

export default Benefits