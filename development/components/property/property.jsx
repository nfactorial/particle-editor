"use strict";

import React from 'react';

require('./property.sass');


export default class Property extends React.Component {
    constructor(props) {
        super(props);

        // TODO: The value should be managed by the application rather than directly in here.
        //       Use a change event, so we can listen to external changes as well as internal.
        this.state = { value: props.data.value };
    }
/*
<span className="property-scalar-container">
<span>{this.props.data.value}</span>
<span className="pull-right glyphicon mouse-highlight glyphicon-resize-vertical property-icon" />
</span>
*/
    /**
     * Callback invoked by React when the numeric value has been changed.
     * @param e Event information about the change.
     */
    onChange(e) {
        this.setState({ value: e.target.value });
    }

    /**
     * Renders the HTML elements that will represent a slider control for a scalar value.
     * @returns {XML} The HTML data for the slider control.
     */
    renderScalar() {
        return (
            <div className="property-scalar" data-slider>
                <span className="property-label">{this.props.data.name}</span>
                <input type="number"
                       className="property-scalar-container"
                       min={this.props.data.minimum}
                       max={this.props.data.maximum}
                       value={this.state.value}
                       onChange={this.onChange.bind(this)}
                >
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
