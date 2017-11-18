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

var models = require('../models');

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
            var type, seqNoType, urlVars;

            urlVars = (function getUrlVars() {
                var mapvars = {};
                var parts = window.location.hash.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
                    mapvars[key] = value;
                });
                return mapvars;
            })();

            $.each(models, function (i, v) {
                if (v.seqNoType === urlVars.type.split("#")[0]) {
                    seqNoType = v.seqNoType;
                    type = i;
                    me.request(type, seqNoType, urlVars.seqno.split("#")[0])
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

        var getypes = urlVars.getypes.split(",");

        getypes = getypes.map(function (e) {
            return e.split("#")[0];
        });

        var entities = [];

        $.each(models, function (i, v) {
            if (getypes.indexOf(v.seqNoType) !== -1) {
                entities.push({"type": i, "title": v.alias})
            }
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
                        <div className="checkbox"><label className="overlay-label" style={this.vWidth}><input
                            type="checkbox" data-key={entity.type} data-title={entity.title} onChange={this.switch}/>{entity.title}
                        </label><span className="geoenviron-table-label label label-primary" style={this.hand}>Table</span>
                        </div>
                    </li>
                )
            }

            componentDidMount() {

                var me = this;
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
        let cm = [];

        try {
            store[type].reset();
        } catch (e) {}

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

        store[type] = new geocloud.sqlStore({
            jsonp: false,
            method: "POST",
            host: "",
            db: "",
            uri: "/api/extension/geoenviron/" + type,
            clickable: true,
            id: type,
            styleMap: {
                weight: 5,
                color: seq === -999 ? '#ff0000' : '#0000ff',
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
                layers.incrementCountLoading(type);
                backboneEvents.get().trigger("startLoading:layers", type);
                console.log("loading");
            },

            onLoad: function () {
                layers.decrementCountLoading(type);
                backboneEvents.get().trigger("doneLoading:layers");
               if (seq !== -999) {
                   //backboneEvents.get().on("end:state", function () {
                       cloud.get().zoomToExtentOfgeoJsonStore(store[type], 16);
                   //});
               }
            }
        });

        table[type] = gc2table.init({
            el: "#geoenviron-table_" + type,
            geocloud2: cloud.get(),
            store: store[type],
            cm: cm,
            autoUpdate: seq === -999,
            autoPan: true,
            openPopUp: true,
            setViewOnSelect: false,
            responsive: false,
            callCustomOnload: true,
            height: 400,
            locale: window._vidiLocale.replace("_", "-"),
            ns: "#" + type
            //template: templateb"
        });

        cloud.get().addGeoJsonStore(store[type]);
        store[type].load();

    },

    clear: function (type) {
        store[type].abort();
        store[type].reset();
        cloud.get().removeGeoJsonStore(store[type]);

        table[type].moveEndOff();

        $("#geoenviron-table").empty();

    }
};
