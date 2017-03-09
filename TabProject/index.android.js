/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  AppRegistry,
  AsyncStorage,
   View,
   Text,
   Image,
   StyleSheet,
   Dimensions,
} from 'react-native';
import {Scene, Router} from 'react-native-router-flux';
import {Home, Login} from './src/pages';
import renderIf from './src/pages/renderIf';

var ISLOGIN_KEY = 'ISLOGIN_KEY';

const window = Dimensions.get('window');

class TabProject extends Component{

  constructor(props) {
    super(props);
    this.state = {
      loginEnable: false,
       loading: true,
    }
  }

   componentDidMount() {
     AsyncStorage.getItem(ISLOGIN_KEY).then((value) => {

      setTimeout (() => {
           if(value == 'YES'){
           this.setState({
                loginEnable: true,
                 loading: false,
            });
            }else{
                this.setState({
                      loading: false,
                  });
            }
        }, 3000);
      
    });
  }

  render() {
      if (this.state.loading) {
        return  <View style={{flex: 1, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center'}}>
                    <Image style={{position: 'absolute', left: 0, top: 0, width: window.width, height: window.height}} source={require('./image/splash_screen.png')}></Image>
                </View>;
      }
      return (
               <Router>
                    <Scene key="home" component={Home} initial={this.state.loginEnable} hideNavBar/>
                    <Scene key="login" component={Login} initial={!this.state.loginEnable} hideNavBar/>
               </Router>
              );
       }
}

AppRegistry.registerComponent('TabProject', () => TabProject);
