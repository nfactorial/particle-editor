"use strict";

/**
 * This component allows the user to explore the emitters contained within the
 * current particle effect being edited.
 * As the user selects child elements, the lower view is updated to allow
 * inspection of the selected items properties.
 */
var EmitterExplorer = React.createClass({
    render: function() {
        var className = "panel " + this.props.className;
        var elements = this.props.data.map(e => {
            return (
                <Emitter key={e.name} data={e} />
            );
        });

        return (
            <div className={className}>
                <p className="section-header">Emitters</p>
                {elements}
            </div>
        );
    }
});
