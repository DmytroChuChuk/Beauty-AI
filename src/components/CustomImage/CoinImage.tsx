import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import DefaultTooltip from '../Tooltip/DefaultTooltip';

interface props {
    imageWidth?: number
    margin?: string
}

const CoinImage : FC<props> = ({margin, imageWidth = 32}) => {

    const { t } = useTranslation()

    return <DefaultTooltip
        margin= {margin}
        width={imageWidth}
        title={t("coin.hint")}
        url="https://images.rentbabe.com/assets/logo/coin96.png" 
    />
 
}

export default CoinImage