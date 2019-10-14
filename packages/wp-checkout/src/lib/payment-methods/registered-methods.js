/* @format */

/**
 * Internal dependencies
 */
import { registerPaymentMethod } from '../../lib/payment-methods';

export default function loadPaymentMethods() {
	registerPaymentMethod( {
		id: 'apple-pay',
		button: 'Apple Pay',
		form: null,
		billingContactForm: null,
		submit: () => {},
	} );

	registerPaymentMethod( {
		id: 'card',
		button: 'Credit Card',
		form: null,
		billingContactForm: null,
		submit: () => {},
	} );

	registerPaymentMethod( {
		id: 'paypal',
		button: 'Paypal',
		form: null,
		billingContactForm: null,
		submit: () => {},
	} );
}
