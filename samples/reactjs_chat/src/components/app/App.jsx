import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import QB from "quickblox/quickblox.min.js";

import Login from './../login/Login.jsx';
import Dashboard from './../dashboard/Dashboard.jsx';

import { QBconfig } from "./../../QBconfig.json";

class App extends Component {
	constructor() {
		super();
		this.init(QBconfig);
	}

	init(config) {
    	// Step 1. QB SDK initialization.
    	QB.init(config.credentials.appId, config.credentials.authKey, config.credentials.authSecret, config.appConfig);
	}

	render() {
    	return (
      		<div id="appPage">
        		<Route exact path="/" component={Login} />
        		<Route path="/login" component={Login} />
				<Route path="/dashboard" component={Dashboard} />
      		</div>
    	);
  	}
}

export default App;
