import './App.css';
import React, { Component }  from 'react';
import {BrowserRouter, Route, Switch} from "react-router-dom";
import {Login} from "./components/login";
import {Admin} from "./components/admin";
import {Brocker} from "./components/brocker";


class NotFound extends Component {
  render() {
    return <h1> Name not found </h1>
  }
}

class App extends Component {
  render() {
    return(
        <BrowserRouter>
          <Switch>
            <Route exact path="/" component={Login}/>
            <Route path="/admin" component={Admin}/>
            <Route path="/brocker" component={Brocker}/>
            <Route component={NotFound}/>
          </Switch>
        </BrowserRouter>
    )
  }
}
export default App;
