import React from 'react';
import ReactDOM from 'react-dom';
//import './index.css';
import Toolbox from './Toolbox';
import * as serviceWorker from './serviceWorker';

ReactDOM.render(<Toolbox />, document.getElementById('tool-box'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
