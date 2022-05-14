module.exports = {
    echo: function(message, callback){
        return callback(undefined, 'Echo: '+message);
    }
};