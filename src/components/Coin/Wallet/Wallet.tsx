import { Box, Typography } from '@mui/material';
import { FC } from 'react';

import CreditBalance from './CreditBalance';
import { useUser } from '../../../store';
import FlexBox from '../../Box/FlexBox';
import DefaultTooltip from '../../Tooltip/DefaultTooltip';
import shallow from 'zustand/shallow';
import { Calculator } from '../../../utility/Calculator';
import { useTranslation } from 'react-i18next';


const Wallet : FC = () => {


    const { t } = useTranslation()
    const cal = new Calculator()

    const [
        points,
        penaltyCredits
    ] = useUser((state) => [
        state.currentUser?.points,
        state.currentUser?.penaltyCredits
    ],shallow)


    return <Box>
            <Box maxWidth={1280}>
                <FlexBox>
                    <CreditBalance/>
                </FlexBox>

                <FlexBox marginTop={1} marginLeft={1}  alignItems="center" >
                    {(points ?? 0) > 0 && <Typography 
                        marginRight="10px"
                        fontWeight="bold"
                        color="secondary" 
                        variant='body2'> Loyalty Points: { cal.priceFormat(((points ?? 0) / 100)) } <DefaultTooltip 
                        width={14}
                        title={t("loyalpoints.description")}
                        url = "https://images.rentbabe.com/assets/question.svg"/> 
                    </Typography>}

                    {((penaltyCredits ?? 0) > 0) && <Typography 
                        fontWeight="bold"
                        color="error" 
                        variant='body2'> Penalty Credits: {cal.priceFormat( ((penaltyCredits ?? 0) / 100)) } <DefaultTooltip 
                        width={14}
                        title={
                            <Typography fontSize="inherit" variant='inherit' color="inherit">
                                {t("credit.penalty")} 
                                <br/>
                                <br/>
                                <a 
                                    rel="noreferrer"
                                    style={{textDecoration: "none", color: "inherit"}} 
                                    href="https://images.rentbabe.com/GUIDELINE/penalty.png?v=1" 
                                    target='_blank'>
                                <b>
                                    VIEW MORE</b>
                                </a>
                            </Typography>
                        }
                        url = "https://images.rentbabe.com/assets/question.svg"/> 
                    </Typography>}


                </FlexBox>

            </Box>
        </Box>
}

export default Wallet