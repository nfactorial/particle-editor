"use strict";

import React from 'react'

// May be better if the renderer exists within our local folder.
import RendererService from '../../renderer/renderer.jsx'

require('./preview_window.sass');

var appRenderer = null;


/**
 * A 3D view into the current scene being edited.
 * Also forwards the users input within the control to the input manager.
 */
export default class PreviewWindow extends React.Component {
    /**
     * Event handler invoked when the user clicks on our component.
     * @param event
     * @returns {boolean}
     */
    onClick(event) {
        event.stopPropagation();
        event.preventDefault();

        if ( this._displayPort ) {
            mouseHandler.onMouseDown( event );
        }

        return false;
    }

    /**
     * Event handler invoked when the user moves the mouse cursor within our bounds.
     * @param event
     * @returns {boolean}
     */
    onMouseMove(event) {
        event.stopPropagation();
        event.preventDefault();

        if ( this._displayPort ) {
            mouseHandler.onMouseMove( event );
        }

        return false;
    }

    /**
     * Event handler invoked when the user wishes to view our components context menu.
     * @param event
     * @returns {boolean}
     */
    onContextMenu(event) {
        return false;
    }

    /**
     * Invoked by React immediately after the initial rendering.
     * https://facebook.github.io/react/docs/component-specs.html
     */
    componentDidMount() {
        if ( !appRenderer ) {
            appRenderer = new RendererService(this._canvas);
        }
        this._displayPort = appRenderer.createDisplayPort();

        NGEN.renderer.setClearColor( 0x90909090, 1.0 );
    }

    /**
     * Invoked by React immediately before the component is removed from the DOM.
     * https://facebook.github.io/react/docs/component-specs.html
     */
    componentWillUnmount() {
        // TODO: Close our display port here
    }

    /**
     * Returns the child element to be presented to the user.
     * @returns {XML} The child element that represents our current state.
     */
    render() {
        return ( <div onClick={this.onClick} onMouseMove={this.onMouseMove} className="preview-window" ref={(c) => this._canvas = c} ></div> );
    }
}
