/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';
import { noop, partial } from 'lodash';
import PropTypes from 'prop-types';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import DropdownItem from 'components/select-dropdown/item';
import ClipboardButtonInput from 'components/clipboard-button-input';
import { isWithinBreakpoint } from 'lib/viewport';
import SelectDropdown from 'components/select-dropdown';

const possibleDevices = [ 'computer', 'tablet', 'phone' ];

export default class PreviewToolbar extends Component {
	static propTypes = {
		// Show device viewport switcher
		showDeviceSwitcher: PropTypes.bool,
		// Show external link with clipboard input
		showUrl: PropTypes.bool,
		// Show external link button
		showExternal: PropTypes.bool,
		// Show close button
		showClose: PropTypes.bool,
		// Show SEO button
		showSEO: PropTypes.bool,
		// Show edit button
		showEdit: PropTypes.bool,
		// The URL for the edit button
		editUrl: PropTypes.string,
		// The device to display, used for setting preview dimensions
		device: PropTypes.string,
		// Elements to render on the right side of the toolbar
		children: PropTypes.node,
		// Function to update the device viewport in parent
		setDevice: PropTypes.func,
		// Called when the close button is pressed
		onClose: PropTypes.func.isRequired,
		// Called when the edit button is clicked
		onEdit: PropTypes.func,
		// Called when an external link is clicked
		onExternalClick: PropTypes.func,
		// Translation method for string localization
		translate: PropTypes.func.isRequired,
	};

	static defaultProps = {
		showSEO: true,
		onClose: noop,
		onEdit: noop,
		onExternalClick: noop,
	};

	handleEditorWebPreviewExternalClick = () => {
		this.props.onExternalClick();
	};

	handleEditorWebPreviewClose = () => {
		this.props.onClose();
	};

	handleEditorWebPreviewEdit = () => {
		this.props.onEdit();
	};

	constructor( props ) {
		super();

		this.devices = {
			computer: { title: props.translate( 'Desktop' ), icon: 'computer' },
			tablet: { title: props.translate( 'Tablet' ), icon: 'tablet' },
			phone: { title: props.translate( 'Phone' ), icon: 'phone' },
			seo: { title: props.translate( 'Search & Social' ), icon: 'globe' },
		};
	}

	render() {
		const {
			device: currentDevice,
			editUrl,
			externalUrl,
			isModalWindow,
			previewUrl,
			setDevice,
			showClose,
			showDeviceSwitcher,
			showUrl,
			showEdit,
			showExternal,
			showSEO,
			translate,
		} = this.props;

		const selectedDevice = this.devices[ currentDevice ];
		const devicesToShow = showSEO ? possibleDevices.concat( 'seo' ) : possibleDevices;

		return (
			<div className="web-preview__toolbar">
				{ showClose && (
					<Button
						borderless
						aria-label={ translate( 'Close preview' ) }
						className="web-preview__close"
						data-tip-target="web-preview__close"
						onClick={ this.handleEditorWebPreviewClose }
					>
						{ translate( 'Close' ) }
					</Button>
				) }
				{ isWithinBreakpoint( '>660px' ) && showDeviceSwitcher && (
					<SelectDropdown
						compact
						className="web-preview__device-switcher"
						selectedText={ selectedDevice.title }
						selectedIcon={ <Gridicon size={ 18 } icon={ selectedDevice.icon } /> }
						ref={ this.setDropdown }
					>
						{ devicesToShow.map( device => (
							<DropdownItem
								key={ device }
								selected={ device === currentDevice }
								onClick={ partial( setDevice, device ) }
								icon={ <Gridicon size={ 18 } icon={ this.devices[ device ].icon } /> }
								e2eTitle={ device }
							>
								{ this.devices[ device ].title }
							</DropdownItem>
						) ) }
					</SelectDropdown>
				) }
				{ showUrl && (
					<ClipboardButtonInput
						className="web-preview__url-clipboard-input"
						value={ externalUrl || previewUrl }
						hideHttp
					/>
				) }
				<div className="web-preview__toolbar-actions">
					{ showEdit && (
						<Button
							className="web-preview__edit"
							href={ editUrl }
							onClick={ this.handleEditorWebPreviewEdit }
						>
							{ translate( 'Edit' ) }
						</Button>
					) }
					{ previewUrl && showExternal && (
						<Button
							primary
							className="web-preview__external"
							href={ externalUrl || previewUrl }
							target={ isModalWindow ? '_blank' : null }
							rel="noopener noreferrer"
							onClick={ this.handleEditorWebPreviewExternalClick }
						>
							{ translate( 'Visit site' ) }
						</Button>
					) }
					<div className="web-preview__toolbar-tray">{ this.props.children }</div>
				</div>
			</div>
		);
	}
}
