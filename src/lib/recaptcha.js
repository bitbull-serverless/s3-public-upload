const axios = require('axios')

/**
 * AWS Clients
 */
const SSM = require('aws-sdk/clients/ssm')
const ssm = new SSM({
	apiVersion: '2014-11-06',
	logger: console
})

/**
 * Constants
 */
const API_SECRET_PARAMETER_NAME = process.env.RECAPTCHA_SECRET_PARAMETER_NAME
const API_ENDPOINT = 'https://www.google.com/recaptcha/api'
let API_SECRET = null

/**
 * Get reCAPTCHA API token
 * @returns {string}
 */
async function getApiSecret() {
	if (!API_SECRET) {
		const { Parameter: parameter } = await ssm.getParameter({
			Name: API_SECRET_PARAMETER_NAME
		}).promise()

		API_SECRET = parameter.Value
	}

	return API_SECRET
}

/**
 * Return an axios instance
 * @returns {axios.AxiosInstance}
 */
function getAxiosInstance() {
	return axios.create({
		baseURL: API_ENDPOINT
	})
}

/**
 * Get subscription
 * 
 * @param {string} token
 * @param {string} remoteIp
 * @throws {Error} when validation fail
 */
async function verifyToken(token, remoteIp = '') {
	// Check if token was provided
	if (!token) {
		throw new Error('Token Not Found')
	}

	// Get reCAPTCHA secret
	const secret = await getApiSecret()

	// Check provided token
	const axios = getAxiosInstance()
	const { data } = await axios.post(`/siteverify?secret=${secret}&response=${token}&remoteip=${remoteIp}`)
	console.log({ reCaptchaResponse: data })

	// Check response
	if (!data.success) {
		throw new Error('Invalid Token Provided')
	}
}

module.exports = {
	verifyToken
}
