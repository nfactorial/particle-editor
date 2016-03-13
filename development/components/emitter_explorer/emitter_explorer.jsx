"use strict";

import React from 'react'
import Emitter from '../emitter/emitter.jsx'


/**
 * This component allows the user to explore the emitters contained within the
 * current particle effect being edited.
 * As the user selects child elements, the lower view is updated to allow
 * inspection of the selected items properties.
 */
export default React.createClass({
    getInitialState: function() {
        return { width: 0, emitterWidth: 300 };
    },
    render: function() {
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
});
