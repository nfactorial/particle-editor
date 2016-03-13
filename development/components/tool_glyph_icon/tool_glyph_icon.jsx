"use strict";

import React from 'react';


/**
 * Used to present a selectable tool icon to the user. The icon will highlight when the user
 * mouse-overs it.
 *
 * When using this component, you must supply the glyph-icon name using the icon property.
 * For example, to display the glyphicon-flag use the following markup:
 *
 * <ToolGlyphIcon icon="glyphicon-flag"/>
 */
export default React.createClass({
    render: function() {
        var className = "pull-right glyphicon mouse-highlight " + this.props.icon;
        return (
            <span className={className} />
        );
    }
});
