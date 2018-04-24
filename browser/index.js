/**
 * @fileoverview Description of file, its uses and information
 * about its dependencies.
 */

'use strict';

/**
 *
 * @type {*|exports|module.exports}
 */
var cloud;

/**
 *
 * @type {*|exports|module.exports}
 */
var utils;

/**
 *
 * @type {*|exports|module.exports}
 */
var layers;

/**
 *
 * @type {*|exports|module.exports}
 */
var backboneEvents;

/**
 *
 * @type {*|exports|module.exports}
 */
var anchor;

/**
 *
 * @type {*|exports|module.exports}
 */
var urlVars = require('./../../../browser/modules/urlparser').urlVars;
var uriJs = require('./../../../browser/modules/urlparser').uriJs;

var mapObj;

var store = [];
var table = [];
var getypes;

var cl = [];

var licens;

var toolBar;

var jquery = require('jquery');
require('snackbarjs');

var io = require('socket.io-client');

var models;

var functions = require('../functions');

var template =
    '<div class="mouseover-content">' +
    '   {{#content.fields}}' +
    '       {{#title}}<h4>{{title}}</h4>{{/title}}' +
    '       {{#value}}' +
    '           <p {{#type}}class="{{ type }}"{{/type}}>{{{ value }}}</p>' +
    '       {{/value}}' +
    '       {{^value}}' +
    '           <p class="empty">null</p>' +
    '       {{/value}}' +
    '   {{/content.fields}}' +
    '</div>';

/**
 *
 * @type {string}
 */
var exId = "geoenviron";

var WKT = require('terraformer-wkt-parser');

var reproject = require('reproject');
var socketId;

/**
 *
 * @type {{set: module.exports.set, init: module.exports.init}}
 */

