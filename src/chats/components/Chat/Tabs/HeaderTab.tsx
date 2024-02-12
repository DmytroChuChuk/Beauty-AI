import { Box, Tabs, Tab, SxProps, Theme } from '@mui/material';
import { FC } from 'react';

interface props {
    sx?: SxProps<Theme> | undefined
    value: number
    onChange: (event: React.SyntheticEvent, newValue: number) => void 
}

const HeaderTab : FC<props> = ({value, onChange, sx}) => {

    return <Box  sx={{ borderBottom: 1, borderColor: 'divider', backgroundColor: 'white', ...sx }}>
    <Tabs variant="fullWidth" textColor="secondary" indicatorColor="secondary" value={value} onChange={onChange}>
      <Tab label="Conversation"  />
      <Tab label="Deleted Chats" />
    </Tabs>
  </Box>
 
}

export default HeaderTab