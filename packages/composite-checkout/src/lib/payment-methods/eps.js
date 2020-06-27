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

const debug = debugFactory( 'composite-checkout:eps-payment-method' );

export function createEpsPaymentMethodStore() {
	debug( 'creating a new eps payment method store' );
	const actions = {
		changeCustomerName( payload ) {
			return { type: 'CUSTOMER_NAME_SET', payload };
		},
		changeCustomerBank( payload ) {
			return { type: 'CUSTOMER_BANK_SET', payload };
		},
	};

	const selectors = {
		getCustomerName( state ) {
			return state.customerName || '';
		},
		getCustomerBank( state ) {
			return state.customerBank || '';
		},
	};

	const store = registerStore( 'eps', {
		reducer(
			state = {
				customerName: { value: '', isTouched: false },
				customerBank: { value: '', isTouched: false },
			},
			action
		) {
			switch ( action.type ) {
				case 'CUSTOMER_NAME_SET':
					return { ...state, customerName: { value: action.payload, isTouched: true } };
				case 'CUSTOMER_BANK_SET':
					return { ...state, customerBank: { value: action.payload, isTouched: true } };
			}
			return state;
		},
		actions,
		selectors,
	} );

	return { ...store, actions, selectors };
}

export function createEpsMethod( { store, stripe, stripeConfiguration } ) {
	return {
		id: 'eps',
		label: <EpsLabel />,
		activeContent: <EpsFields stripe={ stripe } stripeConfiguration={ stripeConfiguration } />,
		submitButton: (
			<EpsPayButton store={ store } stripe={ stripe } stripeConfiguration={ stripeConfiguration } />
		),
		inactiveContent: <EpsSummary />,
		getAriaLabel: ( __ ) => __( 'EPS e-Pay' ),
	};
}

function EpsFields() {
	const { __ } = useI18n();

	const customerName = useSelect( ( select ) => select( 'eps' ).getCustomerName() );
	const { changeCustomerName } = useDispatch( 'eps' );
	const { formStatus } = useFormStatus();
	const isDisabled = formStatus !== 'ready';

	return (
		<EpsFormWrapper>
			<EpsField
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
		</EpsFormWrapper>
	);
}

const EpsFormWrapper = styled.div`
	padding: 16px;
	position: relative;

	:after {
		display: block;
		width: calc( 100% - 6px );
		height: 1px;
		content: '';
		background: ${ ( props ) => props.theme.colors.borderColorLight };
		position: absolute;
		top: 0;
		left: 3px;

		.rtl & {
			left: auto;
			right: 3px;
		}
	}
`;

const EpsField = styled( Field )`
	margin-top: 16px;

	:first-of-type {
		margin-top: 0;
	}
`;

