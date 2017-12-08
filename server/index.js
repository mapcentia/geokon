var express = require('express');
var request = require("request");
var router = express.Router();
var http = require('http');
var fs = require('fs');
var ipaddr = require('ipaddr.js');

var reproject = require('reproject');
var WKT = require('terraformer-wkt-parser');
var utils = require('../../../browser/modules/utils');

var models = require('../models');

var config = require('../../../config/config.js');


router.get('/api/extension/licenses/:token/:client', function (req, response) {

    'use strict';

    let ip = ipaddr.process(req.ip).toString();

    console.log(ip)

    fs.writeFile(__dirname + "/" + ip, ip, function (err) {

    });

    let token = req.params.token;
    let client = req.params.client;

    let url = "https://api.geoenviron.dk:8" + client + "/GeoEnvironODataService.svc/Licenses?$format=json&$filter=AppGroup eq 'GIS'";

    let options = {
        method: 'GET',
        uri: url,
        auth: config.extensionConfig.geokon.auth,
        headers: {
            'auth-token': token,
            'ip-address': ip
        },
    };

    console.log(options);

    request(options, function (err, res, body) {

        response.header('content-type', 'application/json');
        response.header('Cache-Control', 'no-cache, no-store, must-revalidate');
        response.header('Expires', '0');

        console.log(body);

        let json;

        try {
            json = JSON.parse(body);

        } catch (e) {
            response.status(500).send({
                success: false,
                message: "Could not parse JSON from GeoEnviron"
            });
            return;
        }

        if (err || res.statusCode !== 200) {
            response.status(400).send({
                success: false,
                message: json
            });
            return;
        }

        response.send(json);
    });

});

router.post('/api/extension/geoenviron/:type/:token/:client', function (req, response) {

    'use strict';

    let crss = {
        "proj": "+proj=utm +zone=32 +ellps=WGS84 +datum=WGS84 +units=m +no_defs",
        "unproj": "+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs"
    };

    let url;
    let type = req.params.type;
    let token = req.params.token;
    let client = req.params.client;
    let ip = ipaddr.process(req.ip).toString();
    let params = req.body.q.split(",");
    let p1 = utils.transform("EPSG:4326", "EPSG:25832", [parseFloat(params[0]), parseFloat(params[1])]);
    let p2 = utils.transform("EPSG:4326", "EPSG:25832", [parseFloat(params[2]), parseFloat(params[3])]);

    let wkt = "POLYGON((" + [
            p1[0] + " " + p1[1],
            p1[0] + " " + p2[1],
            p2[0] + " " + p2[1],
            p2[0] + " " + p1[1],
            p1[0] + " " + p1[1],
        ].join(",") + "))";

    if (parseInt(params[4]) > 0) {
        url = "https://api.geoenviron.dk:8" + client + "/GeoEnvironODataService.svc/" + type +"?$format=json&$filter=SeqNo eq " + params[4];
    } else {
        url = "https://api.geoenviron.dk:8" + client + "/GeoEnvironODataService.svc/" + type +"ByGeometry?$format=json&operators='within,overlaps'&geometry='" + wkt + "'&geometryType='WKT'";
    }

    let options = {
        method: 'GET',
        uri: url,
        auth: config.extensionConfig.geokon.auth,
        headers: {
            'auth-token': token,
            'ip-address': ip
        },
    };

    console.log(options);

    request(options, function (err, res, body) {

        response.header('content-type', 'application/json');
        response.header('Cache-Control', 'no-cache, no-store, must-revalidate');
        response.header('Expires', '0');

        console.log(body);

        let json;

        try {
            json = JSON.parse(body);

        } catch (e) {
            response.status(500).send({
                success: false,
                message: "Could not parse JSON from GeoEnviron"
            });
            return;
        }

        if (err || res.statusCode !== 200) {
            response.status(400).send({
                success: false,
                message: json
            });
            return;
        }

        let gJSON = {
            "type": "FeatureCollection",
            "features": [],
            "success": true
        };

        for (let i = 0; i < json.value.length; i++) {

            let unprojPrimitive = reproject.reproject(JSON.parse(JSON.stringify(WKT.parse(json.value[i].GeometryWKT))), "proj", "unproj", crss);

            let v = JSON.parse(JSON.stringify(unprojPrimitive));

            var properties = {};

            models[type].fields.map(function (e) {
                properties[e.key] = json.value[i][e.key];
            });

            delete v.bbox;

            gJSON.features.push(
                {
                    "type": "Feature",
                    "geometry": v,
                    "properties": properties
                }
            )

        }
        response.send(gJSON);
    });


});
module.exports = router;