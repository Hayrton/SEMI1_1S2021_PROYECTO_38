const express = require('express')
const fileUpload = require('express-fileupload')
var cors = require('cors')
var AWS = require('aws-sdk');
const mysql = require('mysql');

var bodyParser = require('body-parser')

const app = express()

//app.use(express.static(__dirname + '/files'));
app.use(express.static('files'));
//app.use(bodyParser());
app.use(fileUpload())
app.use(cors())

app.use(bodyParser.json({limit: "90mb"}));
app.use(bodyParser.urlencoded({limit: "90mb", extended: true, parameterLimit:50000}));

const s3 = new AWS.S3({
        accessKeyId:'AKIAVXA5U3DZAWW67KE4',
        secretAccessKey:'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',
        region:'us-east-2'

});

const rek = new AWS.Rekognition({
    accessKeyId:'AKIA2TKFJE5ICYFO2C2I',
    secretAccessKey:'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',
    region:'us-east-1'
}
);



const connection = mysql.createConnection({
    host: 'database-1.cjcnmccjn0xj.us-east-1.rds.amazonaws.com',
    user: 'admin',
    password: 'admin123',
    database: 'proyectosemi'
  });


  connection.connect((err) => {
    if (err) throw err;
    console.log('Connected!');
  });






  app.post('/upload',async (req,res) => {
    let file = req.files['file']
      
        const params ={
            Bucket:'practica1-g38-imagenes',
            Key:"Fotos_Perfil/"+file.name,
            Body:file.data,
            ACL:'public-read',
            ContentType:"image"
        }

        const putObjectpromise= s3.upload(params).promise();
        //let bandera=false
        putObjectpromise.then((result)=>{
            console.log(result.Location)
            res.json({url:result.Location})    
        }).catch(error=>{
            console.log(error,"error_promise");
            res.json({dato:"result.Location"})
        })
        
        // res.json({mensaje:bandera})
})

app.post('/upload2',async (req,res) => {
    let file = req.files['file']

        const params ={
            Bucket:'practica1-g38-imagenes',
            Key:"Fotos_Publicadas/"+file.name,
            Body:file.data,
            ACL:'public-read',
            ContentType:"image"
        }

        const putObjectpromise= s3.upload(params).promise();
        //let bandera=false
        putObjectpromise.then((result)=>{
            console.log(result.Location)
            res.json({url:result.Location})    
        }).catch(error=>{
            console.log(error,"error_promise");
            res.json({dato:"result.Location"})
        })
        
        // res.json({mensaje:bandera})
})

app.get("/index",async (req, res)=> {
    
    res.json({mensaje:"Hola mundo"});
});


app.post("/insertusuario",async (req, res)=> {
    
    let body=req.body;
    const insert = connection.query('INSERT INTO Usuario(usuario,nombre,foto,contrasenia) VALUES(?,?,?,?)', [body.Usuario,body.Nombre,body.Foto,body.Contrasenia], function (err, result) {
        if (err) throw err;
        console.log("");
      });
 
    res.json({mensaje:"Usuario insertado Correctamente2"});
});
    
app.post("/login",async (req, res)=> {
    
    let body=req.body;
    let user=req.body.Usuario
    let pass=req.body.Contrasenia

    connection.query('SELECT * FROM Usuario where(usuario=\''+user+'\' and contrasenia=\''+pass+'\' )', (err,rows) => {
    if(err) throw err;
    
    let bandera="false"
    if(rows.length==1){
        bandera="true"
        res.json({estado:bandera,Usuario:{id_usuario:rows[0].id_usuario,Usuario:rows[0].usuario,Nombre:rows[0].nombre,Foto:rows[0].foto}});
    }else{
        res.json({estado:bandera,Usuario:""});
    }    
    
});
});



app.post("/loginfoto",async (req, res)=> {
  
  let url=req.body.URL
  console.log(url);
  connection.query('SELECT * FROM Usuario where(foto=\''+url+'\')', (err,rows) => {
  if(err) throw err;
  
  let bandera="false"
  if(rows.length==1){
      bandera="true"
      res.json({estado:bandera,Usuario:{id_usuario:rows[0].id_usuario,Usuario:rows[0].usuario,Nombre:rows[0].nombre,Foto:rows[0].foto}});
  }else{
      res.json({estado:bandera,Usuario:""});
  }    
  
});
});

// Analizar Emociones Cara
app.post('/detectarcara', function (req, res) { 

  var id = req.body.imagen;
   
    var nombrei = "Fotos_Perfil/" + id;
    var getParams = {
      Bucket: 'practica1-g38-imagenes',
      Key: nombrei
    }
    var imagen2;
    s3.getObject(getParams, function (err, data) {
      if (err)
        res.json({ mensaje: "error" })
     
      imagen2 = data.Body;
      var params = {
        Image: { 
          Bytes: Buffer.from(imagen2, 'base64')
        },
        Attributes: ['ALL']
      };
      rek.detectFaces(params, function(err, data) {
        if (err) {res.json({mensaje: err})} 
        else {   
               res.json({Deteccion: data});      
        }
      });  

    });
});


