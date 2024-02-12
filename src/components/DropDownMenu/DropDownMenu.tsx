import CloseIcon from "../../icons/materialUiSvg/close";
import {
  Box,
  IconButton,
  Menu,
  Paper,
  Popover
} from "@mui/material";

import * as React from "react";
import shallow from "zustand/shallow";
import { useWindowSize } from "../../hooks/useWindowSize";
import { useUser } from "../../store";
import { Helper } from "../../utility/Helper";
import ProfileMenuAvatar from "../Profile/ProfileMenuAvatar";
import { MenuList } from "../menuList";


interface MenuListProps {
  hasOrder: boolean;
}
export default function ProfileMenu({ hasOrder }: MenuListProps) {

  const helper = new Helper();
  // const mobileScreen =helper.isMobileCheck2();
  const [mobileScreen, setMobileScreen] = React.useState(
    helper.isMobileCheck2()
  );
  const [anchorEl, setAnchorEl] = React.useState<
    HTMLButtonElement | HTMLDivElement | null
  >(null);
  const [profileImage] = useUser(
    (state) => [state.currentUser?.profileImage],
    shallow
  );
  const [openDialog, setOpenDialog] = React.useState(false);

  const [size] = useWindowSize();

  const handleClick = (
    event: React.MouseEvent<HTMLButtonElement | HTMLDivElement | null>
  ) => {
    if (mobileScreen) {
      setOpenDialog(true);
    } else {
      setAnchorEl(event.currentTarget);
    }
  };
  const handleChildClose = () => {
    handleClose();
    handleCloseDialog();
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;


  React.useEffect(() => {
    if (mobileScreen) {
      if (anchorEl) {
        setOpenDialog(true);
      }
      setAnchorEl(null);
    } else {
      if (openDialog) {
        setOpenDialog(false);
      }
    }
    // eslint-disable-next-line
  }, [mobileScreen]);

  React.useEffect(() => {
    if (size.width < 431) {
      setMobileScreen(true);
    } else {
      setMobileScreen(false);
    }
  }, [size.width]);

  return (
    <div>
      {mobileScreen || size.width < 426 ? (
        openDialog ? <IconButton
        sx={{width: 48, height: 48}}
        color="inherit"
        onClick={handleCloseDialog}
      >
        <CloseIcon />
      </IconButton> : <IconButton
          sx={{ width: 48, height: 48 }}
          onClick={handleClick}
          size="large"
          color="inherit"
        >
          <img
            width={21}
            height={21}
            src="https://images.rentbabe.com/assets/mui/Menu.svg"
            alt=""
          ></img>
        </IconButton>
      ) : (
        <Box  
          marginLeft="10px"
          marginRight="16px" onClick={handleClick}>
          <ProfileMenuAvatar imgSrc={profileImage?.srcSetConvert()} />
        </Box>
      )}
      {/* if desktop or tablet */}
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        PaperProps={{
          className:"profile-menu-popover"
        }}
      >
          <MenuList hasOrder={hasOrder} handleClose={handleChildClose} />
      </Popover>

      <Menu 
        elevation={0}
        sx={{
          '& .MuiPaper-root': {
            left: "0px!important",
            right: "0px!important",
            top: "56px!important", 
            maxWidth: '100%',
            width: '100vw',
            borderRadius: "0px",

          },
          '& .MuiList-root' : {
            padding: "0px",
            borderRadius: "0px!important",
            boxShadow: "none"
          }
        }}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={openDialog} 
        PaperProps={{
          style: {
            width: '100vw', 
            maxWidth: '100%', 
            borderRadius: "0px!"
          },
        }}
        onClose={handleCloseDialog}>
        <Paper>
            <MenuList hasOrder={hasOrder} handleClose={handleChildClose} />
        </Paper>
      </Menu>
    </div>
  );
}
