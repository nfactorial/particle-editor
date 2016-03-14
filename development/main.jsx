import ReactDOM from 'react-dom';
import Fluxible from 'fluxible';

import Application from './application/application.jsx';

var app = new Fluxible({

});

ReactDOM.render(
    <Application/>,
    document.getElementById('example')
);
