"use strict";

import React from 'react';


/**
 * An emitter module is a behaviour that is attached to an emitter.
 * Users may add or remove modules to an emitter in-order to control its behaviour
 * during the course of its lifetime.
 */
export default class EmitterModule extends React.Component {
    constructor(props) {
        super(props);

        this.state = { isChecked: this.props.module.enabled || true };
    }

    /**
     * Called when a checkbox has changed its state.
     * @param e
     */
    onChange(e) {
        // TODO: Apply to the module also
        this.setState({ isChecked: e.target.checked });
    }

    /**
     * Returns the child element to be presented to the user.
     * @returns {XML} The child element that represents our current state.
     */
    render() {
        return (
            <li key={this.props.module.name}>
                <input type="checkbox"
                       checked={this.state.isChecked}
                       onChange={this.onChange.bind(this)}
                       label={this.props.module.name}
                       />
                {this.props.module.name}
            </li>
        );
    }
}
