import { APIGatewayProxyResult } from 'aws-lambda';

/**
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 *
 */

export const recommendationsHandler = async (): Promise<APIGatewayProxyResult> => {
    let response: APIGatewayProxyResult;
    try {
        response = {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Origin': 'http://localhost:3001',
                'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
            },
            body: JSON.stringify(['1']),
        };
    } catch (err) {
        console.log(err);
        response = {
            statusCode: 500,
            body: JSON.stringify({
                message: 'some error happened',
            }),
        };
    }

    return response;
};

export const serviceCategoriesHandler = async () => {
    let response: APIGatewayProxyResult;
    try {
        response = {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Origin': 'http://localhost:3001',
                'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
            },
            body: JSON.stringify([
                {
                    title: 'Title',
                    image: {
                        alt: 'Alt',
                        src: 'source',
                    },
                    link: '/',
                    id: '1',
                },
            ]),
        };
    } catch (err) {
        console.log(err);
        response = {
            statusCode: 500,
            body: JSON.stringify({
                message: 'some error happened',
            }),
        };
    }

    return response;
};

export const servicesHandler = async (): Promise<APIGatewayProxyResult> => {
    let response: APIGatewayProxyResult;
    try {
        response = {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Origin': 'http://localhost:3001',
                'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
            },
            body: JSON.stringify([
                {
                    title: 'Title',
                    categoryId: '1',
                    id: '1',
                    serviceProvider: {
                        name: 'Provider',
                        logo: {
                            alt: 'alt',
                            src: 'source',
                        },
                    },
                    description: 'Description.',
                    link: {
                        text: 'Siirry palveluun',
                        src: 'source',
                        external: false,
                    },
                    coverPhoto: {
                        big: {
                            alt: 'alt',
                            src: 'source',
                        },
                        small: {
                            alt: 'alt',
                            src: 'source',
                        },
                    },
                    available: true,
                    recommended: true,
                    commentTitle: 'Kokemuksia palvelusta',
                    commentImage: {
                        alt: 'alt',
                        src: 'source',
                    },
                    comments: [
                        {
                            image: {
                                alt: 'alt',
                                src: 'source',
                            },
                            quote: 'comment about service',
                            timestamp: 1663043132,
                        },
                        {
                            image: {
                                alt: 'alt',
                                src: 'source',
                            },
                            quote: 'comment about service',
                            timestamp: 1663043132,
                        },
                    ],
                },
            ]),
        };
    } catch (err) {
        console.log(err);
        response = {
            statusCode: 500,
            body: JSON.stringify({
                message: 'some error happened',
            }),
        };
    }

    return response;
};
