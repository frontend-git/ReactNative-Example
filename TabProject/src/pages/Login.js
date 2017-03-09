import React, { Component } from 'react';
import {
  AsyncStorage,
  StyleSheet,
  Text,
  View,
  TouchableHighlight,
  Alert,
  ActivityIndicator,Platform,BackAndroid,
} from 'react-native';

var _ = require('lodash');

import {Actions, ActionConst} from 'react-native-router-flux';

import renderIf from './renderIf';

var t = require('tcomb-form-native');

var STORAGE_KEY = 'id_token';

var ISLOGIN_KEY = 'ISLOGIN_KEY';

var Form = t.form.Form;

var Person = t.struct({
  email: t.String,
  password: t.String
});

const stylesheet = _.cloneDeep(t.form.Form.stylesheet);

stylesheet.textbox.normal.borderWidth = 0;
stylesheet.textbox.error.borderWidth = 0;
stylesheet.textbox.normal.marginBottom = 0;
stylesheet.textbox.error.marginBottom = 0;

stylesheet.textboxView.normal.borderWidth = 0;
stylesheet.textboxView.error.borderWidth = 0;
stylesheet.textboxView.normal.borderRadius = 0;
stylesheet.textboxView.error.borderRadius = 0;
stylesheet.textboxView.normal.borderBottomWidth = 1;
stylesheet.textboxView.error.borderBottomWidth = 1;
stylesheet.textbox.normal.marginBottom = 5;
stylesheet.textbox.error.marginBottom = 5;

const options = {
    stylesheet: stylesheet,
    auto: 'placeholders',
    fields: {
        password: {
          label: 'Password',
          password: true,
          secureTextEntry: true,
          error: 'Password length 6-20 characters, containing both a number and a capital letter.',
          placeholder: '*******',
          returnKeyType: 'next',
        },
        email: {
          label: 'Email',
          keyboardType: 'default', //'email-address'
          placeholder: 'example@example.io'
        },
    }
};

let listener = null

let backButtonPressFunction = () => true

export default class Login extends Component {

 constructor(props) {
    super(props);
    this.state = {
      loaded: false,
    }
  }

  componentDidMount() {
        if (Platform.OS == "android" && listener == null) {
            listener = BackAndroid.addEventListener("hardwareBackPress", () => {
            return backButtonPressFunction()
            })
        }
    }

  async _onValueChange(item, selectedValue) {
    try {
      console.log('response object:',selectedValue)
      await AsyncStorage.setItem(item, selectedValue);
      await AsyncStorage.setItem(ISLOGIN_KEY, "YES");
    } catch (error) {
      console.log('AsyncStorage error: ' + error.message);
    }
  }
 

  _userLogin() {
    var value = this.refs.form.getValue();
    if (value) { // if validation fails, value will be null
       this.setState({
            loaded: true,
      });
      fetch(" https://i2x-challenge.herokuapp.com/core/login/", {
        method: "POST", 
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: value.email, 
          password: value.password, 
        })
      })
      .then((response) => response.json())
      .then((responseData) => {
        if(responseData.token != null){
            this._onValueChange(STORAGE_KEY, responseData.token)
            this.setState({
                loaded: false,
            });
            Actions.home();
        }
        else{
           this.setState({
                loaded: false,
            });

          Alert.alert(
            'Alert',
            "Please Enter Valid Email-Id & Password",
            [
              {text: 'OK', onPress: () => console.log('OK Pressed!')},
            ]
          )

        }
      })
      .done();
    } 
  }

  render() {

    return (
      <View style={styles.container}>
          <View style={styles.row}>
              <Text style={styles.title}>Login!</Text>
          </View>
          <View style={styles.row}>
              <Form
                ref="form"
                type={Person}
                options={options}
              />
          </View>
          <View style={styles.row}>
              <TouchableHighlight style={styles.button} onPress={this._userLogin.bind(this)} underlayColor='#99d9f4'>
                <Text style={styles.buttonText}>Login</Text>
              </TouchableHighlight>
          </View>
          {renderIf(this.state.loaded)(
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
}
 
var styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    marginTop: 50,
    padding: 20,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 30,
    alignSelf: 'center',
    marginBottom: 30
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
    marginBottom: 10,
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
  hidden: {
    width: 0,
    height: 0,
  },
});

