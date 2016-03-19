"use strict";

import React from 'react';

require('./tool_glyph_icon.sass');


/**
 * Used to present a selectable tool icon to the user. The icon will highlight when the user
 * mouse-overs it.
 *
 * When using this component, you must supply the glyph-icon name using the icon property.
 * For example, to display the glyphicon-flag use the following markup:
 *
 * <ToolGlyphIcon icon="glyphicon-flag"/>
 */
export default class ToolGlyphIcon extends React.Component {
    /**
     * Returns the child element to be presented to the user.
     * @returns {XML} The child element that represents our current state.
     */
    render() {
        var className = "pull-right glyphicon mouse-highlight " + this.props.icon;
        return (
            <span className={className} />
        );
    }
}
