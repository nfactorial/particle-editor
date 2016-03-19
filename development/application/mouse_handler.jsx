"use strict";

/**
 * This mouse handler is used to replace the default
 * mouse handler in ngen. The default handler captures
 * input from the entire browser window (for games)
 * however we wish to only capture mouse input within
 * the preview window, so we must provide a custom one.
 */
export default class ReactMouseHandler extends GameSystem {
    constructor() {
        super();

        this.clientX = 0.0;
        this.clientY = 0.0;
        this.deltaX = 0.0;
        this.deltaY = 0.0;
        this.x = 0.0;
        this.y = 0.0;

        this.leftDown = false;
        this.rightDown = false;
        this.middleDown = false;
    }

    /**
     * Called each frame update by ngen allowing us to
     * perform any necessary processing.
     */
    onUpdate() {
        if ( this.eventReceived ) {
            this.deltaX = this.clientX - this.x;
            this.deltaY = this.clientY - this.y;
        } else {
            this.deltaX = 0.0;
            this.deltaY = 0.0;
        }

        this.x = this.clientX;
        this.y = this.clientY;
    }

    /**
     * Responds to the MouseUp React event.
     * @param e The details of the event supplied by React.
     */
    onMouseUp(e) {
        if ( e.button === 0 ) {
            this.leftDown = false;
        } else if ( e.button === 1 ) {
            this.middleDown = false;
        } else if ( e.button === 2 ) {
            this.rightDown = false;
        }
    }

    /**
     * Responds to the MouseUp React event.
     * @param e The details of the event supplied by React.
     */
    onMouseDown(e) {
        if ( e.button === 0 ) {
            this.leftDown = true;
        } else if ( e.button === 1 ) {
            this.middleDown = true;
        } else if ( e.button === 2 ) {
            this.rightDown = true;
        }
    }

    /**
     * Called when the user moves the mouse cursor over our 3D element.
     * @param e The details of the event supplied by React.
     */
    onMouseMove(e) {
        this.eventReceived = true;

        this.clientX = e.clientX;
        this.clientY = e.clientY;
    }

    /**
     * Retrieves the distance (in pixels) the mouse has moved this update.
     * @returns {number|*} The number of pixels the mouse has moved along the horizontal axis.
     */
    getDeltaX() {
        return this.deltaX;
    }


    /**
     * Retrieves the distance (in pixels) the mouse has moved this update.
     * @returns {number|*} The number of pixels the mouse has moved along the vertical axis.
     */
    getDeltaY() {
        return this.deltaY;
    }

    /**
     * Determines whether or not a specific mouse mouse is currently pressed.
     * @param mouseButton The mouse button to be checked.
     * @returns {boolean} True if the mouse button is considered pressed otherwise false.
     */
    isPressed(mouseButton) {
        switch ( mouseButton ) {
            case MouseHandler.LeftButton:
                return this.leftDown;

            case MouseHandler.RightButton:
                return this.rightDown;

            case MouseHandler.MiddleButton:
                return this.middleDown;
        }

        return false;
    }
}

MouseHandler.LeftButton = 0;
MouseHandler.MiddleButton = 1;
MouseHandler.RightButton = 2;

// Register ourselves with NGEN so we can be created.
NGEN.system( 'ReactMouseHandler', ReactMouseHandler );
