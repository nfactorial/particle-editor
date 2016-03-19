"use strict";

import React from 'react';

import ToolGlyphIcon from '../tool_glyph_icon/tool_glyph_icon.jsx';
import PreviewWindow from '../preview_window/preview_window.jsx';

require('./preview_container.sass');


/**
 * This component is used for a UI element that encompasses the 3D preview.
 * We augment the 3D view with a head along with some extra controls.
 */
export default class PreviewContainer extends React.Component {
    constructor(props) {
        super(props);

        this.state = { width: 200 };
    }

    /**
     * Returns the child element to be presented to the user.
     * @returns {XML} The child element that represents our current state.
     */
    render() {
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
}
