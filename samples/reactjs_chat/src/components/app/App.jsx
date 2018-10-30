import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import QB from "quickblox/quickblox.min.js";

/** Importing QBconfig */
import { QBconfig } from "./../../QBconfig.json";

/** Importing components */
import Login from './../login/Login.jsx';
import Dashboard from './../dashboard/Dashboard.jsx';

class App extends Component {
	constructor() {
		super();
		this.getAppState = this.getAppState.bind(this);
		this.updateAppState = this.updateAppState.bind(this);
		this.state = {
			_config: QBconfig,
    		user: null,
    		token: null,
    		room: null,
    		//Elements
    		page: this,
    		sidebar: null,
    		content: null,
    		userListConteiner: null,
		};
		this.init(QBconfig);
	}

	init(config) {
    	// Step 1. QB SDK initialization.
    	QB.init(config.credentials.appId, config.credentials.authKey, config.credentials.authSecret, config.appConfig);
	}

	/** Method to expose a clone of the App current states to any component. */
	getAppState(){
		return {...this.state};
	}

	updateAppState(updateObj){
		this.setState(updateObj);
	}

	render() {
    	return (
      		<div id="appPage">
			  	{/** Was suppose to pass an arry but looks like programmatic navigation does now work */}
				<Route exact path="/" render={(props) => <Login {...props} updateAppState={this.updateAppState} getAppState={this.getAppState} />}  />
        		<Route exact path="/login" render={(props) => <Login {...props} updateAppState={this.updateAppState} getAppState={this.getAppState} />}  />
				<Route path="/dashboard" render={(props) => <Dashboard {...props} updateAppState={this.updateAppState} getAppState={this.getAppState} />} />
      		</div>
    	);
  	}
}

export default App;
