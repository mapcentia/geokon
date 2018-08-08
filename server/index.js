var express = require('express');
var request = require("request");
var router = express.Router();
var http = require('http');
var fs = require('fs');
var ipaddr = require('ipaddr.js');
var escape = require('pg-escape');

var reproject = require('reproject');
var WKT = require('terraformer-wkt-parser');
var utils = require('../../../browser/modules/utils');

var TerraformerParser = require('terraformer-wkt-parser');
var Terraformer = require('terraformer');

var config = require('../../../config/config.js');

var models = {};


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

router.get('/api/extension/geoenviron/all/:type/:client', function (req, response) {

    'use strict';

    let url;
    let type = req.params.type;
    let token = config.extensionConfig.geokon.permaToken;
    let client = req.params.client;
    //let ip = ipaddr.process(req.ip).toString();

    url = "https://api.geoenviron.dk:8" + client + "/GeoEnvironODataService.svc/" + type + "?$format=json&";

    let options = {
        method: 'GET',
        uri: url,
        auth: config.extensionConfig.geokon.auth,
        headers: {
            'auth-token': token,
            //'ip-address': ip
        },
    };

    request(options, function (err, res, body) {

        response.header('content-type', 'application/json');
        response.header('Cache-Control', 'no-cache, no-store, must-revalidate');
        response.header('Expires', '0');

        let json;

        try {
            json = JSON.parse(body);
        } catch (e) {
            response.status(500).send({
                success: false,
                message: "Could not parse JSON from GeoEnviron",
                data: body
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

            if (json.value[i].GeometryWKT !== null) {

                v = JSON.parse(JSON.stringify(WKT.parse(json.value[i].GeometryWKT)));

                delete v.bbox;
            }

            models[client][type].fields.map(function (e) {
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

router.post('/api/extension/geoenviron/:type/:token/:client/:filter', function (req, response) {

    'use strict';

    let crss = {
        "proj": "+proj=utm +zone=32 +ellps=WGS84 +datum=WGS84 +units=m +no_defs",
        "unproj": "+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs"
    };

    let geFilter = null;
    let url;
    let top;
    let type = req.params.type;
    let token = req.params.token;
    let client = req.params.client;
    let filter = req.params.filter;
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
        console.log("TEST: " + models[client][type].maxCount)

        if(models[client][type].hasOwnProperty("maxCount")){
            top = models[client][type].maxCount;
        } else {
            top = 99999999;
        }

        url = "https://api.geoenviron.dk:8" + client + "/GeoEnvironODataService.svc/" + type + "ByGeometry?$format=json&operators='within,overlaps'&geometry='" + wkt + "'&geometryType='WKT'&$top=" + top;

        if (filter !== "" && filter !== "none") {
            geFilter = Buffer.from(filter, 'base64').toString();
            url += "&$filter=" + geFilter;
        }

        console.log(geFilter);
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

    //console.log(options);

    request(options, function (err, res, body) {

        response.header('content-type', 'application/json');
        response.header('Cache-Control', 'no-cache, no-store, must-revalidate');
        response.header('Expires', '0');

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

            models[client][type].fields.map(function (e) {
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

router.post('/api/extension/conflict/:token/:client/:id', function (req, response) {
    'use strict';
    let url;
    let token = req.params.token;
    let client = req.params.client;
    let ip = ipaddr.process(req.ip).toString();
    let wkt = req.body.wkt;
    let socketId = req.body.socketId;
    let modelsKeys = [];
    let alias = [];
    let count = 0;
    let type;
    let title;
    let createSqls = [];
    let model = models[client];
    let sessionData;
    let id = req.params.id;

    // Get bbox from buffer. GE can't handle to many nodes
    let geojson = TerraformerParser.parse(wkt);
    var polygon = new Terraformer.Primitive(geojson);
    var bbox = polygon.bbox();
    wkt = "POLYGON((" + bbox[0] + " " + bbox[1] + "," + bbox[0] + " " + bbox[3] + "," + bbox[2] + " " + bbox[3] + "," + bbox[2] + " " + bbox[1] + "," + bbox[0] + " " + bbox[1] + "))";

    response.header('content-type', 'application/json');
    response.header('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.header('Expires', '0');

    for (var key in model) {
        if (model.hasOwnProperty(key)) {
            modelsKeys.push(key);
            alias.push(model[key].alias);
            let createSql = "CREATE TABLE conflict." + id + "_" + key + " (";
            createSql += "gid serial,";
            model[key].fields.map(function (e) {
                createSql += "\"" + e.key + "\"" + " character varying, ";
            });
            if (model[key].geometryType === "point") {
                createSql += "the_geom geometry(Point,4326)";
            } else {
                createSql += "the_geom geometry(Polygon,4326)";
            }
            createSql += ")";
            createSqls.push(createSql);
        }
    }

    let postData = "u=" + config.extensionConfig.geokon.gc2.database + "&p=" + config.extensionConfig.geokon.gc2.pw + "&s=conflict";

    let options = {
        method: 'POST',
        uri: config.gc2.host + "/api/v1/session/start",
        form: postData
    };

    request(options, function (err, res, body) {

        if (err || res.statusCode !== 200) {
            response.status(401).send({
                success: false,
                message: "Could not log in"
            });
            return;
        }

        try {
            sessionData = JSON.parse(body);
        } catch (e) {
            response.status(500).send({
                success: false,
                message: "Could not parse response from GC2 session API",
                data: body
            });
            return;
        }

        console.log("Session started:");
        console.log(sessionData);

        let allSqlsStr = createSqls.join("\n");
        console.log(allSqlsStr);

        let options = {
            method: 'POST',
            uri: config.gc2.host + "/api/v2/sql/geokon",
            body: allSqlsStr,
            headers: {
                "content-type": "text/plain",
                "GC2-API-KEY": sessionData.api_key
            }
        };

        let all = []; // test
        request(options, function (err, res, body) {
            let json;

            if (err || res.statusCode !== 200) {
                response.status(400).send({
                    success: false,
                    message: json
                });
                return;
            }

            try {
                json = JSON.parse(body);
            } catch (e) {
                response.status(500).send({
                    success: false,
                    message: "Could not parse JSON from GC2 SQL bulk API"
                });
                return;
            }

            // console.log(json);

            let noResults;

            (function iter() {
                if (count === modelsKeys.length) {

                    let url = "https://geokon.mapcentia.com/controllers/mapfile";

                    request({
                        method: 'GET',
                        uri: url,
                        headers: {
                            Cookie: "PHPSESSID=" + sessionData.session_id + ";" // GC2's private API is session based
                        }

                    }, function (err, res, body) {
                        response.send(all);
                    });

                } else {
                    noResults = true;
                    type = modelsKeys[count];
                    title = alias[count];
                    count++;
                    url = "https://api.geoenviron.dk:8" + client + "/GeoEnvironODataService.svc/" + type + "ByGeometry?$format=json&operators='within,overlaps'&geometry='" + wkt + "'&geometryType='WKT'";
                    let crss = {
                        "proj": "+proj=utm +zone=32 +ellps=WGS84 +datum=WGS84 +units=m +no_defs",
                        "unproj": "+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs"
                    };
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
                        let json;

                        console.log(body);

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

                        let insertSqls = [];

                        for (let i = 0; i < json.value.length; i++) {
                            let fields = [];
                            let values = [];
                            var v = null, properties = {};
                            noResults = false;
                            // Test
                            //json.value[i].GeometryWKT = null;
                            if (json.value[i].GeometryWKT !== null) {
                                var unprojPrimitive = reproject.reproject(JSON.parse(JSON.stringify(WKT.parse(json.value[i].GeometryWKT))), "proj", "unproj", crss);
                                v = JSON.parse(JSON.stringify(unprojPrimitive));
                                delete v.bbox;
                            }

                            model[type].fields.map(function (e) {
                                fields.push(e.key);
                                values.push(escape.literal(json.value[i][e.key]));
                            });

                            insertSqls.push("INSERT INTO conflict." + id + "_" + type + " (\"" + fields.join("\",\"") + "\", the_geom) VALUES(" + values.join(",") + ",ST_SetSRID(ST_GeomFromGeoJSON('" + JSON.stringify(unprojPrimitive) + "'),4326))");
                        }


                        let allSqlsStr = insertSqls.join("\n");

                        console.log(allSqlsStr);

                        let url = config.gc2.host + "/controllers/layer/records/conflict." + id + "_" + type.toLowerCase() + ".the_geom";
                        console.log(url);
                        let optionsProps = {
                            method: 'PUT',
                            url: url,
                            json: {
                                "data":
                                    {
                                        "f_table_title": title,
                                        "editable": true,
                                        "tags": [id],
                                        "layergroup": "Conflict",
                                        "meta": {single_tile: true},
                                        "class": [{
                                            "sortid": 10,
                                            "name": "Virksomheder",
                                            "expression": "",
                                            "label": false,
                                            "label_size": "",
                                            "label_color": "",
                                            "color": "",
                                            "outlinecolor": "#FFCC00",
                                            "style_opacity": "",
                                            "symbol": "",
                                            "angle": "",
                                            "size": "",
                                            "width": "3",
                                            "overlaycolor": "",
                                            "overlayoutlinecolor": "#FF0000",
                                            "overlaysymbol": "",
                                            "overlaysize": "",
                                            "overlaywidth": 1,
                                            "label_text": "",
                                            "label_position": "",
                                            "label_font": "",
                                            "label_fontweight": "",
                                            "label_angle": "",
                                            "label_backgroundcolor": "",
                                            "overlaystyle_opacity": "",
                                            "label_force": false,
                                            "id": 0,
                                            "class_minscaledenom": "",
                                            "class_maxscaledenom": "",
                                            "leader": false,
                                            "leader_gridstep": "",
                                            "leader_maxdistance": "",
                                            "leader_color": "",
                                            "pattern": "",
                                            "linecap": "",
                                            "geomtransform": "",
                                            "maxsize": "",
                                            "overlaypattern": "",
                                            "overlaylinecap": "",
                                            "overlayangle": "",
                                            "overlaygeomtransform": "(buffer([shape], 10))",
                                            "overlaymaxsize": "",
                                            "label_minscaledenom": "",
                                            "label_maxscaledenom": "",
                                            "label_outlinecolor": "",
                                            "label_buffer": "",
                                            "label_repeatdistance": "",
                                            "label_backgroundpadding": "",
                                            "label_offsetx": "",
                                            "label_offsety": "",
                                            "label_expression": "",
                                            "label_maxsize": "",
                                            "label_minfeaturesize": "",
                                            "label2": false,
                                            "label2_text": "",
                                            "label2_force": false,
                                            "label2_minscaledenom": "",
                                            "label2_maxscaledenom": "",
                                            "label2_position": "",
                                            "label2_size": "",
                                            "label2_font": "",
                                            "label2_fontweight": "",
                                            "label2_color": "",
                                            "label2_outlinecolor": "",
                                            "label2_buffer": "",
                                            "label2_repeatdistance": "",
                                            "label2_angle": "",
                                            "label2_backgroundcolor": "",
                                            "label2_backgroundpadding": "",
                                            "label2_offsetx": "",
                                            "label2_offsety": "",
                                            "label2_expression": "",
                                            "label2_maxsize": "",
                                            "label2_minfeaturesize": ""
                                        }],
                                        "_key_": "conflict." + id + "_" + type.toLowerCase() + ".the_geom"
                                    }
                            },
                            headers: {
                                Cookie: "PHPSESSID=" + sessionData.session_id + ";" // GC2's private API is session based
                            }
                        };
                        request(optionsProps, function (err, res, body) {

                            if (noResults) {
                                console.log("No results: " + type);
                                iter();
                            } else {
                                console.log("Results: " + type);
                                let url = config.gc2.host + "/api/v2/feature/geokon/conflict." + id + "_" + type.toLowerCase() + ".the_geom/4326";

                                let optionsBulkAPI = {
                                    method: 'POST',
                                    uri: config.gc2.host + "/api/v2/sql/geokon",
                                    body: allSqlsStr,
                                    headers: {
                                        "content-type": "text/plain",
                                        "GC2-API-KEY": sessionData.api_key
                                    }
                                };
                                request(optionsBulkAPI, function (err, res, body) {

                                    console.log(body)

                                    let json;
                                    if (err || res.statusCode !== 200) {
                                        response.status(400).send({
                                            success: false,
                                            message: body
                                        });
                                        return;
                                    }
                                    // try {
                                    //     json = JSON.parse(body);
                                    // } catch (e) {
                                    //     response.status(500).send({
                                    //         success: false,
                                    //         message: "Could not parse JSON from GC2 feature API"
                                    //     });
                                    //     return;
                                    // }
                                    iter();
                                });
                            }


                        });

                    });
                }
            })();

        });

    });


});

router.get('/api/extension/geoenviron/model/:token/:client', function (req, response) {

    //let client = req.params.client;
    //models[client] = require('../models');
    //response.send(models[client]);

    let client = req.params.client,
        url = "https://api.geoenviron.dk:8" + client + "/GeoEnvironODataService.svc/GetGisSettings?$format=json",
        ip = ipaddr.process(req.ip).toString(),
        token = req.params.token;

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

    request.get(options, function (err, res, body) {
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
            response.header('content-type', 'application/json');
            response.status(400).send({
                success: false,
                message: "Could not get the requested config JSON file."
            });
            return;
        }
        models[client] = JSON.parse(json.value);
        //console.log(models);
        response.send(json.value);
    })
});

module.exports = router;