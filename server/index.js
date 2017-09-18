var express = require('express');
var request = require("request");
var router = express.Router();
var http = require('http');
var fs = require('fs');

var reproject = require('reproject');
var WKT = require('terraformer-wkt-parser');
var utils = require('../../../../browser/modules/utils');

var config = require('../../../../config/config.js');


router.post('/api/extension/geoenviron/', function (req, response) {

    'use strict';

    var crss = {
        "proj": "+proj=utm +zone=32 +ellps=WGS84 +datum=WGS84 +units=m +no_defs",
        "unproj": "+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs"
    };

    var seqNoType = req.body.q.split(",")[4];
    var bbox = req.body.q.split(",");
    var p1 = utils.transform("EPSG:4326", "EPSG:25832", [bbox[0], bbox[1]]);
    var p2 = utils.transform("EPSG:4326", "EPSG:25832", [bbox[2], bbox[3]]);

    var wkt = "POLYGON((" + [
            p1[0] + " " + p1[1],
            p1[0] + " " + p2[1],
            p2[0] + " " + p2[1],
            p2[0] + " " + p1[1],
            p1[0] + " " + p1[1],
        ].join(",") + "))";

    var url = "https://mapcentia-api.geoenviron.dk/GeoEnvironODataService.svc/GetGeometries?$format=json&operators='within,overlaps'&geometryWKT='" + wkt + "'&$filter=";

    var filter = "SeqNoType eq '" + seqNoType + "'";

    //console.log(url)

    var options = {
        method: 'GET',
        uri: url + filter,
        auth: config.extensionConfig.geokon.auth
    };

    request(options, function (err, res, body) {

        response.header('content-type', 'application/json');
        response.header('Cache-Control', 'no-cache, no-store, must-revalidate');
        response.header('Expires', '0');


        //console.log(body);

        var gJSON = {
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

        var json;
        try {
            json = JSON.parse(body);

        } catch (e) {
            response.status(500).send({
                success: false,
                message: "Could not parse JSON from GeoEnviron"
            });
            return;
        }


        for (var i = 1; i < json.value.length; i++) {
            // console.log(json.value[i]);

            var unprojPrimitive = reproject.reproject(JSON.parse(JSON.stringify(WKT.parse(json.value[i].GeometryWKT))), "proj", "unproj", crss);

            var v = JSON.parse(JSON.stringify(unprojPrimitive));

            delete v.bbox;

            gJSON.features.push(
                {
                    "type": "Feature",
                    "geometry": v,
                    "properties": {
                       "SeqNo": json.value[i].SeqNo,
                       // "Name": json.value[i].Name
                    }
                }
            )

        }



        response.send(gJSON);
    });


});
module.exports = router;