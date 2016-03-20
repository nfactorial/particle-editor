"use strict";

import React from 'react';
import TestUtils from 'react-addons-test-utils';

import PropertyExplorer from '../../../../development/components/property_explorer/property_explorer.jsx';
import Property from '../../../../development/components/property/property.jsx';

var chai = require('chai');
var expect = chai.expect;


describe('components/property_explorer', () => {
    it('Renders correctly with no properties.', () => {
        const renderer = TestUtils.createRenderer();
        renderer.render(<PropertyExplorer/>);
        let result = renderer.getRenderOutput();

        expect(result.type).to.equal('div');
        expect(result.props.children).to.deep.equal([
            <p className="section-header">Properties</p>,
            []
        ]);
    });

    it('Renders correctly with a single property', () => {
        const testName = 'test-name';
        const testProperty = { name: testName, type: 'scalar' };
        const testData = {
            properties: [
                testProperty
            ]
        };

        const renderer = TestUtils.createRenderer();
        renderer.render(<PropertyExplorer data={testData} />);

        let result = renderer.getRenderOutput();

        expect(result.props.children).to.deep.equal([
            <p className="section-header">Properties</p>,
            [<Property key={testName} data={testProperty} />]
        ]);
    })
});
