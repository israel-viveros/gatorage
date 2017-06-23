"use strict";
import mysql from "mysql";
import async from "async";
import {remove as removeDiacritics} from "diacritics";
import json2csv from "json2csv";

exports.post = (req, res) => {
  let history,
    thisYear,
    all = {},
    final = {},
    numbers = {},
    csv = [],
    workers = 20;
  const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'asd'
  });

  let searching = (user, next) => {
    user.name = removeDiacritics(user.name).toLowerCase().trim().replace(/\./g, "");
    user.last_name = removeDiacritics(user.last_name).toLowerCase().trim().replace(/\./g, "");
    user.last_name2 = removeDiacritics(user.last_name2).toLowerCase().trim().replace(/\./g, "");
    console.log(`Comparing ${user.name} ${user.last_name}...`);
    Object.keys(history).forEach(function (key) {
      if (history[key].last_name === user.last_name && history[key].last_name2 === user.last_name2 && ( history[key].first_name === user.name || (history[key].first_name + ' ' + history[key].second_name === user.name) )) {
        if (typeof all[user.number] === "undefined") {
          all[user.number] = [history[key]];
        } else {
          let flag = true;
          all[user.number].map((item) => {
            if (item.event === history[key].event) {
              flag = false;
            }
          });
          if (flag) {
            all[user.number].push(history[key]);
          }
        }
      }
    });
    next();
  };

  async.auto({
    getHistory: (cb) => {
      console.log("get data from history...");
      let query = 'SELECT first_name,second_name, last_name, last_name2, event, number  FROM history';
      connection.query(query, (error, results) => {
        if (error) {
          console.log("something went wrong in history");
          cb(true);
        } else {
          history = results;
          cb();
        }
      });
    },
    normalizeHistory: (cb) => {
      Object.keys(history).forEach(function (key) {
        history[key].first_name = removeDiacritics(history[key].first_name).toLowerCase().trim().replace(/\./g, "");
        history[key].second_name = removeDiacritics(history[key].second_name).toLowerCase().trim().replace(/\./g, "");
        history[key].last_name = removeDiacritics(history[key].last_name).toLowerCase().trim().replace(/\./g, "");
        history[key].last_name2 = removeDiacritics(history[key].last_name2).toLowerCase().trim().replace(/\./g, "");
        history[key].event = removeDiacritics(history[key].event).toLowerCase().trim();
      });
      cb();
    },
    getThisYear: (cb) => {
      console.log("get information from this year...");
      let query = 'SELECT name,last_name,last_name2, number  FROM thisyear';
      connection.query(query, (error, results) => {
        if (error) {
          console.log("something went wrong in this year");
          cb(true);
        } else {
          thisYear = results;
          cb(null);
        }
      });
    },
    compare: (cb) => {
      console.log("comparing data...");
      let q = async.queue((task, callback) => {
        searching(task, () => {
          callback();
        });
      }, workers);

      Object.keys(thisYear).forEach(function (key) {
        q.push(thisYear[key]);
      });

      q.drain = () => {
        console.log("end comparasion...");
        cb();
      }
    },
    parseAndRemove: (cb) => {
      console.log("parsing and removing...");
      numbers = {
        '45K': 0,
        '60K': 0,
        '75K': 0,
        '90K': 0
      };
      Object.keys(all).forEach((item) => {
        if (all[item].length > 1) {
          final[item] = all[item];
          switch (all[item].length) {
            case 2:
              numbers['45K'] += 1;
              break;
            case 3:
              numbers['60K'] += 1;
              break;
            case 4:
              numbers['75K'] += 1;
              break;
            case 5:
              numbers['90K'] += 1;
              break;
            case 6:
              numbers['90K'] += 1;
              break;
            case 7:
              numbers['90K'] += 1;
              break;
          }
        }
      });
      cb();
    },
    toCVS: (cb)=>{
      Object.keys(final).forEach((key)=>{
        let name = `${final[key][0].first_name} ${final[key][0].second_name} ${final[key][0].last_name} ${final[key][0].last_name2}`,
          kil =  (final[key].length + 1) * 15,
          carrers = "";
        final[key].map((item)=>{
          carrers += item.event.match(/\((.*)\)/).pop() + ',';
        });
        csv.push({
          numero: key,
          nombre: name.replace(/\s\s+/g, ' ').toUpperCase(),
          medalla: `${kil} KM`,
          carreras: carrers.slice(0, -1)
        });
      });
       cb();
    }
  }, 1, (err, result) => {
    console.log("ending...");
    res.status(200).json(csv);
     // res.status(200).render('index', {
     //   medallas: numbers,
     //   participantes: final
     // });
  });


};

