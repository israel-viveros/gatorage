#!/bin/bash
until cqlsh --request-timeout 5 -f $(pwd)/db/db_drop.cql && cqlsh --request-timeout 10 -f $(pwd)/db/db.cql
do
  sleep 1
done
