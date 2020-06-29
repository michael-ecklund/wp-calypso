/**
 * External dependencies
 */
import React from 'react';
import styled from '@emotion/styled';
import debugFactory from 'debug';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@automattic/react-i18n';

/**
 * Internal dependencies
 */
import Field from '../../components/field';
import Button from '../../components/button';
import {
	usePaymentProcessor,
	useTransactionStatus,
	useLineItems,
	renderDisplayValueMarkdown,
	useEvents,
} from '../../public-api';
import { SummaryLine, SummaryDetails } from '../styled-components/summary-details';
import { useFormStatus } from '../form-status';
import { registerStore, useSelect, useDispatch } from '../../lib/registry';
import { PaymentMethodLogos } from '../styled-components/payment-method-logos';

const debug = debugFactory( 'composite-checkout:wechat-payment-method' );

export function createWeChatPaymentMethodStore() {
	debug( 'creating a new wechat payment method store' );
	const actions = {
		changeCustomerName( payload ) {
			return { type: 'CUSTOMER_NAME_SET', payload };
		},
	};

	const selectors = {
		getCustomerName( state ) {
			return state.customerName || '';
		},
	};

	const store = registerStore( 'wechat', {
		reducer(
			state = {
				customerName: { value: '', isTouched: false },
			},
			action
		) {
			switch ( action.type ) {
				case 'CUSTOMER_NAME_SET':
					return { ...state, customerName: { value: action.payload, isTouched: true } };
			}
			return state;
		},
		actions,
		selectors,
	} );

	return { ...store, actions, selectors };
}

export function createWeChatMethod( { store, stripe, stripeConfiguration } ) {
	return {
		id: 'wechat',
		label: <WeChatLabel />,
		activeContent: <WeChatFields stripe={ stripe } stripeConfiguration={ stripeConfiguration } />,
		submitButton: (
			<WeChatPayButton
				store={ store }
				stripe={ stripe }
				stripeConfiguration={ stripeConfiguration }
			/>
		),
		inactiveContent: <WeChatSummary />,
		getAriaLabel: () => 'WeChat Pay',
	};
}

function WeChatFields() {
	const { __ } = useI18n();

	const customerName = useSelect( ( select ) => select( 'wechat' ).getCustomerName() );
	const { changeCustomerName } = useDispatch( 'wechat' );
	const { formStatus } = useFormStatus();
	const isDisabled = formStatus !== 'ready';

	return (
		<WeChatFormWrapper>
			<WeChatField
				id="cardholderName"
				type="Text"
				autoComplete="cc-name"
				label={ __( 'Your name' ) }
				value={ customerName?.value ?? '' }
				onChange={ changeCustomerName }
				isError={ customerName?.isTouched && customerName?.value.length === 0 }
				errorMessage={ __( 'This field is required' ) }
				disabled={ isDisabled }
			/>
		</WeChatFormWrapper>
	);
}

const WeChatFormWrapper = styled.div`
	padding: 16px;
	position: relative;

	::after {
		display: block;
		width: calc( 100% - 6px );
		height: 1px;
		content: '';
		background: ${ ( props ) => props.theme.colors.borderColorLight };
		position: absolute;
		top: 0;
		left: 3px;

		.rtl & {
			right: 3px;
			left: auto;
		}
	}
`;

const WeChatField = styled( Field )`
	margin-top: 16px;

	:first-of-type {
		margin-top: 0;
	}
`;

