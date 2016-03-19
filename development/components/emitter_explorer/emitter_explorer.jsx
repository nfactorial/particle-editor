"use strict";

import React from 'react'
import Emitter from '../emitter/emitter.jsx'

require('./emitter_explorer.sass');
require('../section_header/section_header.jsx');


/**
 * This component allows the user to explore the emitters contained within the
 * current particle effect being edited.
 * As the user selects child elements, the lower view is updated to allow
 * inspection of the selected items properties.
 */
export default class EmitterExplorer extends React.Component {
    constructor(props) {
        super(props);

        this.state = { width: 0, emitterWidth: 300 };
    }

    /**
     * Returns the child element to be presented to the user.
     * @returns {XML} The child element that represents our current state.
     */
    render() {
        var containerWidth = ( this.state.emitterWidth * this.props.data.length );
        var containerStyle = { width: containerWidth + "px" };

        var elements = this.props.data.map(e => {
            return (
                <Emitter key={e.name} data={e} />
            );
        });

        return (
            <div className="emitter-panel">
                <p className="section-header">Emitters</p>
                <div className="emitter-container" style={containerStyle}>
                    {elements}
                </div>
            </div>
        );
    }
}
