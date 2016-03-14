"use strict";

import React from 'react'

import AssetNavigator from '../views/asset_navigator/asset_navigator.jsx'
import PropertyExplorer from '../components/property_explorer/property_explorer.jsx'

import { testEmitters, selectedElement } from './test_data.jsx'


/**
 * Main view into the editing application.
 */
export default React.createClass({
    render: function() {
        return (
            <div>
                <AssetNavigator data={testEmitters}/>
                <PropertyExplorer data={selectedElement} />
            </div>
        );
    }
});
