#!/bin/bash
sleep 10
until cqlsh cassandra --request-timeout 5 -f /db/db_drop.cql && cqlsh cassandra --request-timeout 20 -f /db/db.cql
do
  sleep 1
done
