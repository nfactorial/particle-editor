"use strict";

require('./emitter.sass');

import React from 'react';
import EmitterModule from '../emitter_module/emitter_module.jsx';


/**
 * Display the high-level information of an emitter within the current particle system.
 * A particle system may contain one or more emitters, an emitter spawns particles
 * during the systems lifetime. The rate at which the particles spawn is controlled
 * from various attributes within each emitter.
 *
 * This component display all the separate emitters to the user, when the user
 * selects an element for editing, the user-interface will be updated to display
 * the elements properties.
 */
export default class Emitter extends React.Component {
    constructor(props) {
        super(props);

        this.state = { isChecked: this.props.checked || true };
    }

    /**
     * Called when a checkbox has changed its state.
     * @param e
     */
    onChange(e) {
        this.setState({ isChecked: e.target.checked });
    }

    /**
     * Returns the child element to be presented to the user.
     * @returns {XML} The child element that represents our current state.
     */
    render() {
        let propertyElements = [];
        const header = this.props.data !== undefined ? this.props.data.name || '' : '';

        if ( this.props.data && this.props.data.modules ) {
            propertyElements = this.props.data.modules.map( e => {
                return (
                    <EmitterModule module={e} />
                );
            });
        }

        return (
            <div className="emitter">
                <p className="section-header">{header}</p>
                <ul className="list-inline">{propertyElements}</ul>
            </div>
        );
    }
}
