const router = require('express').Router();

const postHandler = require('../utils/post-handler');
const handlers = require('../handlers/handler');

router.get('/get-test'
    , postHandler.getToken
    , handlers.getTest
);

router.post('/post-test'
    , postHandler.jsonProcess //lay json_data
    , handlers.postTest
);

module.exports = router;