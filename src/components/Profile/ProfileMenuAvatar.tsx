import CircleMenuIcon from "../../icons/materialUiSvg/menu";
import { Avatar, Badge, Box } from "@mui/material";
import { FC } from "react";

interface props {
  imgSrc?: string;
}
const ProfileMenuAvatar: FC<props> = ({ imgSrc }) => {
  return (

      <Badge
        sx={{ cursor: "pointer" }}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        overlap="circular"
        badgeContent={

          <Box
          style={{
            height: 28,
            width: 28,
            transform: "translate(-4px, -4px)",
          }}
          >
             <CircleMenuIcon    />
          </Box>
     
        }
      >
        <Avatar
          sx={{
            width: "40px", height: "40px",
            border: '2px solid #CCCCCC' 
        }}
          src={imgSrc}
          className="profile-avatar"
        />
      </Badge>

  );
};

export default ProfileMenuAvatar;
