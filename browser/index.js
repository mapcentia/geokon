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


var mapObj;

var store = [];
var table = [];
var getypes;

var cl = [];


var models = require('../models');

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
        backboneEvents = o.backboneEvents;
        return this;
    },

    /**
     *
     */
    init: function () {

        var parentThis = this;

        /**
         *
         */
        var React = require('react');

        /**
         *
         */
        var ReactDOM = require('react-dom');

        var me = this;


        $(document).arrive('.custom-popup a', function () {
            $(this).on("click", function (e) {
                e.preventDefault();
                e.stopPropagation();
                history.pushState(null, null, anchor.init() + "¤" + $(this)[0].href.split("?")[1]);
            });
        });

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

                        parentThis.request(i);
                        $('*[data-seqnotype="' + v.seqNoType + '"]').prop('checked', true);
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

        var entities = [];

        $.each(models, function (i, v) {
            entities.push({
                "type": i,
                "title": v.alias,
                "color": v.color,
                "seqNoType": v.seqNoType,
                "show": (getypes.indexOf(v.seqNoType) !== -1)
            })
        });

        /**
         *
         */
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

                this.listEntities = entities.map((entity) =>

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
                            <span className="geoenviron-table-label label label-primary" style={this.hand}>Table</span>
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

            }


            switch(e) {

                if (e.target.checked) {
                    parentThis.request(e.target.dataset.key)
                } else {
                    parentThis.clear(e.target.dataset.key)
                }
            }

            render() {
                return (

                    <div role='tabpanel'>
                        <div className='panel panel-default'>
                            <div className='panel-body'>

                                <ul className="list-group">
                                    {this.listEntities}
                                </ul>

                            </div>
                        </div>
                    </div>


                );
            }
        }

        // Append to DOM
        //==============

        try {
            ReactDOM.render(
                <GeoEnviron entities={entities}/>,
                document.getElementById(exId)
            );
        } catch (e) {

        }

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

    request: function (type, seqNoType, seqNo, zoom) {

        let me = this;
        let seq = seqNo !== undefined ? seqNo : -999;
        let id = seqNo !== undefined ? "s_" + type : type;
        let cm = [];

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
            db: "",
            uri: "/api/extension/geoenviron/" + type + "/" + token + "/" + client,
            clickable: true,
            id: id,
            styleMap: {
                weight: 5,
                color: seq === -999 ? models[type].color : '#ff00ff',
                dashArray: '',
                fillOpacity: 0.2
            },
            error: function (e) {
                console.error(e);
                if (e.status !== 0) {
                    alert("Got an error from GeoEnviron")
                }
            },

            sql: "{minX},{minY},{maxX},{maxY}," + seq,

            loading: function () {

                try {
                    cl[type].removeLayer();
                } catch (e) {
                    console.error(e.message)
                }

                layers.incrementCountLoading(type);
                backboneEvents.get().trigger("startLoading:layers", type);
                console.log("loading");
            },

            onLoad: function () {

                var zoom = cloud.get().map.getZoom();

                if (zoom < 16) {
                    cloud.get().map.removeLayer(store[id].layer);
                } else {
                    cloud.get().map.addLayer(store[id].layer);
                }

                layers.decrementCountLoading(type);

                $.each(store[id].layer._layers, function (x, layer) {

                    if (layer.feature.geometry.type !== "Point") {

                        var minSize = 5,
                            map = cloud.get().map,
                            bounds = layer.getBounds(),
                            ne_px = map.project(bounds.getNorthEast(), zoom),
                            sw_px = map.project(bounds.getSouthWest(), zoom),
                            width = ne_px.x - sw_px.x,
                            height = sw_px.y - ne_px.y;


                        if (height < minSize || width < minSize || zoom < 16) {

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

                //table[type].loadDataInTable(true);

                backboneEvents.get().trigger("doneLoading:layers");

                if (seq !== -999) {
                    cloud.get().zoomToExtentOfgeoJsonStore(store[id], 16);
                }

                if (zoom < 16) {
                    cl[type] = new QCluster.PointClusterer(store[id].layer.toGeoJSON(), 'nigeria', cloud.get().map, 'nigeria-layer',
                        {
                            backgroundColor: models[type].color,
                            dataFormat: 'GeoJSON'
                        });
                }


            },

            onEachFeature: function (feature, layer) {

                layer.on("click", function () {
                    history.pushState(null, null, anchor.init() + "¤" + feature.properties.GELink.split("?")[1]);
                });

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

        table[type] = gc2table.init({
            el: "#geoenviron-table_" + type,
            geocloud2: cloud.get(),
            store: store[id],
            cm: cm,
            autoUpdate: seq === -999,
            autoPan: true,
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

    clear: function (type) {
        store[type].abort();
        store[type].reset();
        cl[type].removeLayer();
        cloud.get().removeGeoJsonStore(store[type]);

        table[type].moveEndOff();

        $("#geoenviron-table").empty();

    }
};
