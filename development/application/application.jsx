"use strict";

import React from 'react';

import MouseHandler from './mouse_handler.jsx';
import AssetNavigator from '../views/asset_navigator/asset_navigator.jsx';
import PropertyExplorer from '../components/property_explorer/property_explorer.jsx';

import { testEmitters, selectedEmitter, selectedModule } from './test_data.jsx';

require('./application.sass');


/**
 * Main view into the editing application.
 */
export default class Application extends React.Component {
    /**
     * Returns the child element to be presented to the user.
     * @returns {XML} The child element that represents our current state.
     */
    render() {
        return (
            <div>
                <AssetNavigator data={testEmitters}/>
                <PropertyExplorer data={selectedModule} />
            </div>
        );
    }
}
