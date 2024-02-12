import { Box } from "@mui/material";
import { FC } from "react";
import { IntroImage } from "../../../data/images";

interface props {
}

const IntroImageBox: FC<props> = () => {

  return (
   <Box marginLeft={20}>
   <img  src={IntroImage}  alt="fireSpot"/>

   </Box>

  );
};

export default IntroImageBox;
