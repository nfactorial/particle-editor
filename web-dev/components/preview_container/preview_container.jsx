"use strict";

/**
 * This component is used for a UI element that encompasses the 3D preview.
 * We augment the 3D view with a head along with some extra controls.
 */
var PreviewContainer = React.createClass({
    getInitialState: function() {
        return { width: 200 };
    },
    render: function() {
        var style = {
            width: this.state.width + 'px'
        };

        return (
            <div className={this.props.className} style={style}>
                <p className="section-header">{this.props.title}
                    <ToolGlyphIcon icon="glyphicon-fullscreen"/>
                </p>
                <PreviewWindow/>
            </div>
        );
    }
});
