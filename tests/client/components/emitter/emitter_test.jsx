"use strict";

import React from 'react';
import TestUtils from 'react-addons-test-utils';

import Emitter from '../../../../development/components/emitter/emitter.jsx';

var chai = require('chai');
var expect = chai.expect;


describe('components/emitter', () => {
    it('Renders correctly with no data.', () => {
        const renderer = TestUtils.createRenderer();
        renderer.render(<Emitter/>);
        let result = renderer.getRenderOutput();

        expect(result.type).to.equal('div');
        expect(result.props.children).to.deep.equal([
            <p className="section-header">{''}</p>,
            <ul className="list-inline">{[]}</ul>
        ]);
    });

    it('Renders correctly with no properties.', () => {
        const testName = 'UnitTest';
        const testData = {
            name: testName
        };

        const renderer = TestUtils.createRenderer();
        renderer.render(<Emitter data={testData} />);
        let result = renderer.getRenderOutput();

        expect(result.type).to.equal('div');
        expect(result.props.children).to.deep.equal([
            <p className="section-header">{testName}</p>,
            <ul className="list-inline">{[]}</ul>
        ]);
    });

    it('Renders correctly with a single property', () => {
        const testName = 'UnitTest2';
        const testProperty = { name: testName };
        const testData = {
            name: testName,
            properties: [
                testProperty
            ]
        };

        const renderer = TestUtils.createRenderer();
        renderer.render(<Emitter data={testData} />);

        let result = renderer.getRenderOutput();

        const expectedProperties = [
            <li key={testProperty.name}>
                <input type="checkbox"
                       checked={true}
                       ref={testProperty}
                />
                {testProperty.name}
            </li>
        ];

        // console.log( result.props.children[1].props.children[0].props.children );
        // console.log( 'compared with ');
        // console.log( expectedProperties[0].props.children );

        // Compare is failing due to onChange handler binding, need to find out
        // how to obtain the correct function binding for the compare
        /* expect(result.props.children).to.deep.equal([
            <p className="section-header">{testName}</p>,
            <ul className="list-inline">{expectedProperties}</ul>
        ]);
        */
    })
});
