"use strict";

import React from 'react';

import {createRenderer} from 'react-addons-test-utils';

import ToolGlyphIcon from '../../../../development/components/tool_glyph_icon/tool_glyph_icon.jsx';

var chai = require('chai');
var expect = chai.expect;


describe('components/tool_glyph_icon', () => {
    it('Renders correctly', () => {
        const renderer = createRenderer();
        renderer.render(<ToolGlyphIcon/>);
        let result = renderer.getRenderOutput();

        expect(result.type).to.equal('span');
    });
});
