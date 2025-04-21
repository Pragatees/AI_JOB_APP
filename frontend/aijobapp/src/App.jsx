import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import Start from './components/pages/startpage';
import Login from './components/pages/login';
import Signup from './components/pages/signup';
import Job from './components/pages/job';
import Search from './components/pages/jobserach';
import AI from './components/pages/aires';
import Skills from './components/pages/myskills';

const App = () => {
  return (
    <Router>
      <Switch>
        <Route exact path="/" component={Start} />
        <Route path="/login" component={Login} />
        <Route path="/signup" component={Signup} />
        <Route path="/job" component={Job} />
        <Route path="/search" component={Search} />
        <Route path="/res" component={AI} />
        <Route path="/ski" component={Skills} />
      </Switch>
    </Router>
  );
};

export default App;
