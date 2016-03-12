"use strict";

/**
 * This component manages the upper section of the applications main view.
 * The upper area contains the 3D preview window along with the asset inspector.
 */
var AssetNavigator = React.createClass({
    getInitialState: function() {
        return { height: 200 };
    },
    render: function() {
        var style = {
            height: this.state.height + 'px'
        };

        return (
            <div className="particle-explorer" style={style}>
                <PreviewContainer title="Preview" className="preview-panel"/>
                <EmitterExplorer data={this.props.data} className="emitter-panel"/>
            </div>
        );
    }
});


