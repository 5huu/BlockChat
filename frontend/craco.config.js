module.exports = {
    webpack: {
        configure: {
            ignoreWarnings: [
                {
                    module: /node_modules\/web3/,
                    message: /Failed to parse source map/,
                }
            ],
        },
    },
}; 