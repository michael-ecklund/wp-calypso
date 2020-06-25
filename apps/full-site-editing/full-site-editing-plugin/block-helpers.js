/**
 * External dependencies
 */
import { getCategories } from '@wordpress/blocks';

/**
 * Indicates whether or not we're in an environment that is still
 * using old block [category names]{@link https://github.com/WordPress/gutenberg/pull/19279}.
 * This is not perfect, but works well for checking if we need to register
 * a block with an old category name or the new one, in order to provide
 * backwards compatibility with older Gutenberg versions.
 *
 * This is the same strategy used by [CoBlocks]{@link https://github.com/godaddy-wordpress/coblocks/pull/1535}.
 *
 * @returns {boolean} value indicating if we're still using old category names.
 */
export const hasLegacyCategory = getCategories().some( function ( category ) {
	return category.slug === 'formatting';
} );
