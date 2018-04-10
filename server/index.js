var express = require('express');
var request = require("request");
var router = express.Router();
var http = require('http');
var fs = require('fs');
var ipaddr = require('ipaddr.js');
var moment = require('moment');

var reproject = require('reproject');
var WKT = require('terraformer-wkt-parser');
var utils = require('../../../browser/modules/utils');

var models = require('../models');

var config = require('../../../config/config.js');


router.get('/api/extension/licenses/:token/:client', function (req, response) {

    'use strict';

    let ip = ipaddr.process(req.ip).toString();

    //console.log(ip)

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

    //console.log(options);

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
        url = "https://api.geoenviron.dk:8" + client + "/GeoEnvironODataService.svc/" + type + "?$format=json&$filter=SeqNo eq " + params[4];
    } else {
        url = "https://api.geoenviron.dk:8" + client + "/GeoEnvironODataService.svc/" + type + "ByGeometry?$format=json&operators='within,overlaps'&geometry='" + wkt + "'&geometryType='WKT'";
    }

    console.log(url);

    let options = {
        method: 'GET',
        uri: url,
        auth: config.extensionConfig.geokon.auth,
        headers: {
            'auth-token': token,
            'ip-address': ip
        },
    };

    //console.log(options);

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

            var v = null, properties = {};

            // Test
            //json.value[i].GeometryWKT = null;

            if (json.value[i].GeometryWKT !== null) {
                let unprojPrimitive = reproject.reproject(JSON.parse(JSON.stringify(WKT.parse(json.value[i].GeometryWKT))), "proj", "unproj", crss);

                v = JSON.parse(JSON.stringify(unprojPrimitive));

                delete v.bbox;
            }

            models[type].fields.map(function (e) {
                properties[e.key] = json.value[i][e.key];
            });

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

router.put('/api/extension/geoenviron/:type/:token/:client', function (req, response) {

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

    let seqNo = req.body.seqNo;
    let seqNoType = req.body.seqNoType;
    let geometryWKT = req.body.geometryWKT;


    let json = {
        "GeometryWKT": geometryWKT,
        "SeqNo": seqNo,
        "SeqNoType": seqNoType
    };


    url = "https://api.geoenviron.dk:8" + client + "/GeoEnvironODataService.svc/Geometries";

    let options = {
        method: 'POST',
        uri: url,
        auth: config.extensionConfig.geokon.auth,
        json: json,
        headers: {
            'auth-token': token,
            'ip-address': ip
        },
    };

    //console.log(options);

    request(options, function (err, res, body) {

        response.header('content-type', 'application/json');
        response.header('Cache-Control', 'no-cache, no-store, must-revalidate');
        response.header('Expires', '0');

        if (err || res.statusCode !== 201) {
            response.status(400).send({
                success: false,
                message: body
            });
            return;
        }

        response.send(body);
    });


});

router.delete('/api/extension/geoenviron/:type/:token/:client/:geometries', function (req, response) {

    'use strict';
    let url;
    let token = req.params.token;
    let client = req.params.client;
    let geometries = req.params.geometries;
    let ip = ipaddr.process(req.ip).toString();

    url = "https://api.geoenviron.dk:8" + client + "/GeoEnvironODataService.svc/Geometries" + geometries;

    console.log(url)

    let options = {
        method: 'DELETE',
        uri: url,
        auth: config.extensionConfig.geokon.auth,
        headers: {
            'auth-token': token,
            'ip-address': ip
        },
    };

    request(options, function (err, res, body) {

        response.header('content-type', 'application/json');
        response.header('Cache-Control', 'no-cache, no-store, must-revalidate');
        response.header('Expires', '0');

        if (err || res.statusCode !== 204) {
            response.status(400).send({
                success: false,
                message: body
            });
            return;
        }

        response.status(200).send({
            success: true
        });
    });


});

router.post('/api/extension/conflict/:token/:client', function (req, response) {

    'use strict';

    let url;
    let token = req.params.token;
    let client = req.params.client;
    let ip = ipaddr.process(req.ip).toString();
    let wkt = req.body.wkt;
    let socketId = req.body.socketId;
    let modelsKeys = [];
    let count = 0;
    let type;
    let hit;
    let hits = {};

    response.header('content-type', 'application/json');
    response.header('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.header('Expires', '0');


    for (var key in models) {
        if (models.hasOwnProperty(key)) {
            modelsKeys.push(key);
        }
    }


    (function iter() {
        let startTime = new Date().getTime();

        type = modelsKeys[count];
        url = "https://api.geoenviron.dk:8" + client + "/GeoEnvironODataService.svc/" + type + "ByGeometry?$format=json&operators='within,overlaps'&geometry='" + wkt + "'&geometryType='WKT'";
        console.log(url)

        let options = {
            method: 'GET',
            uri: url,
            auth: config.extensionConfig.geokon.auth,
            headers: {
                'auth-token': token,
                'ip-address': ip
            },
        };

        request(options, function (err, res, body) {

            let json, time = new Date().getTime() - startTime, error;

            try {
                json = JSON.parse(body);

            } catch (e) {
                error = body;
            }

            console.log(res.statusCode)
            if (err || res.statusCode !== 200) {
                error = json;
                json.value=[];
            }

            for (let i = 0; i < json.value.length; i++) {
                console.log(json.value[i])

            }

            hit = {
                table: type,
                title: models[modelsKeys[count]].alias,
                hits: json.value.length,
                data: json.value,
                num: (count+1) + "/" +modelsKeys.length,
                time: time,
                id: socketId,
                error: error || null,
                message: "",

            };
            hits[type] = hit;
            io.emit(socketId, hit);

            count++;

            if (count === modelsKeys.length) {
                var report = {
                    hits: hits,
                    dateTime: moment().format('MMMM Do YYYY, H:mm')
                };
                response.send(report);
            } else {
                iter();
            }
        });



    })();
});


module.exports = router;