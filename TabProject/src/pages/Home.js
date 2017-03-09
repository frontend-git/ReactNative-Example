import React, { Component } from 'react';
import {
  AsyncStorage,
  StyleSheet,
  Text,
  View,
  TouchableHighlight,
  Alert,
  ActivityIndicator,
  Platform,BackAndroid,
} from 'react-native';

import StarRating from './StarRating';

import {Actions, ActionConst} from 'react-native-router-flux';

import GridView from 'react-native-grid-view'

var t = require('tcomb-form-native');

import renderIf from './renderIf';

var STORAGE_KEY = 'id_token';

var ISLOGIN_KEY = 'ISLOGIN_KEY';

var ITEMS_PER_ROW = 1;

let listener = null

let backButtonPressFunction = () => true

var toHHMMSS = (secs) => {
      var sec_num = parseInt(secs, 10)    
      var hours   = Math.floor(sec_num / 3600) % 24
      var minutes = Math.floor(sec_num / 60) % 60
      var seconds = sec_num % 60    
      return [hours,minutes,seconds]
          .map(v => v < 10 ? "0" + v : v)
          .filter((v,i) => v !== "00" || i > 0)
          .join(":")
}

var toDATEFORMAT = (date) => {
    var dateee = new Date(date);
    var wholeDate = dateee.getFullYear() + '-' + ('0' + (dateee.getMonth() + 1)).slice(-2) + '-' + ('0' + dateee.getDate()).slice(-2) + ' ' + ('0' + dateee.getHours()).slice(-2) + ':' + ('0' + dateee.getMinutes()).slice(-2);
    return wholeDate
}

export default class Home extends Component{

    constructor(props) {
    super(props);
    this.state = {
      dataSource: null,
      loaded: false,
      loading: true,
    }
  }

    componentDidMount() {
        if (Platform.OS == "android" && listener == null) {
            listener = BackAndroid.addEventListener("hardwareBackPress", () => {
            return backButtonPressFunction()
            })
        }
        console.disableYellowBox = true;
        this._getProtectedQuote();
    }

  async _onValueChange(item, selectedValue) {
    try {
      console.log('response object:',selectedValue)
      await AsyncStorage.setItem(item, selectedValue);
    } catch (error) {
      console.log('AsyncStorage error: ' + error.message);
    }
  }
 
  async _getProtectedQuote() {
    var DEMO_TOKEN = await AsyncStorage.getItem(STORAGE_KEY);
    fetch("https://i2x-challenge.herokuapp.com/ai/recording/list/", {
      method: "GET",
      headers: {
        'Authorization': 'JWT ' + DEMO_TOKEN
      }
    })
    .then((response) => response.json())
    .then((responseData) => {
      if(responseData.detail != null){
         this.setState({
            loading: false,
          });
        Alert.alert(
            'Error',
            responseData.details+" You have Login Again",
            [
              {text: 'OK', onPress: () => this._logoutUser()},
            ]
          )
      }else{
        console.log('recording object:',responseData)
        this.setState({
            dataSource: responseData.results,
            loaded: true,
            loading: false,
          });
      }
      })
    .done();
  }

  async _userLogout() {
    try {
       Alert.alert(
            'ALert',
            "Are you want to logout!",
            [
              {text: 'OK', onPress: () =>this._logoutUser() },
            ]
          )
     
    } catch (error) {
      console.log('AsyncStorage error: ' + error.message);
    }
  }

  async _logoutUser(){
     try {
          await AsyncStorage.removeItem(STORAGE_KEY);
          await AsyncStorage.setItem(ISLOGIN_KEY, "NO");
          Actions.login();
      } catch (error) {
      console.log('AsyncStorage error: ' + error.message);
    }
  }

