export interface NewSiteBlogDetails {
	url: string;
	blogid: number;
	blogname: string;
	site_slug?: string;
	xmlrpc: string;
}

export interface NewSiteSuccessResponse {
	success: boolean;
	blog_details: NewSiteBlogDetails;
	is_signup_sandbox?: boolean;
}

export interface NewSiteErrorResponse {
	error: string;
	status: number;
	statusCode: number;
	name: string;
	message: string;
}

export interface NewSiteErrorCreateBlog {
	// This has to be `any` as sites/new will return whatever value is passed to it as `$blog_id` if create blog fails.
	blog_id?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export type NewSiteResponse =
	| NewSiteSuccessResponse
	| NewSiteErrorResponse
	| NewSiteErrorCreateBlog;

export interface CreateSiteParams {
	blog_name: string;
	blog_title?: string;
	authToken?: string;
	public?: number;
	options?: {
		site_vertical?: string;
		site_vertical_name?: string;
		site_vertical_slug?: string;
		site_information?: {
			title?: string;
		};
		lang_id?: number;
		site_creation_flow?: string;
		enable_fse?: boolean;
		theme?: string;
		template?: string;
		timezone_string?: string;
		font_headings?: string;
		font_base?: string;
	};
}

export interface SiteDetails {
	ID: number;
	name: string;
	description: string;
	URL: string;
	options: {
		created_at: string;
	};
}

export interface SiteError {
	error: string;
	message: string;
}

export type SiteResponse = SiteDetails | SiteError;
