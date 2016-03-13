"use strict";

import React from 'react';

import ToolGlyphIcon from '../tool_glyph_icon/tool_glyph_icon.jsx';
import PreviewWindow from '../preview_window/preview_window.jsx';


/**
 * This component is used for a UI element that encompasses the 3D preview.
 * We augment the 3D view with a head along with some extra controls.
 */
export default React.createClass({
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
