/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';
import { cloneDeep } from 'lodash';

/**
 * Internal dependencies
 */
import { LOADING } from 'woocommerce/state/constants';
import { fetchShippingClassesSuccess, fetchShippingClassesIfNotLoaded } from '../actions';
import reducer from '../reducers';
import initialState from './data/initial-state';

const siteId = 123;

describe( 'Shipping classes form reducer', () => {
	const expectedEndState = cloneDeep( initialState );

	afterEach( () => {
		// make sure the state hasn't been mutated
		// after each test
		expect( initialState ).to.eql( expectedEndState );
	} );

	test( 'WOOCOMMERCE_SERVICES_SHIPPING_CLASSES_REQUEST enters loading state', () => {
		const action = fetchShippingClassesIfNotLoaded( siteId );
		const state = reducer( false, action );

		expect( state ).to.equal( LOADING );
	} );

	test( 'WOOCOMMERCE_SERVICES_SHIPPING_CLASSES_REQUEST_SUCCESS saves data', () => {
		const action = fetchShippingClassesSuccess( siteId, initialState );
		const state = reducer( false, action );

		expect( state ).to.eql( initialState );
	} );
} );
