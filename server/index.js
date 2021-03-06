'ues strict';

//  node modules
const express       = require('express');
const mongoose      = require('mongoose');
const cookieSession = require('cookie-session');
const passport      = require('passport');
const bodyParser    = require('body-parser');
const path          = require('path');

//  local modules
const keys          = require('./config/keys');
require('./models/User');         //  NOTE: User must be required before passport because passport uses User
require('./services/passport');   //  NOTE: this convention means we require nothing from the module, only that the module be loaded

mongoose.connect(keys.mongoURI,{useNewUrlParser: true });

const app     = express();              //  NOTE: to self this is an instance of an express application - named 'app'

//  middelware -- pre-processing before going to routes
app.use(
    cookieSession({
        maxAge: 24*60*60*1000,       //  1 day
        keys: [keys.cookieKey]
    })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.json());

require('./routes/authRoutes')(app);
require('./routes/billingRoutes')(app);

// Serve static assets in production - this block is executed in the order presented
// This results in a process flow that looks like this:
//    Look for all the routes specified above to resolve routing
//    If not resolved: Then try using the static file for route resolution
//    If still not resolved: As a last resort ('*'), return the html file
// This is done because the build process (which must be executed before deployment to production)
//    Builds static execution files that replace the whole create-react-app side of the project

if ( process.env.NODE_ENV === 'production' ) {
    //  Express will serve up production assets
    app.use(express.static('client/build'));

    //  Express will serve up the index.html file if it does recognize the route
    const path = require('path');
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
    });
}

const PORT = process.env.PORT || 5000;

app.listen(PORT);