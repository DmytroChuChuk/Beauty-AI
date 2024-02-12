import { Link } from "@mui/material";
import React from "react";
import { FacebookIcon, InstagramIcon, TiktokIcon } from "../icons/materialUiSvg";
import "./SocialMedias.scss";

const SocialMedias: React.FC = () => {
  return (
    <div className="social-media-div">
      {/* <a
        href="https://www.facebook.com/RentBabe"
        target="_blank"
        rel="noreferrer"
      >
        <img width={21} height={21} src={FBLogo} alt="" />
      </a> */}
       <Link
        href="https://www.facebook.com/RentBabe"
        target="_blank"
        // rel="noreferrer"
      >
        <FacebookIcon  />
      </Link>
      <Link
        href="https://www.instagram.com/rentbabesg"
        target="_blank"
        // rel="noreferrer"
      >
        <InstagramIcon  />
      </Link>
      
      <Link
        href="https://www.instagram.com/rentbabesg"
        target="_blank"
        // rel="noreferrer"
      >
        <TiktokIcon  />
      </Link>
    </div>
  );
};

export default SocialMedias;
