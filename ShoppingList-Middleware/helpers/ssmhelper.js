let aws = require('aws-sdk');

const getParameterFromParameterStore = async (parameterName) => {
    const ssm = new aws.SSM();
    const params = {
        Name: parameterName,
        WithDecryption: false
    };
    const response = await ssm.getParameter(params).promise();
    return response.Parameter.Value
}

exports.getParameterFromParameterStore = getParameterFromParameterStore;