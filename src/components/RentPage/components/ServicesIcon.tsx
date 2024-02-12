import { FC } from 'react';
import { ServiceType } from '../../../keys/props/services';
import { Avatar } from '@mui/material';
import DrinksIcon from '../../../icons/category/drinks.svg'
import MealsIcon from '../../../icons/category/meals.svg'
import EmeetIcon from '../../../icons/category/emeet.svg'
import GamesIcon from '../../../icons/category/games.svg'
import AdviceIcon from '../../../icons/category/relationship advice.svg'


interface props {
    label: {[key: number]: number}
}

const ServicesIcon : FC<props> = ({label}) => {

    const avatarStyles = {
        boxShadow: "0px 2px 14px 0px rgba(0, 0, 0, 0.10)",
        backgroundColor: "#fff"
    }

    if (label[ServiceType.meetup] === 0)
    return  <Avatar alt="Meals" sx={avatarStyles}>
        <img src={MealsIcon} alt="Meals" width={24} />
    </Avatar>

    else if (label[ServiceType.meetup] === 3)
    return  <Avatar alt="Drinks" sx={avatarStyles}>
        <img src={DrinksIcon} alt="Drinks" width={24} />
    </Avatar>

    else if (label[ServiceType.eMeet] === 0)
    return <Avatar alt="EMeets" sx={avatarStyles}>
        <img src={EmeetIcon} alt="EMeets" width={24} />
    </Avatar>

    else if (label[ServiceType.games] === 0)
    return <Avatar alt="mlbb" sx={avatarStyles}>
        <img src={"https://images.rentbabe.com/IMAGES/SERVICES/GAMES/MLbb.jpg?"} alt="mlbb" width="100%" />
    </Avatar>

    else if (label[ServiceType.eMeet] === 3)
    return <Avatar alt="Advice" sx={avatarStyles}>
        <img src={AdviceIcon} alt="Advice" width={24} />
    </Avatar>

    else if(label[ServiceType.games])
    return <Avatar alt="Games" sx={avatarStyles}>
        <img src={GamesIcon} alt="Games" width={24} />
    </Avatar>

    else return null
 
}

export default ServicesIcon