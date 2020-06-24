/**
 * External dependencies
 */
import Dispatcher from 'dispatcher';

export const dispatchFluxRemoveMediaItem = ( siteId, mediaItem ) => {
	Dispatcher.handleViewAction( {
		type: 'REMOVE_MEDIA_ITEM',
		siteId: siteId,
		data: mediaItem,
	} );
};

export const dispatchFluxRemoveMediaItemSuccess = ( siteId, mediaItem ) => {
	Dispatcher.handleServerAction( {
		type: 'REMOVE_MEDIA_ITEM',
		siteId,
		data: mediaItem,
	} );
};

export const dispatchFluxRemoveMediaItemError = ( siteId, error ) => {
	Dispatcher.handleViewAction( {
		type: 'REMOVE_MEDIA_ITEM',
		siteId,
		error,
	} );
};

export const dispatchFluxFetchMediaLimits = ( siteId ) =>
	Dispatcher.handleServerAction( { type: 'FETCH_MEDIA_LIMITS', siteId } );
