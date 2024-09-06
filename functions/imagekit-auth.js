const ImageKit = require("imagekit");

exports.handler = async (event, context) => {
    var imagekit = new ImageKit({
        publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
        privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
        urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
    });

    // Get authentication parameters
    const authParams = imagekit.getAuthenticationParameters();
    
    return {
        statusCode: 200,
        body: JSON.stringify(authParams),
    };
};