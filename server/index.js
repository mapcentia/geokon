var express = require('express');
var request = require("request");
var router = express.Router();
var http = require('http');
var fs = require('fs');

var reproject = require('reproject');
var WKT = require('terraformer-wkt-parser');
var utils = require('../../../browser/modules/utils');

var models = require('../models');

var config = require('../../../config/config.js');

router.post('/api/extension/geoenviron/:type', function (req, response) {

    'use strict';

    let crss = {
        "proj": "+proj=utm +zone=32 +ellps=WGS84 +datum=WGS84 +units=m +no_defs",
        "unproj": "+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs"
    };

    let type = req.params.type;
    let bbox = req.body.q.split(",");
    let p1 = utils.transform("EPSG:4326", "EPSG:25832", [bbox[0], bbox[1]]);
    let p2 = utils.transform("EPSG:4326", "EPSG:25832", [bbox[2], bbox[3]]);

    let wkt = "POLYGON((" + [
            p1[0] + " " + p1[1],
            p1[0] + " " + p2[1],
            p2[0] + " " + p2[1],
            p2[0] + " " + p1[1],
            p1[0] + " " + p1[1],
        ].join(",") + "))";

    let url = "https://mapcentia-api.geoenviron.dk/GeoEnvironODataService.svc/" + type +"ByGeometry?$format=json&operators='within,overlaps'&geometry='" + wkt + "'&geometryType='WKT'";

    //let filter = "SeqNoType eq '" + seqNoType + "'";

    console.log(url)

    let options = {
        method: 'GET',
        uri: url,
        auth: config.extensionConfig.geokon.auth,
        headers: {
            'auth-token': config.extensionConfig.geokon.headers.token,
            'ip-address': config.extensionConfig.geokon.headers.ip
        },
    };

    request(options, function (err, res, body) {

        response.header('content-type', 'application/json');
        response.header('Cache-Control', 'no-cache, no-store, must-revalidate');
        response.header('Expires', '0');


        console.log(body);

        let gJSON = {
            "type": "FeatureCollection",
            "features": [],
            "success": true
        };

        if (res.statusCode !== 200) {
            response.status(400).send({
                success: false,
                message: "Got an error from GeoEnviron"
            });
            return;
        }

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

        //console.log(models.Companies)

        for (let i = 1; i < json.value.length; i++) {
            //console.log(json.value[i]);

            let unprojPrimitive = reproject.reproject(JSON.parse(JSON.stringify(WKT.parse(json.value[i].GeometryWKT))), "proj", "unproj", crss);

            let v = JSON.parse(JSON.stringify(unprojPrimitive));

            var properties = {};

            models.Companies.map(function (e) {
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