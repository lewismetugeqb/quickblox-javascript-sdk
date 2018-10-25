import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import logo from './../../assets/img/qb-logo.svg';
import './App.css';

import Login from './../login/Login.jsx';

class App extends Component {
	render() {
    	return (
      		<div id="appPage">
        		<Route exact path="/" component={Login} />
        		<Route path="/login" component={Login} />
      		</div>
    	);
  	}
}

export default App;
