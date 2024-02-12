import { FC } from 'react';
import CenterFlexBox from '../../../components/Box/CenterFlexBox';

interface props {
    children?: React.ReactNode;
}

const PageFooterContainer : FC<props> = ({children}) => {

    return <CenterFlexBox 
    sx={{
        maxHeight: '82px', 
        boxShadow: "none", 
        borderTop: `1px solid rgba(50, 50, 50, .16)`, 
        borderRadius: "0"   
      }}
    bgcolor="white" 
    position="fixed" 
    left={0} 
    right={0} 
    bottom={0} 
    flexDirection="column" 
    padding={4}>{children}</CenterFlexBox>
 
}

export default PageFooterContainer