/**
 * External dependencies
 */
import {
	InspectorControls,
	InnerBlocks,
	PanelColorSettings,
	BlockControls,
} from '@wordpress/block-editor';
import { registerBlockType } from '@wordpress/blocks';
import { ToolbarButton } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { positionLeft, positionRight } from '@wordpress/icons';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import { TimelineIcon } from './icon';

export function registerTimelineItemBlock() {
	registerBlockType( 'jetpack/timeline-item', {
		title: __( 'Timeline Entry', 'full-site-editing' ),
		description: __( 'An entry on the timeline', 'full-site-editing' ),
		icon: TimelineIcon,
		category: 'widgets',
		parent: [ 'jetpack/timeline' ],
		edit: ( { attributes, setAttributes } ) => {
			const style = {
				backgroundColor: attributes.background,
			};

			const bubbleStyle = {
				borderColor: attributes.background,
			};

			const toggleAlignment = ( alignment ) => {
				const newAlignment = alignment === attributes.alignment ? 'auto' : alignment;
				setAttributes( { alignment: newAlignment } );
			};

			const classes = classnames( 'wp-block-jetpack-timeline-item', {
				'is-left': attributes.alignment === 'left',
				'is-right': attributes.alignment === 'right',
			} );

			return (
				<>
					<BlockControls>
						<ToolbarButton
							onClick={ () => toggleAlignment( 'left' ) }
							isActive={ attributes.alignment === 'left' }
							icon={ positionLeft }
							title={ __( 'Left', 'full-site-editing' ) }
						/>
						<ToolbarButton
							onClick={ () => toggleAlignment( 'right' ) }
							isActive={ attributes.alignment === 'right' }
							icon={ positionRight }
							title={ __( 'Right', 'full-site-editing' ) }
						/>
					</BlockControls>
					<li style={ style } className={ classes }>
						<InspectorControls>
							<PanelColorSettings
								title={ __( 'Color Settings', 'full-site-editing' ) }
								colorSettings={ [
									{
										value: attributes.background,
										onChange: ( background ) => setAttributes( { background } ),
										label: __( 'Background Color', 'full-site-editing' ),
									},
								] }
							/>
						</InspectorControls>
						<div className="timeline-item">
							<div className="timeline-item__bubble" style={ bubbleStyle } />
							<div className="timeline-item__dot" style={ style } />
							<InnerBlocks template={ [ [ 'core/paragraph' ] ] } />
						</div>
					</li>
				</>
			);
		},
		save: ( { attributes } ) => {
			const style = {
				backgroundColor: attributes.background,
			};

			const bubbleStyle = {
				borderColor: attributes.background,
			};

			return (
				<li style={ style }>
					<div className="timeline-item">
						<div className="timeline-item__bubble" style={ bubbleStyle } />
						<div className="timeline-item__dot" style={ style } />
						<InnerBlocks.Content />
					</div>
				</li>
			);
		},
		attributes: {
			alignment: {
				type: 'string',
				default: 'auto',
			},
			background: {
				type: 'string',
				default: '#eeeeee',
			},
		},
	} );
}
