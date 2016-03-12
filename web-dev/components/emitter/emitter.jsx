"use strict";

/**
 * Display the high-level information of an emitter within the current particle system.
 */
var Emitter = React.createClass({
    render: function() {
        var propertyElements = this.props.data.properties.map( e => {
            return (
                <li key={e.name}>
                    <input type="checkbox" autoComplete="off" checked="checked"/>
                    {e.name}
                </li>
            );
        });

        return (
            <div className="emitter">
                <p className="section-header">{this.props.data.name}</p>
                <ul className="list-inline">{propertyElements}</ul>
            </div>
        );
    }
});
