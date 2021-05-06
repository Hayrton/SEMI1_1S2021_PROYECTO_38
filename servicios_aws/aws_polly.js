var AWS = require('aws-sdk');
var s3 = new AWS.S3({region: 'us-east-1'});
var polly = new AWS.Polly({region: 'us-east-1'});

//parametros que recivira polly
exports.handler = function(event,ctx,callback) {
   const pollyparams = {
     OutputFormat: "mp3",
     Text: event.text,
     VoiceId: event.voice,
     LanguageCode: event.language 
   }
   
   polly.synthesizeSpeech(pollyparams, (err, data) => {
  	if (err) {
  		console.log(err)
  		return
  	}
  	if (data.AudioStream instanceof Buffer) { //data de audio que retornara polly
  	 let nombreA = "polly/audio";
  	 let audioStream = data.AudioStream;
      const bucketparams = {//creacion de parametros para guardar data en S3
        Bucket: 'proyecto-semi1-g38',
        Key: nombreA+'.mp3',
        Body: audioStream
      }
      
      
      s3.putObject(bucketparams, function(err,data){ //guarda audio en s3
        if (err) {
          console.log("Error al insertar", err);
          callback("Error",err);
        } else {
          console.log("Sucess audio generado",data)
          callback(null,data);
        }
      }); 
  	}
  });
   
};