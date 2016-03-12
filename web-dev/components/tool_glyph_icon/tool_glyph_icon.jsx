"use strict";

/**
 * Used to present a selectable tool icon to the user. The icon will highlight when the user
 * mouse-overs it.
 */
var ToolGlyphIcon = React.createClass({
    render: function() {
        var className = "pull-right glyphicon mouse-highlight " + this.props.icon;
        return (
            <span className={className} />
        );
    }
});
