"use strict";

/**
 * This component allows the user to edit the properties of an element
 * selected within the application.
 */
var PropertyExplorer = React.createClass({
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
