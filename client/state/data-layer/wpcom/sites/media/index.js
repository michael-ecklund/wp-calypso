/**
 * Internal dependencies
 */

import debug from 'debug';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { http } from 'state/data-layer/wpcom-http/actions';
import { MEDIA_REQUEST, MEDIA_ITEM_REQUEST, MEDIA_ITEM_DELETE } from 'state/action-types';
import {
	failMediaRequest,
	failMediaItemRequest,
	receiveMedia,
	requestingMedia,
	requestingMediaItem,
	successMediaRequest,
	successMediaItemRequest,
	deleteMedia,
} from 'state/media/actions';
import { requestMediaStorage } from 'state/sites/media-storage/actions';
import {
	dispatchFluxRemoveMediaItemSuccess,
	dispatchFluxRemoveMediaItemError,
} from 'state/media/utils/flux-adapter';

import { registerHandlers } from 'state/data-layer/handler-registry';

/**
 * Module variables
 */
const log = debug( 'calypso:middleware-media' );

export function requestMedia( action ) {
	log( 'Request media for site %d using query %o', action.siteId, action.query );

	return [
		requestingMedia( action.siteId, action.query ),
		http(
			{
				method: 'GET',
				path: `/sites/${ action.siteId }/media`,
				apiVersion: '1.1',
			},
			action
		),
	];
}

export const requestMediaSuccess = ( { siteId, query }, { media, found } ) => [
	receiveMedia( siteId, media, found, query ),
	successMediaRequest( siteId, query ),
];

export const requestMediaError = ( { siteId, query } ) => failMediaRequest( siteId, query );

export function handleMediaItemRequest( action ) {
	const { mediaId, query, siteId } = action;

	log( 'Request media item %d for site %d', mediaId, siteId );

	return [
		requestingMediaItem( siteId, query ),
		http(
			{
				apiVersion: '1.2',
				method: 'GET',
				path: `/sites/${ siteId }/media/${ mediaId }`,
				query,
			},
			action
		),
	];
}

export const receiveMediaItem = ( { mediaId, siteId }, media ) => [
	receiveMedia( siteId, media ),
	successMediaItemRequest( siteId, mediaId ),
];

export const receiveMediaItemError = ( { mediaId, siteId } ) =>
	failMediaItemRequest( siteId, mediaId );

export const requestDeleteMedia = ( action ) => {
	return [
		http(
			{
				apiVersion: '1.1',
				method: 'POST',
				path: `/sites/${ action.siteId }/media/${ action.mediaId }/delete`,
			},
			action
		),
	];
};

export const deleteMediaSuccess = ( { siteId }, mediaItem ) => ( dispatch ) => {
	dispatch( deleteMedia( siteId, mediaItem.ID ) );
	dispatch( requestMediaStorage( siteId ) );

	dispatchFluxRemoveMediaItemSuccess( siteId, mediaItem );
};

export const deleteMediaError = ( { siteId }, error ) => () => {
	dispatchFluxRemoveMediaItemError( siteId, error );
};

registerHandlers( 'state/data-layer/wpcom/sites/media/index.js', {
	[ MEDIA_REQUEST ]: [
		dispatchRequest( {
			fetch: requestMedia,
			onSuccess: requestMediaSuccess,
			onError: requestMediaError,
		} ),
	],

	[ MEDIA_ITEM_REQUEST ]: [
		dispatchRequest( {
			fetch: handleMediaItemRequest,
			onSuccess: receiveMediaItem,
			onError: receiveMediaItemError,
		} ),
	],

	[ MEDIA_ITEM_DELETE ]: [
		dispatchRequest( {
			fetch: requestDeleteMedia,
			onSuccess: deleteMediaSuccess,
			onError: deleteMediaError,
		} ),
	],
} );
