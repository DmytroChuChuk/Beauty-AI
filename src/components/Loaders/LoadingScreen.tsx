import { CircularProgress } from '@mui/material';
import { FC } from 'react';
import './LoadingScreen.scss'

const LoadingScreen: FC = () => {

    return <div className="loading-div">
      {/* <img width={100} height={100} loading = "lazy" src="assets/gif/loading_dots.gif" alt="rentbabe loading"/> */}
      <CircularProgress color='secondary' />
  </div> 
}

export default LoadingScreen