function WeChatPayButton( { disabled, store, stripe, stripeConfiguration } ) {
	const { __ } = useI18n();
	const [ items, total ] = useLineItems();
	const { formStatus } = useFormStatus();
	const {
		setTransactionRedirecting,
		setTransactionError,
		setTransactionPending,
	} = useTransactionStatus();
	const submitTransaction = usePaymentProcessor( 'wechat' );
	const onEvent = useEvents();
	const customerName = useSelect( ( select ) => select( 'wechat' ).getCustomerName() );

	return (
		<Button
			disabled={ disabled }
			onClick={ () => {
				if ( isFormValid( store ) ) {
					debug( 'submitting wechat payment' );
					setTransactionPending();
					onEvent( { type: 'REDIRECT_TRANSACTION_BEGIN', payload: { paymentMethodId: 'wechat' } } );
					submitTransaction( {
						stripe,
						name: customerName?.value,
						items,
						total,
						stripeConfiguration,
					} )
						.then( ( stripeResponse ) => {
							if ( ! stripeResponse?.redirect_url ) {
								setTransactionError(
									__(
										'There was an error processing your payment. Please try again or contact support.'
									)
								);
								return;
							}
							debug( 'wechat transaction requires redirect', stripeResponse.redirect_url );
							setTransactionRedirecting( stripeResponse.redirect_url );
						} )
						.catch( ( error ) => {
							setTransactionError( error.message );
						} );
				}
			} }
			buttonType="primary"
			isBusy={ 'submitting' === formStatus }
			fullWidth
		>
			<ButtonContents formStatus={ formStatus } total={ total } />
		</Button>
	);
}

function ButtonContents( { formStatus, total } ) {
	const { __ } = useI18n();
	if ( formStatus === 'submitting' ) {
		return __( 'Processing…' );
	}
	if ( formStatus === 'ready' ) {
		return sprintf( __( 'Pay %s' ), renderDisplayValueMarkdown( total.amount.displayValue ) );
	}
	return __( 'Please wait…' );
}

function WeChatSummary() {
	const customerName = useSelect( ( select ) => select( 'wechat' ).getCustomerName() );

	return (
		<SummaryDetails>
			<SummaryLine>{ customerName?.value }</SummaryLine>
		</SummaryDetails>
	);
}

function isFormValid( store ) {
	const customerName = store.selectors.getCustomerName( store.getState() );

	if ( ! customerName?.value.length ) {
		// Touch the field so it displays a validation error
		store.dispatch( store.actions.changeCustomerName( '' ) );
		return false;
	}
	return true;
}

function WeChatLabel() {
	return (
		<React.Fragment>
			<span>WeChat Pay</span>
			<PaymentMethodLogos className="wechat__logo payment-logos">
				<WeChatLogoUI />
			</PaymentMethodLogos>
		</React.Fragment>
	);
}

const WeChatLogoUI = styled( WeChatLogo )`
	width: 28px;
`;

function WeChatLogo( { className } ) {
	return (
		<svg
			className={ className }
			height="150"
			viewBox="0 0 150 150"
			width="150"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				d="m55 92.780547a4.9681182 4.9681182 0 0 1 -6.458554-1.968848l-.331207-.699216-13.432321-29.311894a2.4472583 2.4472583 0 0 1 3.864093-2.796867l15.732371 11.205867a7.249772 7.249772 0 0 0 6.348153.791218l74.006545-32.955184c-13.28511-15.62197-35.089628-25.926215-59.783007-25.926215-40.480962 0-73.1969389 27.324648-73.1969389 61.015851 0 18.400434 9.9362349 34.960831 25.2822019 46.111501a4.9681182 4.9681182 0 0 1 2.060846 3.97449 5.8145381 5.8145381 0 0 1 -.239205 1.56405l-3.312078 12.45708a7.1761707 7.1761707 0 0 0 -.404809 1.84006 2.484059 2.484059 0 0 0 2.465658 2.46564 2.7600657 2.7600657 0 0 0 1.416832-.44161l16.026783-9.20022a7.6729824 7.6729824 0 0 1 3.882494-1.12242 7.4521771 7.4521771 0 0 1 2.152849.3312 86.592457 86.592457 0 0 0 23.920568 3.3489c40.480966 0 73.196966-27.32467 73.196966-61.015867a52.809254 52.809254 0 0 0 -8.35383-28.299872l-84.329196 48.35635z"
				fill="#00c800"
				stroke-width="1.840044"
			/>
		</svg>
	);
}
