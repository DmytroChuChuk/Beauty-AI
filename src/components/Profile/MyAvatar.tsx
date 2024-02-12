import { FC } from 'react';
import shallow from 'zustand/shallow';
import { Badge } from '@mui/material';
import '../../scss/components/Avatar/Avatar.scss';
import CenterFlexBox from '../Box/CenterFlexBox';
import ImageWithFallback from '../Misc/ImageWithFallback';
import { useUser } from '../../store';


interface props {
  hasOrder: boolean
}

const MyAvatar : FC<props> = ({hasOrder}) => {

    const [ uid, profileImage ] = useUser((state) => [
      state.currentUser?.uid, 
      state.currentUser?.profileImage
    ], shallow)

 
    // clubName.replace(/(.{6})..+/, "$1…").capitalize()
    if (uid) return <CenterFlexBox 
      className="app-bar-profile-wrapper"
      position="relative"

      // onClick={handleClick}
    > 
     <Badge
        overlap="circular"
        badgeContent={hasOrder ? "!" : 0}
        color="error"
      >
        <ImageWithFallback
          className="profile"
          style={{height: "40px", width: "40px"}}
          fallback={[profileImage?.toCloudFlareURL() ?? "https://images.rentbabe.com/assets/account_circle.svg"]}
          srcSet = {profileImage?.srcSetConvert() ?? "https://images.rentbabe.com/assets/account_circle.svg"}
          alt=""
        /> 
      </Badge>

      </CenterFlexBox>


    else return <></>
 
}

export default MyAvatar