module.exports = module.exports = {

    /**
     *
     * @param o
     * @returns {exports}
     */
    set: function (o) {
        cloud = o.cloud;
        utils = o.utils;
        layers = o.layers;
        anchor = o.anchor;
        socketId = o.socketId;
        backboneEvents = o.backboneEvents;
        return this;
    },

    /**
     *
     */
    init: function () {

        var parentThis = this;

        var React = require('react');

        var ReactDOM = require('react-dom');

        var me = this;

        var visibleGeLayers = [];

        // Start listen to the web socket
        backboneEvents.get().on("on:conflict", function () {
            io.connect().on(socketId.get(), function (data) {
                if (typeof data.num !== "undefined") {
                    $("#conflict-ge-progress").html(data.num + " " + (data.title || data.table));
                    if (data.error === null) {
                        $("#conflict-ge-console").append(data.num + " table: " + data.table + ", hits: " + data.hits + " , time: " + data.time + "\n");
                    } else {
                        $("#conflict-ge-console").append(data.table + " : " + data.error + "\n");
                    }
                }
            });
        });

        $(document).arrive('[data-key]', function () {
            $(this).on("change", function (e) {
                parentThis.switchLayer($(this).data('key'), $(this).context.checked);
                e.stopPropagation();
            });
        });

        // Hide tabs
        $('a[href="#draw-content"]').hide();
        $('a[href="#print-content"]').hide();
        //$('a[href="#layer-content"]').hide();
        $('a[href="#streetview-content"]').hide();
        $(".custom-search").prop("disabled", true);

        mapObj = cloud.get().map;

        if (urlVars.seqno !== undefined && urlVars.type !== undefined) {

            var type, seqNoType;

            $.each(models, function (i, v) {
                if (v.seqNoType === urlVars.type.split("#")[0]) {
                    seqNoType = v.seqNoType;
                    type = i;
                    me.request(type, seqNoType, urlVars.seqno.split("#")[0])
                }
            });

        }

        // Listen to change in hash
        window.onhashchange = function () {
            var type, seqNoType, urlVars, getypes;

            urlVars = (function getUrlVars() {
                var mapvars = {};
                var parts = window.location.hash.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
                    mapvars[key] = value;
                });
                return mapvars;
            })();

            $.each(models, function (i, v) {

                try {
                    if (v.seqNoType === urlVars.type.split("#")[0]) {
                        seqNoType = v.seqNoType;
                        type = i;
                        me.request(type, seqNoType, urlVars.seqno.split("#")[0])
                    }
                } catch (e) {
                    console.error(e.message)
                }

                try {
                    // Get GE types from hash
                    if (urlVars.getypes !== undefined) {
                        getypes = urlVars.getypes.split(",");

                    } else {
                        getypes = [];
                    }

                    if (getypes.length > 0) {
                        getypes = getypes.map(function (e) {
                            return e.split("#")[0];
                        });
                    }

                    if (getypes.indexOf(v.seqNoType) !== -1) {
                        let cb = $('*[data-seqnotype="' + v.seqNoType + '"]');
                        if (!cb.is(':checked')) {
                            parentThis.request(i);
                            cb.prop('checked', true);
                        }
                    }
                } catch (e) {
                    console.error(e.message)
                }
            });


        };

        var dict = {

            "Info": {
                "da_DK": "GeoEnviron extension",
                "en_US": "GeoEnviron extension"
            },

            "GeoEnviron": {
                "da_DK": "GeoEnviron",
                "en_US": "GeoEnviron"
            },

            "Activate": {
                "da_DK": "Aktiver",
                "en_US": "Activate"
            },


            "Clear map": {
                "da_DK": "Ryd kort",
                "en_US": "Clear map"
            },


        };

        utils.createMainTab(exId, utils.__("GeoEnviron", dict), utils.__("Info", dict), require('./../../../browser/modules/height')().max);

        // Get GE types from URL param
        if (urlVars.getypes) {
            getypes = urlVars.getypes.split(",");

        } else {
            getypes = [];
        }

        if (getypes.length > 0) {
            getypes = getypes.map(function (e) {
                return e.split("#")[0];
            });
        }

        // Get GE layers from URL param
        if (urlVars.gelayers) {
            visibleGeLayers = urlVars.gelayers.split(",");

        } else {
            visibleGeLayers = [];
        }

        if (visibleGeLayers.length > 0) {
            visibleGeLayers = visibleGeLayers.map(function (e) {
                return e.split("#")[0];
            });
        }

        var entities = [];

        this.switchLayer = function (layer, visible) {
            let el = $('*[data-key="' + layer + '"]');
            if (visible) {
                visibleGeLayers.push(layer);
                parentThis.request(layer);
                el.prop('checked', true);

            } else {
                let index = visibleGeLayers.indexOf(layer);
                if (index > -1) {
                    visibleGeLayers.splice(index, 1);
                }
                parentThis.clear(layer);
                el.prop('checked', false);
            }

            var str = visibleGeLayers.join(",");

            if (str.substring(0, 1) === ',') {
                str = str.substring(1);
            }

            var uriObj = new uriJs(window.location.href);
            uriObj.setSearch("gelayers", str);
            window.history.pushState('', '', uriObj.toString());
            console.log("GEMessage:gelayers:" + str);

        };

        $.ajax({
            dataType: 'json',
            url: '/api/extension/geoenviron/model/' + urlVars.client,
            type: "GET",
            success: function (response) {

                console.log(response);

                models = response;

                $.each(models, function (i, v) {
                    entities.push({
                        "type": i,
                        "title": v.alias,
                        "color": v.color,
                        "seqNoType": v.seqNoType,
                        "show": (getypes.indexOf(v.seqNoType) !== -1)
                    })
                });

                backboneEvents.get().on("end:conflictSearch", function (e) {

                    let token = urlVars.token;
                    let client = urlVars.client;

                    jquery.snackbar({
                        id: "snackbar-ge-conflict",
                        content: "<span id='conflict-ge-progress'>" + __("Waiting to start....") + "</span>",
                        htmlAllowed: true,
                        timeout: 1000000
                    });

                    $.ajax({
                        dataType: 'json',
                        url: '/api/extension/conflict/' + token + '/' + client,
                        type: "POST",
                        data: "wkt=" + e.projWktWithBuffer + "&socketId=" + socketId.get(),
                        success: function (response) {
                            let row, hitsTable = $("#hits table"), noHitsTable = $("#nohits table");
                            $.each(response.hits, function (i, v) {
                                row = "<tr><td>" + v.title + "</td><td>" + v.hits + "</td><td><div class='checkbox'><label><input type='checkbox' data-key='" + i + "' " + ($.inArray(i, visibleGeLayers) > -1 ? "checked" : "") + "></label></div></td></tr>";

                                if (v.hits > 0) {
                                    hitsTable.append(row);
                                } else {
                                    noHitsTable.append(row);
                                }
                            });

                            console.log("GEMessage:conflictId:" + e.file)

                        },
                        error: function (error) {
                            console.error(error.responseJSON.message);
                        },
                        complete: function () {
                            jquery("#snackbar-ge-conflict").snackbar("hide");
                        }
                    });
                });

                backboneEvents.get().on("end:conflictSearchPrint", function (e) {
                    console.log("GEMessage:pdfId:" + "/tmp/print/pdf/" + e.key + ".pdf")

                });



                class Licenses extends React.Component {
                    constructor(props) {
                        super(props);

                        this.listLicenses = props.licenses.map((license) =>

                            <li key={license.AppCode}>{license.AppDescription} {license.AppActive}</li>
                        )
                    }

                    render() {
                        return (
                            <ul>
                                {this.listLicenses}
                            </ul>
                        )
                    }
                }

                class Functions extends React.Component {
                    constructor(props) {
                        super(props);

                        this.listFunctions = props.functions.map((func) =>

                            <li key={func}>{func}</li>
                        );

                    }

                    render() {
                        return (
                            <ul>
                                {this.listFunctions}
                            </ul>
                        )
                    }
                }

                class GeoEnviron extends React.Component {

                    constructor(props) {

                        super(props);

                        this.state = {};

                        this.vWidth = {
                            width: "calc(100% - 50px)"
                        };

                        this.hand = {
                            cursor: "pointer"
                        };

                        this.switch = this.switch.bind(this);

                        this.licenses = props.licenses.value;
                        this.functions = props.functions;
                        this.listEntities = props.entities.map((entity) =>

                            <li key={entity.type} className="layer-item list-group-item">
                                <div className="checkbox">
                                    <label className="overlay-label" style={this.vWidth}>
                                        <input
                                            type="checkbox" data-key={entity.type} data-seqnotype={entity.seqNoType}
                                            data-title={entity.title}
                                            onChange={this.switch} defaultChecked={entity.show}/>
                                        <span style={{
                                            backgroundColor: entity.color,
                                            display: "inline-block",
                                            width: "15px",
                                            height: "15px",
                                            marginRight: "5px",
                                            verticalAlign: "middle",
                                            top: "-2px",
                                            position: "relative"
                                        }}/>
                                        {entity.title}
                                    </label>
                                    <span className="geoenviron-table-label label label-primary"
                                          style={this.hand}>Table</span>
                                </div>
                            </li>
                        )
                    }

                    componentDidMount() {

                        var me = this;
                        $.each(models, function (i, v) {
                            if (getypes.indexOf(v.seqNoType) !== -1) {
                                me.switch({
                                    target: {
                                        dataset: {
                                            key: i
                                        },
                                        checked: true
                                    }
                                });
                            }
                        });

                        $.each(visibleGeLayers, function (i, v) {
                            $('*[data-key="' + v + '"]').prop('checked', true);
                            parentThis.request(v);
                        });

                    }

                    switch(e) {

                        //parentThis.switchLayer(e.target.dataset.key, e.target.checked)

                    }

                    render() {
                        return (
                            <div role='tabpanel'>
                                <div className='panel panel-default'>
                                    <div className='panel-body'>
                                        <ul className="list-group">
                                            {this.listEntities}
                                        </ul>
                                        {/*<Licenses licenses={this.licenses}/>*/}
                                        {/*<Functions functions={this.functions}/>*/}

                                    </div>
                                </div>
                            </div>
                        );
                    }
                }


                me.getLicens().then(
                    function (licenses) {

                        licens = "none";

                        for (let i = 0; i < licenses.value.length; i++) {
                            if (licenses.value[i].AppActive === "1" && licenses.value[i].AppCode === "gisbasis") {
                                licens = licenses.value[i].AppCode;
                            }
                        }
                        for (let i = 0; i < licenses.value.length; i++) {
                            if (licenses.value[i].AppActive === "1" && licenses.value[i].AppCode === "gispro") {
                                licens = licenses.value[i].AppCode;
                            }
                        }
                        for (let i = 0; i < licenses.value.length; i++) {
                            if (licenses.value[i].AppActive === "1" && licenses.value[i].AppCode === "gispremium") {
                                licens = licenses.value[i].AppCode;
                            }
                        }

                        // Test
                        //licens = "gisbasis";

                        console.log(licens);

                        $("#ge-licenses").html(licens);

                        if (licens === "none") {
                            return;
                        }

                        if (licens === "gisbasis" || licens === "gispro" || licens === "gispremium") {
                            $('a[href="#layer-content"]').show();
                            $(".custom-search").prop("disabled", false);
                        }

                        if (licens === "gispro" || licens === "gispremium") {
                            $('a[href="#streetview-content"]').show();
                        }

                        let fn = [];

                        for (const [key, value] of Object.entries(functions)) {
                            if (value[licens]) {
                                fn.push(key);
                            }
                        }


                        ReactDOM.render(
                            <GeoEnviron entities={entities} licenses={licenses} functions={fn}/>,
                            document.getElementById(exId)
                        );


                        $(".geoenviron-table-label").on("click", function (e) {
                            let type = ($(this).prev().children("input").data('key'));
                            let title = ($(this).prev().children("input").data('title'));
                            $(".geoenviron-attr-table").hide();
                            $("#" + type).show();
                            $("#info-modal").animate({right: "0"}, 200);
                            $("#info-modal .modal-title").html(title);
                            e.stopPropagation();
                        });

                    },

                    function (e) {
                        //alert(e)
                    }
                );

            },
            error: function (error) {
                alert("Kunne ikke hente opsætning fra GE");
            },
            complete: function () {

            }
        });


    },

    request: function (type, seqNoType, seqNo) {

        let me = this;
        let seq = seqNo !== undefined ? seqNo : -999;
        let id = seqNo !== undefined ? "s_" + type : type;
        let cm = [];
        let marker;

        // Set auth
        let token = urlVars.token;
        let client = urlVars.client;

        if (token === undefined || client === undefined) {
            alert("Auth token or client not set");
            return;
        }

        try {
            store[id].reset();
        } catch (e) {
        }

        // events
        cloud.get().map.on("editable:editing", function () {
            //alert("editable:editing");
        });

        $.each(models[type].fields, function (i, v) {
            cm.push({
                header: v.alias,
                dataIndex: v.key,
                sortable: true,
                link: v.link
            });
        });

        $("div").remove("#" + type);
        $("#info-modal-body-wrapper .modal-body").append('<div class="geoenviron-attr-table" id="' + type + '"><table id="geoenviron-table_' + type + '" data-detail-view="true" data-detail-formatter="detailFormatter" data-show-toggle="true" data-show-export="true" data-show-columns="true"></table></div>');

        var flag = false;
        store[id] = new geocloud.sqlStore({
            jsonp: false,
            method: "POST",
            host: "",
            base64: false,
            db: "",
            uri: "/api/extension/geoenviron/" + type + "/" + token + "/" + client,
            clickable: true,
            id: id,
            styleMap: {
                weight: 5,
                color: seq === -999 ? models[type].color : '#ff00ff',
                dashArray: '',
                fillOpacity: 0.2,
                opacity: 1.0
            },
            error: function (e) {
                console.error(e);
                if (e.status !== 0) {
                    console.error("Got an error from GeoEnviron");
                }
            },

            sql: "{minX},{minY},{maxX},{maxY}," + seq,

            loading: function () {

                try {
                    cl[id].removeLayer();
                } catch (e) {
                    console.error(e.message)
                }

                cloud.get().map.closePopup();

                layers.incrementCountLoading(id);
                backboneEvents.get().trigger("startLoading:layers", id);
                console.log("loading");
            },

            onLoad: function () {

                var zoom = cloud.get().map.getZoom(), zoonBreak = 16;

                if (zoom < zoonBreak && seq === -999) {
                    cloud.get().map.removeLayer(store[id].layer);
                } else {
                    cloud.get().map.addLayer(store[id].layer);
                }

                layers.decrementCountLoading(id);

                $.each(store[id].layer._layers, function (x, layer) {

                    if (layer.feature.geometry.type !== "Point") {

                        var minSize = 5,
                            map = cloud.get().map,
                            bounds = layer.getBounds(),
                            ne_px = map.project(bounds.getNorthEast(), zoom),
                            sw_px = map.project(bounds.getSouthWest(), zoom),
                            width = ne_px.x - sw_px.x,
                            height = sw_px.y - ne_px.y;

                        if (height < minSize || width < minSize || zoom < zoonBreak) {

                            store[id].layer.removeLayer(layer);

                            store[id].layer.addData({
                                "type": "Feature",
                                "properties": layer.feature.properties,
                                "geometry": {
                                    "type": "Point",
                                    "coordinates": [layer.getBounds().getCenter().lng, layer.getBounds().getCenter().lat]
                                }
                            });
                        }
                    }

                });

                backboneEvents.get().trigger("doneLoading:layers");

                if (seq !== -999 && store[id].geoJSON.features[0].geometry !== null) {
                    cloud.get().zoomToExtentOfgeoJsonStore(store[id], 18);
                }

                if (seq !== -999 && store[id].geoJSON.features[0].geometry === null) {

                    var editor;

                    var action = LeafletToolbar.ToolbarAction.extend({
                        initialize: function (map, myAction) {
                            this.map = cloud.get().map;
                            this.myAction = myAction;
                            LeafletToolbar.ToolbarAction.prototype.initialize.call(this);
                        },
                        addHooks: function () {
                            // this.myAction.disable();
                        }
                    });

                    var cancel = action.extend({
                        options: {
                            toolbarIcon: {
                                html: '<i class="fa fa-times"></i>',
                                tooltip: 'Cancel'
                            }
                        },
                        addHooks: function () {
                            if (window.confirm("Er du sikker? Dine ændringer vil ikke blive gemt!")) {
                                cloud.get().map.editTools.stopDrawing();
                                editor.disableEdit();
                                cloud.get().map.removeLayer(editor);
                            } else {
                                return;
                            }
                            this.myAction.disable();
                            action.prototype.addHooks.call(this);
                        }
                    });

                    var start = action.extend({

                        options: {
                            toolbarIcon: {
                                className: 'fa fa-pencil'

                            },
                            subToolbar: new LeafletToolbar({
                                actions: [
                                    cancel
                                ]
                            })
                        },

                        addHooks: function () {
                            try {
                                cloud.get().map.removeLayer(editor);

                            } catch (e) {

                            }
                            if (id === "s_Borings") {
                                editor = cloud.get().map.editTools.startMarker();
                            } else {
                                editor = cloud.get().map.editTools.startPolygon();

                            }
                        }
                    });


                    var save = action.extend({

                        options: {
                            toolbarIcon: {
                                className: 'fa fa-floppy-o'
                            }
                        },

                        addHooks: function () {

                            // Save feature
                            var json = editor.toGeoJSON();

                            console.log(json);
                            json.properties = store[id].geoJSON.features[0].properties;

                            me.commitDrawing(store[id], json, type, token, client).then(
                                function (e) {
                                    cloud.get().map.removeLayer(editor);
                                    cloud.get().map.removeLayer(toolBar);
                                    jquery.snackbar({
                                        id: "snackbar-conflict",
                                        content: "Entity '" + json.properties.SeqNoType + "' (" + json.properties.SeqNo + ") stedfæstet",
                                        htmlAllowed: true,
                                        timeout: 5000
                                    });

                                },
                                function (e) {
                                    // Error
                                    alert(e.responseText);
                                });
                        }

                    });


                    toolBar = new LeafletToolbar.Control({
                        position: 'topright',
                        actions: [start, save]
                    });

                    toolBar.addTo(cloud.get().map);

                }

                if (zoom < zoonBreak && seq === -999) {
                    cl[id] = new QCluster.PointClusterer(store[id].layer.toGeoJSON(), 'nigeria', cloud.get().map, 'nigeria-layer',
                        {
                            backgroundColor: models[type].color,
                            dataFormat: 'GeoJSON'
                        });
                }

            },

            onEachFeature: function (feature, layer) {

                var saveFn, cancelFn;

                if (licens === "gispro" || licens === "gispremium") {
                    layer.on("click", function (e) {
                        history.pushState(null, null, anchor.init() + "¤" + feature.properties.GELink.split("?")[1]);
                        console.log("GEMessage:select:" + feature.properties.GELink.split("?")[1]);

                        var popup = L.popup({
                            autoPan: false
                        });

                        var showToolbar = false;

                        if (e.target.feature.geometry.type !== "Point" || id === "Borings" || id === "s_Borings") {
                            popup
                                .setLatLng(e.latlng)
                                .setContent('<button class="btn btn-primary btn-xs ge-start-edit"><i class="fa fa-pencil" aria-hidden="true"></i></button><button class="btn btn-primary btn-xs ge-delete"><i class="fa fa-trash" aria-hidden="true"></i></button>')
                                .openOn(cloud.get().map);
                        }
                        $(".ge-delete").unbind("click.ge-delete").bind("click.ge-delete", function () {

                            if (window.confirm("Er du sikker? Dine ændringer vil ikke blive gemt!")) {
                                // Disable editing on all layers

                                me.commitDelete(store[id], e.target.toGeoJSON(), type, token, client).then(
                                    function () {
                                        store[id].reset();
                                        store[id].load();
                                        cloud.get().map.removeLayer(toolBar);
                                    },
                                    function (e) {
                                        console.log(e);
                                        alert(e.responseText);
                                    });


                            }

                        });

                        $(".ge-start-edit").unbind("click.ge-start-edit").bind("click.ge-start-edit", function () {
                            try {
                                store["s_" + id].reset();
                            } catch (e) {
                            }

                            //Disable editing on all layers
                            Object.keys(store).map(function (k) {
                                store[k].layer.eachLayer(function (l) {
                                    try {
                                        l.disableEdit();
                                    } catch (e) {
                                    }
                                });
                            });
                            // Enable reload on all layers, except select layers
                            Object.keys(table).map(function (k) {
                                if (k.substring(0, 2) !== "s_") {
                                    table[k].moveEndOn();
                                }
                            });

                            if (e.target.feature.geometry.type !== "Point") {

                                e.target.enableEdit();
                                cloud.get().map.closePopup();
                                table[type].moveEndOff();

                                cancelFn = function () {
                                    e.target.disableEdit();
                                    table[type].moveEndOn();
                                };

                                saveFn = function () {
                                    e.target.disableEdit();
                                    table[type].moveEndOn();
                                    return e.target.toGeoJSON();
                                };

                                showToolbar = true;

                            }

                            if (id === "Borings" || id === "s_Borings") {

                                try {
                                    cloud.get().map.removeLayer(marker);
                                } catch (e) {
                                }

                                marker = L.marker(
                                    e.target.getLatLng(),
                                    {
                                        icon: L.AwesomeMarkers.icon({
                                                icon: 'arrows',
                                                markerColor: 'blue',
                                                prefix: 'fa'
                                            }
                                        )
                                    }
                                ).addTo(cloud.get().map);

                                marker.enableEdit();

                                cloud.get().map.closePopup();

                                table[type].moveEndOff();

                                cancelFn = function () {
                                    marker.disableEdit();
                                    table[type].moveEndOn();
                                    cloud.get().map.removeLayer(marker);
                                };

                                saveFn = function () {
                                    marker.disableEdit();
                                    table[type].moveEndOn();
                                    cloud.get().map.removeLayer(marker);
                                    let f = marker.toGeoJSON();
                                    f.properties = e.target.feature.properties;
                                    return f;
                                };

                                showToolbar = true;

                            }

                            toolBar = new LeafletToolbar.Control({

                                position: 'topright',
                                actions: [

                                    // Stop
                                    LeafletToolbar.ToolbarAction.extend({
                                        options: {
                                            toolbarIcon: {
                                                className: 'fa fa-stop'

                                            }
                                        },

                                        addHooks: function () {

                                            if (window.confirm("Er du sikker? Dine ændringer vil ikke blive gemt!")) {
                                                // Disable editing on all layers
                                                cancelFn();
                                                store[id].reset();
                                                store[id].load();
                                                cloud.get().map.removeLayer(toolBar);

                                            }

                                        }
                                    }),

                                    // Gem
                                    LeafletToolbar.ToolbarAction.extend({

                                        options: {
                                            toolbarIcon: {
                                                className: 'fa fa-floppy-o'
                                            }
                                        },

                                        addHooks: function () {

                                            var json = saveFn();

                                            me.commitDrawing(store[id], json, type, token, client).then(
                                                function (e) {
                                                    store[id].reset();
                                                    store[id].load();
                                                    cloud.get().map.removeLayer(toolBar);
                                                    jquery.snackbar({
                                                        id: "snackbar-conflict",
                                                        content: "Entity '" + json.properties.SeqNoType + "' (" + json.properties.SeqNo + ") ændret",
                                                        htmlAllowed: true,
                                                        timeout: 5000
                                                    });

                                                },
                                                function (e) {
                                                    // Error
                                                    alert(e.responseText);
                                                }
                                            );

                                        }

                                    })]
                            });

                            if (showToolbar) {
                                toolBar.addTo(cloud.get().map);
                            }
                        });


                    });
                }

                layer.on({

                    mouseover: function () {

                        var fi = [];

                        $.each(feature.properties, function (name, property) {
                            if (name !== "GELink" && name !== "_id") {

                                $.each(models[type].fields, function (i, v) {
                                    if (v.key === name) {
                                        fi.push({
                                            title: v.alias,
                                            value: feature.properties[name]
                                        });
                                        return;
                                    }
                                });


                            }
                        });

                        flag = true;

                        var tooltipHtml = Mustache.render(template, {
                            content: {
                                fields: fi
                            }
                        });

                        $("#tail").fadeIn(100);
                        $("#tail").html(tooltipHtml);

                    },

                    mouseout: function () {
                        flag = false;
                        // Wait 200 ms before closing tooltip, so its not blinking between close features
                        setTimeout(function () {
                            if (!flag) {
                                $("#tail").fadeOut(100);
                            }
                        }, 200)


                    }
                });
            }

        });

        table[id] = gc2table.init({
            el: "#geoenviron-table_" + type,
            geocloud2: cloud.get(),
            store: store[id],
            cm: cm,
            autoUpdate: seq === -999,
            autoPan: false,
            openPopUp: false,
            setViewOnSelect: false,
            responsive: false,
            callCustomOnload: true,
            height: 400,
            locale: window._vidiLocale.replace("_", "-"),
            ns: "#" + type
            //template: templateb"
        });

        cloud.get().addGeoJsonStore(store[id]);

        store[id].load();

    },

    commitDelete: function (store, json, type, token, client) {
        //http://devapp1:10051/GeoEnvironODataService.svc/Geometries(SeqNo=600300300M,SeqNoType='agr')

        return new Promise(function (resolve, reject) {
            $.ajax({
                dataType: 'json',
                url: "/api/extension/geoenviron/" + type + "/" + token + "/" + client + "/(SeqNo=" + json.properties.SeqNo + "M" + ",SeqNoType=%27" + json.properties.SeqNoType + "%27)",
                type: "DELETE",
                success: function (data) {
                    resolve(data);
                },
                error: function (error) {
                    reject(error);
                },
                complete: function () {

                }
            });
        })
    },


    commitDrawing: function (store, json, type, token, client) {
        // Transform og convert geometry
        var wkt = WKT.convert(reproject.reproject(JSON.parse(JSON.stringify(json.geometry)), "unproj", "proj", {
            "proj": "+proj=utm +zone=32 +ellps=WGS84 +datum=WGS84 +units=m +no_defs",
            "unproj": "+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs"
        }));

        return new Promise(function (resolve, reject) {
            $.ajax({
                dataType: 'json',
                url: "/api/extension/geoenviron/" + type + "/" + token + "/" + client,
                type: "PUT",
                data: "&seqNo=" + json.properties.SeqNo + "&seqNoType=" + json.properties.SeqNoType + "&geometryWKT=" + wkt,
                success: function (data) {
                    resolve(data);
                },
                error: function (error) {
                    reject(error);
                },
                complete: function () {

                }
            });
        })
    },

    clear: function (type) {
        store[type].abort();
        store[type].reset();

        try {
            cl[type].removeLayer();
        } catch (e) {
            console.info(e.message)
        }

        cloud.get().removeGeoJsonStore(store[type]);
        table[type].moveEndOff();
        $("#geoenviron-table").empty();

    },

    getLicens: function () {

        let me = this;
        let token = urlVars.token;
        let client = urlVars.client;

        return new Promise(function (resolve, reject) {
            $.ajax({
                dataType: 'json',
                url: '/api/extension/licenses/' + token + '/' + client,
                type: "GET",
                success: function (data) {
                    resolve(data);
                },
                error: function (error) {
                    reject(error.responseJSON.message);
                },
                complete: function () {

                }
            });
        })
    }
};
