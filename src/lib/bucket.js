const path = require('path')
const { v4: uuid } = require('uuid')

/**
 * AWS Clients
 */
const S3 = require('aws-sdk/clients/s3')
const s3 = new S3({
	logger: console,
	apiVersion: '2006-03-01'
})

/**
 * Constants
 */
const BUCKET_NAME = process.env.BUCKET_NAME
const URL_EXPIRES = process.env.UPLOAD_URL_EXPIRATION_SECONDS ? parseInt(process.env.UPLOAD_URL_EXPIRATION_SECONDS) : 3600

/**
 * @param {string} prefix 
 * @param {string} key 
 * @param {string} contentType
 * @returns 
 */
async function getUploadURL(prefix, key, contentType) {
	return await s3.getSignedUrlPromise('putObject', {
		Bucket: BUCKET_NAME,
		Key: path.join(prefix, key),
		Expires: URL_EXPIRES,
		ContentType: contentType
	})
}

/**
 * Generate a random object key
 * @param {string} ext
 * @returns {string}
 */
function getRandomFileName(ext = '') {
	return uuid() + ext
}

module.exports = {
	getRandomFileName,
	getUploadURL
}
