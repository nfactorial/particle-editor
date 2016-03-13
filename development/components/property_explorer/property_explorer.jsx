"use strict";

import Property from '../property/property.jsx';


/**
 * This component allows the user to edit the properties of an element
 * selected within the application.
 */
export default React.createClass({
    render: function() {
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
});
