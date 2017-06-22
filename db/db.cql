CREATE KEYSPACE IF NOT EXISTS asd WITH replication = {'class': 'SimpleStrategy', 'replication_factor':1};

CREATE TABLE asd.apikey (
    apikey text PRIMARY KEY,
    created int,
    orgid uuid,
    secret text
);
