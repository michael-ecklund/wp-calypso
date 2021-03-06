/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { button as icon } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import edit from './edit';
import save from './save';

const name = 'premium-content/buttons';
const category = 'design';

const settings = {
	name,
	category,
	title: __( 'Premium Content buttons', 'full-site-editing' ),
	description: __(
		'Prompt Premium Content visitors to take action with a group of button-style links.',
		'full-site-editing'
	),
	icon,
	supports: {
		align: true,
		alignWide: false,
		lightBlockWrapper: true,
	},
	keywords: [ __( 'link', 'full-site-editing' ) ],
	edit,
	save,
	context: [ 'premium-content/planId' ],
};

export { name, category, settings };
