create table Persona(
    id_persona      int not null auto_increment,
    nombre          varchar(100) not null,
    correo          varchar(100) not null,
    fecha_nacimiento date not null,
    telefono        int not null,
    primary key (id_persona)
);

create table Examen(
    cod_examen      int not null auto_increment,
    tema            varchar(50) not null,
    nota            int not null,
    fecha           date not null,
    primary key (cod_examen)
);

create table Asigna_Examen(
    id_persona      int not null,
    cod_examen      int not null,
    primary key (id_persona, cod_examen),
    foreign key (id_persona) references Persona(id_persona),
    foreign key (cod_examen) references Examen(cod_examen)
);

create table Pregunta(
    cod_pregunta    int not null auto_increment,
    enunciado       varchar(500) not null,
    correcta        int not null,
    cod_examen      int not null,
    primary key (cod_pregunta),
    foreign key (cod_examen) references Examen (cod_examen)
);

create table Respuesta(
    cod_respuesta   int not null auto_increment,
    respuestas      varchar(500) not null,
    imagen          varchar(100),
    cod_pregunta      int not null,
    primary key (cod_respuesta),
    foreign key (cod_pregunta) references Pregunta(cod_pregunta)
);