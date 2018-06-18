import AWS = require("aws-sdk");

var credentials = new AWS.SharedIniFileCredentials({profile: 'personal'});
AWS.config.credentials = credentials;
AWS.config.region = "eu-west-1";

export const Config = {
    STAGE: "diplomska-dev",
};
