CREATE KEYSPACE IF NOT EXISTS asd WITH replication = {'class': 'SimpleStrategy', 'replication_factor':1};

CREATE TABLE asd.apikey (
    apikey text PRIMARY KEY,
    created int,
    orgid uuid,
    secret text
);


CREATE TABLE asd.questions (
    questionid uuid,
    creator uuid,
    created int,
    eventid uuid,
    type text,
    question text,
    options map<text,text>,
    deleted boolean,
    PRIMARY KEY (questionid)
);


INSERT INTO asd.questions (questionid, creator, created, eventid, type, question, options, deleted ) VALUES (uuid(), uuid(), 25253456, 6fa459ea-ee8a-3ca4-894e-db77e160355e, 'range', '¿Que es asdeporte?', {'min': '0', 'max': '200'}, false);
INSERT INTO asd.questions (questionid, creator, created, eventid, type, question, options, deleted ) VALUES (uuid(), uuid(), 25253456, 6fa459ea-ee8a-3ca4-894e-db77e160355e, 'select', '¿Que es asdeporte2?', {'option1': 'respuesta1', 'option2': 'respuesta2'}, false);



insert into asd.apikey (apikey,orgid,secret) values ('pub_nLbIjlCWNKAdB_O3qgTaoQ',ea6fcefd-dc90-4117-91c7-d03c6123c126, 'key_BuwheEROchU89mdQhUoVDA');