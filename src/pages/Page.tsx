import { FC } from 'react';
import { useParams } from 'react-router';
import MyAppBar from '../components/MyAppBar';
import { pages as pagesEnum } from './ExploreContainer';
import ExploreContainer from './ExploreContainer';
import { DocumentData, DocumentSnapshot } from 'firebase/firestore';

interface PageProps {
    loading: boolean
    error: boolean
    userData: DocumentSnapshot<DocumentData> | undefined
}

const Page: FC<PageProps> = ({
    loading, error, userData
}) => {

  const { name } = useParams<{ name: string; }>()

  return <div>   
        <div hidden= {name.toLowerCase() === pagesEnum.profile.valueOf() || name.toLowerCase() === pagesEnum.chatbox.valueOf()}>
            <MyAppBar/>
        </div>
        
        <ExploreContainer 
            name={name.toLowerCase()}
            loading={loading}
            error={error}
            userData={userData}
        />
    </div>

};

export default Page;
