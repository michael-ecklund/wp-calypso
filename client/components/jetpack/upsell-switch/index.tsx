/**
 * External dependencies
 */
import React, { ReactElement, useState, ReactNode, useEffect, ComponentType, useMemo } from 'react';
import { connect, DefaultRootState } from 'react-redux';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import isJetpackCloud from 'lib/jetpack/is-jetpack-cloud';
import { getSelectedSiteId } from 'state/ui/selectors';
import isAtomicSite from 'state/selectors/is-site-wpcom-atomic';
import getSiteProducts, { SiteProduct } from 'state/sites/selectors/get-site-products';
import Main from 'components/main';

type QueryComponentProps = {
	siteId: number | null;
};

type QueryFunction = ( arg0: DefaultRootState, arg1: number | null ) => SiteState;

export type UpsellComponentProps = {
	reason?: string;
};

type SiteState = {
	state: string;
	reason?: string;
};

type Props = {
	children: ReactNode;
	UpsellComponent: ComponentType< UpsellComponentProps >;
	display: ReactElement;
	QueryComponent: ComponentType< QueryComponentProps >;
	getStateForSite: QueryFunction;
	productSlugTest?: ( slug: string ) => boolean;
	siteId: number | null;
	siteState: SiteState | null;
	atomicSite: boolean;
	siteProducts: SiteProduct[] | null;
};

function UpsellSwitch( props: Props ): React.ReactElement {
	const {
		UpsellComponent,
		display,
		children,
		QueryComponent,
		siteId,
		siteState,
		atomicSite,
		siteProducts,
		productSlugTest,
	} = props;

	const [ { showUpsell, isLoading }, setState ] = useState( {
		showUpsell: true,
		isLoading: true,
	} );

	const hasProduct = useMemo( () => {
		if ( ! siteProducts || ! productSlugTest ) {
			return false;
		}
		const siteProductsSlugs = siteProducts.map( ( { productSlug } ) => productSlug );
		return !! siteProductsSlugs.find( productSlugTest );
	}, [ siteProducts, productSlugTest ] ) as boolean;

	useEffect( () => {
		// Show loading placeholder, the site's state isn't initialized
		if ( ! siteState || siteState?.state === 'uninitialized' ) {
			return setState( {
				isLoading: true,
				showUpsell: true,
			} );
		}

		// Show the expected content. It's distinct to unavailable (active, inactive, provisioning)
		// or if it's an Atomic site
		if ( siteState.state !== 'unavailable' || atomicSite || hasProduct ) {
			return setState( {
				isLoading: false,
				showUpsell: false,
			} );
		}

		// Show the upsell page
		return setState( {
			isLoading: false,
			showUpsell: true,
		} );
	}, [ siteState, atomicSite, hasProduct ] );

	if ( isLoading ) {
		return (
			<Main
				className={ classNames( 'upsell-switch__loading', { is_jetpackcom: isJetpackCloud() } ) }
			>
				<QueryComponent siteId={ siteId } />
				{ children }
			</Main>
		);
	}
	if ( showUpsell ) {
		return <UpsellComponent reason={ siteState?.reason } />;
	}
	return display;
}

export default connect( ( state, ownProps: Props ) => {
	const siteId = getSelectedSiteId( state );
	const siteState = ownProps.getStateForSite( state, siteId );
	const atomicSite = ( siteId && isAtomicSite( state, siteId ) ) as boolean;
	const siteProducts = getSiteProducts( state, siteId );

	return {
		siteId,
		siteState,
		atomicSite,
		siteProducts,
	};
} )( UpsellSwitch );
