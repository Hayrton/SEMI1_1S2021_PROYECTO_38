var AWS = require("aws-sdk");
var translate = new AWS.Translate({region:'us-east-1'});

exports.handler = function(event,ctx,callback) {
    var params = {
      SourceLanguageCode: 'auto',
      TargetLanguageCode: event.language,
      Text: event.texto
    };
    translate.translateText(params, function (err, data) {
      if (err){
          callback('Error',err.stack);
      } 
      else{
          callback(null,data.TranslatedText);
      }
    });
};
