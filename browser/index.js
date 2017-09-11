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
 * @type {boolean}
 */
var active = false;

var mapObj;
var clicktimer;

var store = [];
var table = [];


/**
 *
 * @type {string}
 */
var exId = "geoenviron";


var xhr;

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

        mapObj = cloud.get().map;


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

        utils.createMainTab(exId, utils.__("GeoEnviron", dict), utils.__("Info", dict), require('./../../../height')().max);


        const entities = [
            {"seqNoType": "virk", "title": "Company"},
            {"seqNoType": "agr", "title": "Agriculture"},
            {"seqNoType": "agrsto", "title": "AgricultureStorage"},
            {"seqNoType": "open", "title": "OpenCountry"},
            {"seqNoType": "octank", "title": "OpenCountryTank"},
            {"seqNoType": "ocpur", "title": "OpenCountryPurification"},
            {"seqNoType": "water", "title": "WaterCatchmentPlant"},
            {"seqNoType": "tank", "title": "Tank"},
            {"seqNoType": "sep", "title": "Separator"},
            {"seqNoType": "sdtrap", "title": "SandTrap"},
            {"seqNoType": "heat", "title": "GeothermalHeatSystem"},
            {"seqNoType": "boring", "title": "Boring"},
            {"seqNoType": "act", "title": "ContaminatedLandActivity"},
            {"seqNoType": "sta", "title": "Station"},
            {"seqNoType": "wmill", "title": "Windmill"},
            {"seqNoType": "bld", "title": "BldCasefile"}
        ];

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

                this.switch = this.switch.bind(this);

                this.listEntities = entities.map((entity) =>

                    <li key={entity.seqNoType} className="layer-item list-group-item">
                        <div className="checkbox"><label className="overlay-label" style={this.vWidth}><input
                            type="checkbox" data-key={entity.seqNoType} onChange={this.switch}/>{entity.title}
                        </label><span className="geoenviron-table-label label label-primary">Table</span>
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
            let index = ($(this).prev().children("input").data('key'));
            $(".geoenviron-attr-table").hide();
            $("#" + index).show();
            $("#info-modal").animate({right: "0"}, 200);
            $("#info-modal .modal-title").html(index);
            e.stopPropagation();
        });


    },

    request: function (index) {

        let me = this;

        $("div").remove("#" + index);
        $("#info-modal-body-wrapper .modal-body").append('<div class="geoenviron-attr-table" id="' + index + '"><table id="geoenviron-table_' + index + '"></table></div>');

        store[index] = new geocloud.sqlStore({
            jsonp: false,
            method: "POST",
            host: "",
            db: "",
            uri: "/api/extension/geoenviron",
            clickable: true,
            id: index,
            styleMap: {
                weight: 5,
                color: '#ff0000',
                dashArray: '',
                fillOpacity: 0.2
            },
            error: function (e) {
                console.log(e)
                if (e.status !== 0) {
                    alert("Got an error from GeoEnviron")
                }
            },

            sql: "{minX},{minY},{maxX},{maxY}," + index,

            loading: function () {
                //layers.incrementCountLoading(index);
                //backboneEvents.get().trigger("startLoading:layers", index);
                console.log("loading");
            },

            // Set _vidi_type on all vector layers,
            // so they can be recreated as query layers
            // after serialization
            // ========================================

        });

        table[index] = gc2table.init({
            el: "#geoenviron-table_" + index,
            geocloud2: cloud.get(),
            store: store[index],
            cm: [{
                header: "SeqNo",
                dataIndex: "SeqNo",
                sortable: true
            }],
            autoUpdate: true,
            autoPan: true,
            openPopUp: true,
            setViewOnSelect: false,
            responsive: false,
            callCustomOnload: false,
            height: 400,
            locale: window._vidiLocale.replace("_", "-"),
            ns: "#" + index
            //template: templateb"
        });

        cloud.get().addGeoJsonStore(store[index]);
        store[index].load();

    },

    clear: function (index) {
        store[index].abort();
        store[index].reset();
        cloud.get().removeGeoJsonStore(store[index]);
        $("#geoenviron-table").empty();

    }
};
