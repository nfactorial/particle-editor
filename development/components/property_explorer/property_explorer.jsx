"use strict";

import Property from '../property/property.jsx';

require('./property_explorer.sass');


/**
 * This component allows the user to edit the properties of an element
 * selected within the application.
 */
export default class PropertyExplorer extends React.Component {
    /**
     * Returns the child element to be presented to the user.
     * @returns {XML} The child element that represents our current state.
     */
    render() {
        var elements = this.props.data.properties.map(e => {
            return (
                <Property key={e.name} name={e.name} />
            );
        });

        return (
            <div className="property-explorer">
                <p className="section-header">Properties</p>
                {elements}
            </div>
        );
    }
}
