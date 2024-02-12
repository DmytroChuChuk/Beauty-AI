import { FC } from 'react';

interface props {
    children?: React.ReactNode;
    dir?: string;
    index: number;
    value: number;
  }

const TabPanel : FC<props> = ({children, dir, index, value, ...other}) => {

    return <div
        role="tabpanel"
        hidden={value !== index}
        id={`full-width-tabpanel-${index}`}
        aria-labelledby={`full-width-tab-${index}`}
        {...other}>

        {value === index && (
            <>{children}</>
        )}
    </div>


 
}

export default TabPanel