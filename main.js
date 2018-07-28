'use strict';

const async = require('async');
const GoogleSpreadsheet = require('google-spreadsheet');
const creds = require('./gallberrypi-5f8408f3f60b.json');
const googlehome = require('google-home-notifier');


async.waterfall([
	// スプレッドシートの取得
	function(callback) {
		var spreadsheet = new GoogleSpreadsheet('1ZJsgzdhiSKURNmAhzjBOmykhK2GNiVKPBwDLaI1bHL4');
		spreadsheet.useServiceAccountAuth(creds, function(err) {
			spreadsheet.getInfo(function(err, info) {
				//console.log(info.worksheets);
				callback(err, info.worksheets[0]);
			});
		});
	},
	// メッセージの取得
	function(sheet, callback) {
		// 該当時刻のメッセージ検索
		var now = new Date();
		var query = ['h=' + now.getHours(), 'm=' + now.getMinutes()]
		switch (now.getDay()) {
			case 0:
				query.push('sun=1');
				break;
			case 1:
				query.push('mon=1');
				break;
			case 2:
				query.push('tue=1');
				break;
			case 3:
				query.push('wed=1');
				break;
			case 4:
				query.push('thu=1');
				break;
			case 5:
				query.push('fri=1');
				break;
			case 6:
				query.push('sat=1');
				break;
			default:
				break;
		}
		sheet.getRows({
			//query: 'h=' + now.getHours() + ' and m=' + now.getMinutes(),
			query: query.join(' and '),
			limit: 1
		}, function(err, rows) {
			if (rows.length == 1) {
				console.log(rows[0].message);
				callback(err, rows[0].message);
			} else {
				callback(err, null);
			}
		});
	},
	// Google Homeへメッセージ送出
	function(msg, callback) {
		if (msg !== null) {
			googlehome.ip('192.168.1.4');
			googlehome.device('Google Home', 'ja');
			googlehome.notify(msg, function(res) {
				console.log(res);
			});
		}
	},
	function(err) {
		if (err) console.log(err);
	}
]);

