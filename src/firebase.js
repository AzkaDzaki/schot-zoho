import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import { ref, onUnmounted } from "vue";

const config = {
    apiKey: "AIzaSyBdN7U6NZl8LOEkPxUQix2r4mvy0R6DShc",
    authDomain: "schot-zoho.firebaseapp.com",
    projectId: "schot-zoho",
    storageBucket: "schot-zoho.appspot.com",
    messagingSenderId: "45161678443",
    appId: "1:45161678443:web:6203c9216aa263ee1d532e"
  };

  const firebaseapp = firebase.initializeApp(config)

  const db = firebaseapp.firestore()
  const documentsCollection = db.collection('documents')

  export const createDocuments = document => {
      return documentsCollection.add(document)
  }

  export const getDocument = async id => {
      const document = await documentsCollection.doc(id).get()
      return document.exists ? document.data() : null
  }

  export const updateDocument = (id, document) => {
      return documentsCollection.doc(id).update(document)
  }

  export const deleteDocument = id => {
      return documentsCollection.doc(id).delete()
  }

  export const useLoadDocuments = () => {
    const documents = ref([])
    const close = documentsCollection.onSnapshot(snapshot => {
      documents.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    })
    onUnmounted(close)
    return documents
    // const documents = ref([])
    // documentsCollection.onSnapshot((snapshotChange) => {
    //     snapshotChange.forEach((doc) => {
    //         documents.value.push({...doc.data()
    //         })
    //     });
    // })
    // return documents

    
  }