const ImageKit = require("imagekit");

exports.handler = async (event, context) => {
    try {
        console.log('Initializing ImageKit instance...');
        const imagekit = new ImageKit({
            publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
            privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
            urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
        });

        console.log('Fetching authentication parameters...');
        const authParams = imagekit.getAuthenticationParameters();

        console.log('Authentication parameters fetched successfully:', authParams);

        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(authParams),
        };
    } catch (error) {
        console.error('Error occurred:', error);

        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ error: 'Internal Server Error' }),
        };
    }
};
