/**
 * Test configuration for the FSE plugin.
 *
 * Will match files such that:
 *   1. Must be in the apps/full-site-editing/ directory
 *   2. Must have .test.EXT at the end of the filename
 *   3. EXT (above) must be one of js, ts, jsx, or tsx.
 *
 * Note: In order to use a different jest config for e2e tests, this config file
 * must be kept in the bin/ folder to prevent it from being detected as the
 * config file for e2e tests.
 */

/* eslint-disable import/no-extraneous-dependencies */

const defaults = require( '../../../packages/calypso-build/jest-preset' );
const path = require( 'path' );

// Basically, CWD, so 'apps/full-site-editing'.
// Without this, it tries to use 'apps/full-site-editing/bin'
const pluginRoot = path.resolve( './' );

const config = {
	...defaults,
	rootDir: path.normalize( '../../../' ), // To detect wp-calypso root node_modules
	testMatch: [ `${ pluginRoot }/**/?(*.)test.[jt]s?(x)` ],
	setupFilesAfterEnv: [
		...( defaults.setupFilesAfterEnv || [] ), // extend if present
		'<rootDir>/apps/full-site-editing/bin/js-unit-setup',
	],
};

module.exports = config;
