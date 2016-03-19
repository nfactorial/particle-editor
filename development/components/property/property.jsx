"use strict";

import React from 'react';


export default class Property extends React.Component {
    /**
     * Returns the child element to be presented to the user.
     * @returns {XML} The child element that represents our current state.
     */
    render() {
        return ( <p>{this.props.name}</p> );
    }
}