function EpsPayButton( { disabled, store, stripe, stripeConfiguration } ) {
	const { __ } = useI18n();
	const [ items, total ] = useLineItems();
	const { formStatus } = useFormStatus();
	const {
		setTransactionRedirecting,
		setTransactionError,
		setTransactionPending,
	} = useTransactionStatus();
	const submitTransaction = usePaymentProcessor( 'eps' );
	const onEvent = useEvents();
	const customerName = useSelect( ( select ) => select( 'eps' ).getCustomerName() );

	return (
		<Button
			disabled={ disabled }
			onClick={ () => {
				if ( isFormValid( store ) ) {
					debug( 'submitting eps payment' );
					setTransactionPending();
					onEvent( { type: 'REDIRECT_TRANSACTION_BEGIN' } );
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
							debug( 'eps transaction requires redirect', stripeResponse.redirect_url );
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

function EpsSummary() {
	const customerName = useSelect( ( select ) => select( 'eps' ).getCustomerName() );

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

function EpsLabel() {
	const { __ } = useI18n();
	return (
		<React.Fragment>
			<span>{ __( 'EPS e-Pay' ) }</span>
			<PaymentMethodLogos className="eps__logo payment-logos">
				<EpsLogo />
			</PaymentMethodLogos>
		</React.Fragment>
	);
}

function EpsLogo() {
	return (
		<svg width="27" height="18" viewBox="0 0 27 18" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path
				d="M23.7246 9.30491H21.3147C21.0467 9.30491 20.8286 9.09135 20.8286 8.82401C20.8286 8.55666 21.0467 8.3213 21.3147 8.3213H24.9836V6.51147H21.3147C20.0341 6.51147 18.9923 7.55543 18.9923 8.83278C18.9923 10.1101 20.0341 11.1541 21.3147 11.1541H23.6919C23.9599 11.1541 24.178 11.3667 24.178 11.6341C24.178 11.9015 23.9599 12.0984 23.6919 12.0984H18.5943C18.1615 12.9246 17.7407 13.6328 16.8864 13.9869H23.7246C24.9836 13.9687 26.0135 12.9033 26.0135 11.6372C26.0135 10.3712 24.9836 9.32305 23.7246 9.30491"
				fill="#616364"
			/>
			<path
				d="M14.4864 6.51148C12.4439 6.51148 10.7803 8.18498 10.7803 10.2413C10.7803 10.2655 10.7803 10.32 10.7803 10.32V18H12.6295V13.9869H14.4825C16.5251 13.9869 18.1829 12.2911 18.1829 10.2348C18.1829 8.17845 16.529 6.51148 14.4864 6.51148V6.51148ZM14.4864 12.0984H12.6295V10.2348C12.6295 9.19342 13.4586 8.34618 14.4864 8.34618C15.5143 8.34618 16.3505 9.19342 16.3505 10.2348C16.3505 11.2761 15.5143 12.0984 14.4864 12.0984"
				fill="#616364"
			/>
			<path
				d="M4.92602 13.9869C3.17756 13.9869 1.70758 12.741 1.30981 11.1133C1.30981 11.1133 1.19485 10.5751 1.19485 10.2208C1.19485 9.86639 1.30368 9.32269 1.30368 9.32269C1.70431 7.69903 3.17249 6.48999 4.91807 6.48999C6.97106 6.48999 8.65574 8.15889 8.65574 10.2119V11.1147H3.20125C3.52336 11.7443 4.17478 12.0984 4.92602 12.0984H9.82934L9.83607 6.77429C9.83607 5.98056 9.18665 5.33114 8.39292 5.33114H1.44319C0.64944 5.33114 0 5.96088 0 6.75461V13.7043C0 14.4981 0.64944 15.1672 1.44319 15.1672H8.39292C9.10525 15.1672 9.69946 14.6557 9.81423 13.9869H4.92602Z"
				fill="#C60C78"
			/>
			<path
				d="M4.91807 8.25661C4.16971 8.25661 3.51895 8.71474 3.19554 9.3049H6.64068C6.31727 8.71474 5.66648 8.25661 4.91807 8.25661"
				fill="#C60C78"
			/>
			<path
				d="M8.06557 3.07117C8.06557 1.375 6.65595 -1.8049e-06 4.91713 -1.8049e-06C3.20711 -1.8049e-06 1.81633 1.33003 1.77065 2.98733C1.7699 2.99429 1.77049 3.00114 1.77049 3.00834V3.93128C1.77049 4.04168 1.86039 4.15082 1.97355 4.15082H3.13188C3.24508 4.15082 3.34426 4.04168 3.34426 3.93128V3.07117C3.34426 2.22417 4.04971 1.53505 4.91803 1.53505C5.78636 1.53505 6.4918 2.22417 6.4918 3.07117V3.93128C6.4918 4.04168 6.58359 4.15082 6.69675 4.15082H7.85512C7.96828 4.15082 8.06557 4.04168 8.06557 3.93128V3.07117Z"
				fill="#C60C78"
			/>
		</svg>
	);
}
