import bodyParser from 'body-parser';

// https://github.com/microsoft/TypeScript/issues/47663#issuecomment-1519138189

export const bodyParserMiddleware = bodyParser.json();
