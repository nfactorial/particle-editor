"use strict";

import React from 'react';
import ToolGlyphIcon from '../tool_glyph_icon/tool_glyph_icon.jsx'

require('./property.sass');


export default class Property extends React.Component {
/*
<span className="property-scalar-container">
<span>{this.props.data.value}</span>
<span className="pull-right glyphicon mouse-highlight glyphicon-resize-vertical property-icon" />
</span>
*/
    /**
     * Renders the HTML elements that will represent a slider control for a scalar value.
     * @returns {XML} The HTML data for the slider control.
     */
    renderScalar() {
        return (
            <div className="property-scalar" data-slider>
                <span className="property-label">{this.props.data.name}</span>
                <input className="property-scalar-container" >
                    <span className="pull-right glyphicon glyphicon-resize-vertical property-icon" />
                </input>
            </div>
        );
    }

    /**
     * Returns the child element to be presented to the user.
     * @returns {XML} The child element that represents our current state.
     */
    render() {
        switch ( this.props.data.type ) {
            case 'scalar':
                return this.renderScalar();

            default:
                return ( <p>Unknown type {this.props.data.type}</p>)
        }
    }
}
