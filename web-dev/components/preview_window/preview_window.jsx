"use strict";

var appRenderer = null;

/**
 * This component implements a 3D view into the current scene being edited.
 */
var PreviewWindow = React.createClass({
    onClick: function(event) {
        event.stopPropagation();
        event.preventDefault();

        return false;
    },
    onMouseMove: function(event) {
        event.stopPropagation();
        event.preventDefault();

        return false;
    },
    componentDidMount: function() {
        if ( !appRenderer ) {
            appRenderer = new RendererService(this._canvas);
        }
        this._displayPort = appRenderer.createDisplayPort();

        NGEN.renderer.setClearColor( 0x90909090, 1.0 );
    },
    render: function() {
        return ( <div onClick={this.onClick} onMouseMove={this.onMouseMove} className="preview-window" ref={(c) => this._canvas = c} ></div> );
    }
});
