import { QueryDocumentSnapshot, DocumentData, Timestamp, DocumentSnapshot} from "firebase/firestore"
import { ConversationInfo, user } from "../chats/shared/types"
import { users, sender, senderNickname, recipientNickname, updatedAt, lastMessage, senderProfileURL, 
    recipientProfileURL, senderLastSeen, recipientLastSeen, mobileUrl, nickname as nicknameKey, 
    info, hasOrder, orderTime, block, order} from "../keys/firestorekeys"
import { convo } from "../store"


export default class Conversation  {

    public convertDocToConvo(_doc: QueryDocumentSnapshot<DocumentData> | DocumentSnapshot<DocumentData> | undefined) : ConversationInfo | undefined {

        if(!_doc) return undefined

        const _users = _doc.get(users) as string[]
        const _sender = _doc.get(sender) as string
      
        const _senderNickname = _doc.get(senderNickname) as string
        const _recipientNickname = _doc.get(recipientNickname) as string
    
        const _updatedAt = _doc.get(updatedAt) as Timestamp
    
        const _lastMessage = _doc.get(lastMessage) as string
    
        const _info = _doc.get(info) as user

        const _hasOrder = _doc.get(hasOrder) as boolean
        const _orderTime = _doc.get(orderTime) as Timestamp | undefined
    
        const _senderProfileURL = _doc.get(senderProfileURL) as string
        const _recipientProfileURL = _doc.get(recipientProfileURL) as string
    
        const _senderLastSeen = _doc.get(senderLastSeen) as Timestamp
        const _recipientLastSeen = _doc.get(recipientLastSeen) as Timestamp
        const _block = _doc.get(block) as string[] | undefined
        const _order = _doc.get(order) as string[] | undefined
    
    
        const map : ConversationInfo = {
          id: _doc.id,
          hasOrder: _hasOrder,
          orderTime: _orderTime,
          order: _order,
          sender: _sender, 
          users: _users,
          info: _info,
          updatedAt: _updatedAt, lastMessage: _lastMessage,
          senderProfileURL: _senderProfileURL, recipientNickname: _recipientNickname,
          senderLastSeen: _senderLastSeen, recipientLastSeen: _recipientLastSeen,
          senderNickname: _senderNickname,
          recipientProfileURL: _recipientProfileURL,
          block: _block ?? []
        }
    
        return map
      }

    public getExistingConvo(currentConversation: convo, uid: string) : QueryDocumentSnapshot<DocumentData> | undefined {
      for (var index = 0; index < (currentConversation?.data?.docs?.length ?? 0) ; ++index) {
        const _doc = currentConversation?.data?.docs?.[index];
  
        if(_doc?.get(users).includes(uid)){
          return _doc
        }
      }
  
      return undefined
    }

    public getExistingConvoById(currentConversation: convo, id: string) : QueryDocumentSnapshot<DocumentData> | undefined {
      for (var index = 0; index < (currentConversation?.data?.docs?.length ?? 0) ; ++index) {
        const _doc = currentConversation?.data?.docs?.[index];
  
        if(_doc?.id === id){
          return _doc
        }
      }
  
      return undefined
    }

    public senderSendNewConversation (
        myUid: string, 
        recipientUid: string , 
        myNickname: string, 
        myProfileImage: string , 
        _recipientNickname:string , 
        _recipientProfileURL:string, 
        lastMsg : string) {
        
        // firestore map key is NOT equals to ConversationInfo
        var map: {[key:string]: any}  = 
            {
                [sender]: myUid,
                [users]:  [recipientUid , myUid],
                [lastMessage]: lastMsg,
                [info]: {
                    [myUid]: {
                        [nicknameKey]: myNickname.toLowerCase(),
                        [mobileUrl]: myProfileImage,
                        [info]: true
                    },
                    [recipientUid]: {
                        [nicknameKey]: _recipientNickname.toLowerCase(),
                        [mobileUrl]: _recipientProfileURL,
                        [info]: true
                    }
                },
                [senderProfileURL]: myProfileImage, 
                [recipientNickname]: _recipientNickname.toLowerCase(),
                [senderNickname]: myNickname.toLowerCase(),
                [recipientProfileURL]: _recipientProfileURL
            }
        return map
    }

    public getRecipientUID (myUID: string | null | undefined, conversation: ConversationInfo | undefined) : string | undefined{


      if(!myUID || !conversation) return undefined

      const users = conversation.users


      if (users.length > 1){

        const filterUser = conversation.users.filter(id => id !== myUID)

        if (filterUser.length === 1){

          const uid = filterUser[0]
          return uid

        }else{
          return undefined
        }
       
      }else{

        const info = conversation.info
        if (!info) return undefined

        const keys = Object.keys(info)

        if (keys.length > 0){

          const filterKeys = keys.filter(id => id !== myUID)

          if (filterKeys.length === 1) {
            return filterKeys[0]

          }else if (filterKeys.length > 1){

              let array : string[] = []
              for (const [key, value] of Object.entries(info)) {

                if(myUID === key) continue

                if(value.delo){
                  array.push(key)
                }

              }
              
              if(array.length === 1){
                return array[0]
              }

          }
          
          else{
            return undefined
          }
        
        }else return undefined

      }
     
    }

}

