/**
 * External dependencies
 */
import { getCategories } from '@wordpress/blocks';

/**
 * Accepts an array of category names and returns the first one that
 * exists in the categories WP store. This allows for a "progressive
 * enhancement" strategy to category names, where we just append the
 * new category name when it's updated, and the block will still use
 * the old ones in environments where it still exists.
 *
 * @param requestedCategories an array of categories.
 * @returns {string} the first category name found.
 * @throws {Error} if the no categories could be found.
 */
export function getCategoryWithFallbacks( ...requestedCategories: string[] ): string {
	const knownCategories: Array< { slug: string } > = getCategories();
	for ( const requestedCategory of requestedCategories ) {
		if ( knownCategories.some( ( { slug } ) => slug === requestedCategory ) ) {
			return requestedCategory;
		}
	}
	throw new Error(
		`Could not find a category from the list provided ${ requestedCategories.join( ',' ) }`
	);
}
