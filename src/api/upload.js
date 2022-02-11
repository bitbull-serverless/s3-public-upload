/**
 * Lib
 */
const { verifyToken } = require('../lib/recaptcha')
const { getRandomFileName, getUploadURL } = require('../lib/bucket')

/**
 * Constants
 */
const headers = {
	'Access-Control-Allow-Headers' : 'Content-Type',
	'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGINS || '*',
	'Access-Control-Allow-Methods': 'POST'
}
const DEFAULT_FILE_CONTENT_TYPE = process.env.FILE_CONTENT_TYPE || 'application/pdf'
const DEFAULT_FILE_EXTENSION = process.env.FILE_EXTENSION || '.pdf'
const OBJECT_KEY_PREFIX = process.env.OBJECT_KEY_PREFIX || ''

/**
  * Lambda handler
  * 
  * @param {object} event
  * @param {string} event.body
  */
exports.handler = async function({ body, requestContext }) {

	// Retrieve request parameter from body
	let token = ''
	let contentType = ''
	let fileExtension = ''
	try {
		const res = JSON.parse(body)
		token = res.token
		contentType = res.type || DEFAULT_FILE_CONTENT_TYPE
		fileExtension = res.ext || DEFAULT_FILE_EXTENSION
	} catch (error) {
		// Catch all token validation error
		console.error(error)
		return {
			headers,
			statusCode: 400,
			body: 'Invalid Post Data'
		} 
	}

	// Retrieve source IP
	const sourceIp = requestContext.identity ? requestContext.identity.sourceIp : ''

	try {
		// Verify token request with Google reCAPTCHA
		await verifyToken(token, sourceIp) 
	} catch (error) {
		// Catch all token validation error
		console.error(error)
		return {
			headers,
			statusCode: 403,
			body: 'Invalid Token Provided'
		} 
	}

	// Generate the upload file name
	const fileName = getRandomFileName(fileExtension)
	const uploadUrl = await getUploadURL(OBJECT_KEY_PREFIX, fileName, contentType)
 
	// Return the response to Snipcart
	return {
		headers,
		statusCode: 200,
		body: JSON.stringify({
			key: fileName,
			type: contentType,
			url: uploadUrl
		})
	}
}
 