app.post('/detectartexto', function (req, res) { 
  var id = req.body.imagen;
  var nombrei = "Fotos_Perfil/" + id;
  var getParams = {
    Bucket: 'practica1-g38-imagenes',
    Key: nombrei
  }
  var imagen2;
  s3.getObject(getParams, function (err, data) {
    if (err)
      res.json({ mensaje: "error" })
   
    imagen2 = data.Body;
    var params = {
    
      Image: { 
        Bytes: Buffer.from(imagen2, 'base64')
      }
    };
    rek.detectText(params, function(err, data) {
      if (err) {res.json({mensaje: "Error"})} 
      else {   
             res.json({texto: data.TextDetections});      
      }
    });
  
  });

  
});









app.post("/insertalbum",async (req, res)=> {
    
    let body=req.body;
    const insert = connection.query('INSERT INTO Album(nombre,id_usuario) VALUES(?,?)', [body.Nombre,body.Id_usuario], function (err, result) {
        if (err) throw err;
        console.log("");
      });
    
    res.json({mensaje:"Album insertado Correctamente2"});
});


app.post("/albums",async (req, res)=> {
    
    let body=req.body;
    connection.query('SELECT * FROM Album where(id_usuario=\''+body.id_usuario+'\')', (err,rows)=> {
    if(err) throw err;        
    res.json(rows);
});

});

var corsOptions = {
  origin: 'http://localhost:4200',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}











app.post("/comparar",cors(corsOptions),async (req, res)=> {
    
    const imagen1 = req.body.imagen1;
    var id = req.body.imagen2;
   
    var nombrei = "Fotos_Perfil/" + id;
    
    var getParams = {
      Bucket: 'practica1-g38-imagenes',
      Key: nombrei
    }
    var imagen2;
    s3.getObject(getParams, function (err, data) {
      if (err)
        res.json({ mensaje: "error" })
     
      imagen2 = data.Body;
      var params = {
        SourceImage: {
            Bytes:Buffer.from(imagen1,'base64')  
        }, 
        TargetImage: {
          Bytes:Buffer.from(imagen2,'base64')
        },
        SimilarityThreshold:80,      
      };
  
      rek.compareFaces(params, function(err, data) {
        if (err) {
          console.log("Error -> " + err);
          res.status(500).json({error:"Error -> " + err});
          
      } else if(data){
       // console.log({Comparacion: data.FaceMatches});
          res.json({Comparacion: data.FaceMatches});
      }
        
      }); 
    });
   



});


function _base64ToArrayBuffer(base64) {
  var binary_string = window.atob(base64);
  var len = binary_string.length;
  var bytes = new Uint8Array(len);
  for (var i = 0; i < len; i++) {
      bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes.buffer;
}



app.post("/analizar",async (req, res)=> {
    
    var imagen = req.body.imagen;
  var params = {
    /* S3Object: {
      Bucket: "mybucket", 
      Name: "mysourceimage"
    }*/
    Image: { 
      Bytes: Buffer.from(imagen, 'base64')
    }, 
    MaxLabels: 12
  };
  rek.detectLabels(params, function(err, data) {
    if (err) {res.json({mensaje: "Error"})} 
    else {   
           res.json({texto: data.Labels});      
    }
  });


});



app.post("/insertfoto",async (req, res)=> {
    
    let nombre=req.body.Nombre;
    let nombre2=req.body.Nombre2;
    let descripcion=req.body.Descripcion;
    let id_usuario=req.body.Id_usuario;
 
    let id=nombre.replace("https://practica1-g38-imagenes.s3.us-east-2.amazonaws.com/Fotos_Publicadas/","");   
    
    var nombrei = "Fotos_Publicadas/" + id;
    
    var getParams = {
      Bucket: 'practica1-g38-imagenes',
      Key: nombrei
    }

    var imagen2;
    s3.getObject(getParams, function (err, data) {
      if (err)
        res.json({ mensaje: "error" })
     
        imagen2 = data.Body;
        var params = {
          Image: { 
            Bytes: Buffer.from(imagen2, 'base64')
          }, 
          MaxLabels: 20
        };

        rek.detectLabels(params, function(err, data) {
          if (err) {res.json({mensaje: "Error"})} 
          else {   
                for (let item of data.Labels){
                 if(item.Confidence>90){
                    
                  const insert = connection.query('INSERT INTO Album (nombre, id_usuario) SELECT \''+item.Name+'\','+id_usuario+
                  ' FROM Album WHERE NOT EXISTS (SELECT nombre FROM Album WHERE nombre = \''+item.Name+'\')'+
                   'LIMIT 1',function (err, result) {
                    if (err) throw err;
                    console.log("");
                  });
                   // console.log(item.Name);  
                }
                    
                }
               
                 connection.query('SELECT * FROM Album', (err,rows)=> {
                  if(err) throw err;

                  for(let item of rows){
                    for (let item2 of data.Labels){
                      if(item2.Confidence>90&&item.nombre==item2.Name){
                         
                        const insert = connection.query('INSERT INTO Foto(nombre,id_album,descripcion,nombre2) VALUES(?,?,?,?)', [nombre,item.id_album,descripcion,nombre2], function (err, result) {
                          if (err) throw err;
                          console.log("");
                        });                    
                     }
                    }      
                  }
                });
                
          
            //    
                 res.json({texto: data.Labels});      
          }
        });
    });
});







app.post("/fotos",async (req, res)=> {
    
    let body=req.body;
    connection.query('SELECT * FROM Foto where(id_album=\''+body.id_album+'\')', (err,rows)=> {
    if(err) throw err;        
    res.json(rows);
});

});


app.listen(3000,"0.0.0.0",() => console.log('Corriendo en el puerto 3000..'))