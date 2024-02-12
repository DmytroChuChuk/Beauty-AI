import { Box, Button, Card, Chip } from '@mui/material';
import { FC } from 'react';
import { useUser } from '../../store';
import { Helper } from '../../utility/Helper';
import CenterFlexBox from '../Box/CenterFlexBox';
import PremiumBg from '../RentPage/components/premium-bg.png'


interface props {
    index: number
    width: number
}

const DummyCard : FC<props> = ({index, width}) => {

    const [ uid ] = useUser((state) => [state.currentUser?.uid])

    const upgrade = () => {          
        const helper = new Helper()
        helper.upgradePremium(uid)
    }

    return <CenterFlexBox>

    <Card 
        key={index} 
        sx={{ display: 'flex', flexDirection: 'column', 
        width: width,
        aspectRatio: {xs: "1/2",md: "3/5"},
        maxHeight: '384px',
        boxShadow: '0px 4px 10px 0px rgba(0, 0, 0, 0.20)',
        background: `url("${PremiumBg}")`,  marginLeft: "4px",
        borderRadius: '16px', backgroundSize: 'cover', p: '24px'}} 
        >
        <Box
            flex={1}
            display={'flex'}
            alignItems={'center'}
        >
            <Chip
                label='Private Profile'
                icon={
                    <img
                        width={24}
                        height={24}
                        src="https://images.rentbabe.com/assets/padlock.png" alt=""
                    />
                }
                sx={{
                    color: '#fff',
                    mx: 'auto',
                    fontSize: {xs:'14px', md: '16px'},
                    borderRadius: '100px',
                    fontWeight: '500',
                    height: 'auto',
                    padding: '10px 16px',
                    background: "rgba(255, 255, 255, 0.20)"
                }}
            />
        </Box>
        <Button
            sx={{
                borderRadius: '100px',
                boxShadow: 'none',
                fontSize: {xs:'14px', md: '16px'},
                ':hover': {
                    boxShadow: 'none'
                },
                textTransform: 'none',
                py: '12px'
            }}
            onClick={upgrade}
            variant='contained'
        >
            Upgrade
        </Button>
        {/* <Box className='profile-wrapper' bgcolor="#d2d2d4">

        <div className='group-top-nbg' >
            <CenterFlexBox>
                <Button color="warning" variant='contained' onClick={upgrade}>
                    UPGRADE
                </Button>
            </CenterFlexBox>

        </div>

        <div className='group darker' style={{minHeight: "48px"}}>
            <div>
                <p>Private profile</p>
            </div>
        </div>

        <img  className='lock-img' 
        width={24}
        height={24}
        src="https://images.rentbabe.com/assets/padlock.png" alt=""/>
        </Box> */}
    </Card>

    </CenterFlexBox>
 
}

export default DummyCard