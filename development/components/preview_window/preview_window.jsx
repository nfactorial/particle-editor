"use strict";

import React from 'react'

// May be better if the renderer exists within our local folder.
import RendererService from '../../renderer/renderer.jsx'

require('./preview_window.sass');

var appRenderer = null;
var mouseHandler = null;


/**
 * A 3D view into the current scene being edited.
 * Also forwards the users input within the control to the input manager.
 * This class overrides the default mouse input handling for the element
 * and forwards it onto the mouse handler registered within ngen.
 */
export default class PreviewWindow extends React.Component {
    constructor(props) {
        super(props);

        this._displayPort = null;
    }

    /**
     * Event handler invoked when the user clicks on our component.
     * @param event
     * @returns {boolean}
     */
    onClick(event) {
        event.stopPropagation();
        event.preventDefault();

        return false;
    }

    /**
     * Event handler invoked when the user presses a mouse button.
     * @param event
     * @returns {boolean}
     */
    onMouseDown(event) {
        event.stopPropagation();
        event.preventDefault();

        if ( this._displayPort && mouseHandler ) {
            mouseHandler.onMouseDown(event);
        }

        return false;
    }

    /**
     * Event handler invoked when the user releases a mouse button.
     * @param event
     * @returns {boolean}
     */
    onMouseUp(event) {
        event.stopPropagation();
        event.preventDefault();

        if ( this._displayPort && mouseHandler ) {
            mouseHandler.onMouseUp(event);
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

        if ( this._displayPort && mouseHandler ) {
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
            mouseHandler = NGEN.stateTree.findSystem('MouseHandler').instance;
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
        return ( <div onClick={this.onClick.bind(this)}
                      onMouseUp={this.onMouseUp.bind(this)}
                      onMouseDown={this.onMouseDown.bind(this)}
                      onMouseMove={this.onMouseMove.bind(this)}
                      className="preview-window"
                      ref={(c) => this._canvas = c} >
                </div>
        );
    }
}
