// frontend/src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './store/store'; // Import the Redux store
import Home from './views/Home';
import Dashboard from './views/Dashboard';
import Settings from './views/Settings';
import Analytics from './views/Analytics';
import './styles.css'; // Import global styles

const App = () => {
    return (
        <Provider store={store}>
            <Router>
                <Switch>
                    <Route path="/" exact component={Home} />
                    <Route path="/dashboard" component={Dashboard} />
                    <Route path="/settings" component={Settings} />
                    <Route path="/analytics" component={Analytics} />
                    {/* Add more routes as needed */}
                </Switch>
            </Router>
        </Provider>
    );
};

export default App;
