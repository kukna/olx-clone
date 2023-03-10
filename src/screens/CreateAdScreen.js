import React, {useState} from 'react';
import {View, Text, StyleSheet, Alert} from 'react-native';
import {TextInput, Button} from 'react-native-paper';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import storage from '@react-native-firebase/storage';
import { send } from 'process';
import { METHODS } from 'http';
const CreateAdScreen = () => {
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [year, setYear] = useState('');
  const [price, setPrice] = useState('');
  const [phone, setPhone] = useState('');
  const [image, setImage] = useState('');

  const sendNoti=()=>{
    firestore().collection('usertoken').get().then(querysnap=>{
      const userDeviceToken=querysnap.docs.map(docsnap=>{
        return docsnap.data().token
      })
      console.log(userDeviceToken)
      fetch('https://394a-2402-e280-231a-6ef-30f8-adf5-8aea-a918.ngrok.io/send-noti',{
      method:'post',
      headers:{
        'content-Type':'application/json'
      },
      body:JSON.stringify({
        tokens:userDeviceToken
      })
    })
    })
  }

  const postData = async () => {
    try {
      await firestore().collection('ads').add({
        name,
        desc,
        year,
        price,
        phone,
        image,
        uid: auth().currentUser.uid,
      });
      Alert.alert('posted you Ad!');
      setName('')
      setDesc('')
      setYear('')
      setPrice('')
      setPhone('')
      setImage('')
    } catch (err) {
      Alert.alert('something went wrong.try again');
    }
    sendNoti()
  };

  const openCamera = () => {
    launchImageLibrary({quality: 0.5}, fileobj => {
      console.log(fileobj.uri);
      if (fileobj.errorCode || fileobj.didCancel) {
        return console.log('You should handle errors or user cancellation!');
      }
      const img = fileobj.assets[0].uri;
      const uploadTask = storage()
        .ref()
        .child(`/items/${Date.now()}`)
        .putFile(img);
      uploadTask.on(
        'state_changed',
        snapshot => {
          var progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if (progress == 100) {
            alert('uploaded');
          }
        },
        error => {
          alert('something went wrong');
        },
        () => {
          // Handle successful uploads on complete
          // For instance, get the download URL: https://firebasestorage.googleapis.com/...
          uploadTask.snapshot.ref.getDownloadURL().then(downloadURL => {
            setImage(downloadURL);
          });
        },
      );
    });
  };
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Create Ad!</Text>
      <TextInput
        label="Ad title"
        value={name}
        mode="outlined"
        onChangeText={text => setName(text)}
      />
      <TextInput
        label="Describe what you are selling"
        value={desc}
        mode="outlined"
        numberOfLines={3}
        multiline={true}
        onChangeText={text => setDesc(text)}
      />
      <TextInput
        label="year of purchase"
        value={year}
        mode="outlined"
        keyboardType="numeric"
        onChangeText={text => setYear(text)}
      />
      <TextInput
        label="price in INR"
        value={price}
        mode="outlined"
        keyboardType="numeric"
        onChangeText={text => setPrice(text)}
      />
      <TextInput
        label="Your contact Number"
        value={phone}
        mode="outlined"
        keyboardType="numeric"
        onChangeText={text => setPhone(text)}
      />

      <Button icon="camera" mode="contained" onPress={() => openCamera()}>
        upload Image
      </Button>
      <Button
        disabled={image ? false : true}
        mode="contained"
        onPress={() => postData()}>
        Post
      </Button>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: 30,
    justifyContent: 'space-evenly',
  },
  text: {
    fontSize: 22,
    textAlign: 'center',
    color: 'black',
  },
});

export default CreateAdScreen;