  renderLoadingView() {
    return (
       <View style={{flex: 1, backgroundColor: '#000'}}>
            <View style={{backgroundColor: '#2D2D2D'}}>
                  <Text style={{margin: 15, fontSize: 20, color:'#fff', textAlign: 'center'}}>Home</Text>
                  <TouchableHighlight style={styles.button} underlayColor='#99d9f4'>
                      <Text style={styles.buttonText}>Logout</Text>
                  </TouchableHighlight>
            </View>
            {renderIf(this.state.loading)(
                  <View style={this.state.loaded ? styles.row : styles.hidden } >
                      <ActivityIndicator
                        style={styles.centering}
                        color="#48BBEC"
                        size="large"/>
                  </View>
            )}
	     </View>
    );
  }

  renderItem(item) {
      return (<TouchableHighlight underlayColor="#DADADA">
                  <View>
                    <DataItem item={item}/>
                  </View>
              </TouchableHighlight>);
    }
 
  render() {

    if (!this.state.loaded) {
      return this.renderLoadingView();
    }

    return (
        <View style={{flex: 1, backgroundColor: '#000'}}>
            <View style={{backgroundColor: '#2D2D2D'}}>
                <Text style={{margin: 15, fontSize: 20, color:'#fff', textAlign: 'center'}}>Home</Text>
                <TouchableHighlight style={styles.button} onPress={this._userLogout.bind(this)} underlayColor='#99d9f4'>
                    <Text style={styles.buttonText}>Logout</Text>
                </TouchableHighlight>
            </View>
            <GridView
              items={this.state.dataSource}
              itemsPerRow={ITEMS_PER_ROW}
              renderItem={this.renderItem.bind(this)}
              style={styles.listView}
            />
		    </View>
    );
  }
}
 
var styles = StyleSheet.create({
  movie: {
    height: 50,
    flex: 1,
    alignItems: 'center',
    flexDirection: 'column',
  },
  container: {
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2D2D2D',
  },
  listView: {
    backgroundColor: '#2D2D2D',
  },
  scripttitle: {
    fontSize: 20,
    alignSelf: 'center',
  },
  urlstyle: {
    fontSize: 15,
    alignSelf: 'center',
  },
  buttonText: {
    fontSize: 18,
    color: 'white',
    alignSelf: 'center'
  },
  button: {
    height: 36,
    backgroundColor: '#48BBEC',
    borderColor: '#48BBEC',
    borderWidth: 1,
    borderRadius: 8,
    margin:10,
    alignSelf: 'stretch',
    justifyContent: 'center'
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
    centering: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  gray: {
  	backgroundColor: '#cccccc',
  },
});

class DataItem extends Component {

  render() {
      return (
           <View style={[styles.row,{margin: 5, backgroundColor:'#D6DBDF',borderRadius: 3,}]}>
              <View style={{margin: 5}}>
                 <Text style={[styles.scripttitle]}numberOfLines={1}>{this.props.item['final_script']}</Text>
              </View>
              <View style={{margin: 5}}>
                 <Text style={[styles.urlstyle]}numberOfLines={1}>{this.props.item['url']}</Text>
              </View>
              <View style={{margin: 5,flexDirection: 'row'}}>
                  <View style={[styles.row,{flex: 0.5}]}>
                      <Text style={[styles.urlstyle]} >{toHHMMSS(this.props.item['duration'])+" minutes"}</Text>
                  </View>
                  <View style={{flex: 0.5}}>
                      <StarRating
                          maxStars={5}
                          rating={this.props.item['rating']}
                          selectStar={require('./select_star.png')}
                          unSelectStar={require('./unselect_star.png')}
                          starSize={20}
                          interitemSpacing={5}
                        />
                </View>
              </View>
              <View style={{margin: 5,flexDirection: 'row'}}>
                  <View style={[styles.row,{flex: 0.5}]}>
                     
                  </View>
                  <View style={{flex: 0.5}}>
                      <Text style={[styles.urlstyle]} >{toDATEFORMAT(this.props.item['created'])}</Text>
                </View>
              </View>
          </View>
      );
  }
}