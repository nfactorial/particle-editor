"use strict";

import React from 'react';

import PreviewContainer from '../../components/preview_container/preview_container.jsx';
import EmitterExplorer from '../../components/emitter_explorer/emitter_explorer.jsx';

require('./asset_navigator.sass');


/**
 * This component manages the upper section of the applications main view.
 * The upper area contains the 3D preview window along with the asset inspector.
 */
export default class AssetNavigator extends React.Component {
    constructor(props) {
        super(props);

        this.state = { height: 200 };
    }

    /**
     * Returns the child element to be presented to the user.
     * @returns {XML} The child element that represents our current state.
     */
    render() {
        // We use a state variable for the height, as the intent is to allow the
        // user to resize the pane dynamically in the future.
        var style = {
            height: this.state.height + 'px'
        };

        return (
            <div className="particle-explorer" style={style}>
                <PreviewContainer title="Preview" className="preview-panel"/>
                <EmitterExplorer data={this.props.data} />
            </div>
        );
    }
}
