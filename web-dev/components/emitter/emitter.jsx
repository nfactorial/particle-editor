"use strict";

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
