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
var streetView;

/**
 *
 * @type {*|exports|module.exports}
 */
var sqlQuery;

/**
 *
 * @type {*|exports|module.exports}
 */
var urlVars = require('./../../../browser/modules/urlparser').urlVars;
var uriJs = require('./../../../browser/modules/urlparser').uriJs;
var urlparser = require('./../../../browser/modules/urlparser');
var db = urlparser.db;


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

var editMode = false;


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
var conflictSearch;

moment.locale('da');

var editor;
var cancelFn;

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
        sqlQuery = o.sqlQuery;
        conflictSearch = o.extensions.conflictSearch.index;
        streetView = o.extensions.streetView.index;
        return this;
    },

    /**
     *
     */
    init: function () {
        var me = this;
        var parentThis = this;
        var React = require('react');
        var ReactDOM = require('react-dom');
        var visibleGeLayers = [];
        var entities = [];
        var dict;

        // Setup GE extension
        //===================

        // Overwrite call back in StreetView
        streetView.setCallBack(function (url) {
            console.log("GEMessage:LaunchURL:" + url);
        });

        // Overwrite call back in SQL query
        sqlQuery.setDownloadFunction(function (sql, format) {
            let uri = 'store=true&format=' + format + '&client_encoding=UTF8&srs=4326&q=' + sql;

            $.ajax({
                dataType: 'json',
                url: '/api/sql/' + db,
                type: "POST",
                data: uri,
                success: function (response) {
                    console.log("GEMessage:LaunchURL:" + urlparser.uriObj.protocol() + "://" + urlparser.uriObj.host() + "/tmp/stored_results/" + response.file);

                },
                error: function (error) {
                    console.log(error)
                }
            });
        });

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

        // Listen to layer switch check boxes
        $(document).arrive('[data-key]', function () {
            $(this).on("change", function (e) {
                parentThis.switchLayer($(this).data('key'), $(this).context.checked);
                e.stopPropagation();
            });
        });

        // Hide stuff
        $('a[href="#draw-content"]').hide();
        $('#get-print-fieldset').hide();
        $('#conflict-get-print-fieldset').hide();
        $('.leaflet-control-locate').hide();
        //$('a[href="#layer-content"]').hide();
        $('a[href="#streetview-content"]').hide();
        $(".custom-search").prop("disabled", true);



        // Set native Leaflet object
        mapObj = cloud.get().map;

        // Check URL for 'type' and 'seqno' and switch on layers
        if (urlVars.seqno !== undefined && urlVars.type !== undefined) {
            let type, seqNoType;
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
            let type, seqNoType, urlVars, getypes;
            urlVars = (function getUrlVars() {
                let mapvars = {};
                let parts = window.location.hash.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
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

	//Create new info  item 
		me.createNavbut();		 		 
		 
		$("#btn-geinfo").on("click", function () {
			
			$("div").remove("#gedinfo");
			$(".geoenviron-attr-table").hide();
			
			$("#info-modal").animate({right: "0"}, 200);
            $("#info-modal .modal-title").html("GeoEnviron Variabler");
			$("#info-modal-body-wrapper .modal-body").append('<div class="container" id="gedinfo">'
				+ '<table class="table caption-top" id="getable">'
				+ '<caption>Liste over variabler</caption>'
				+ '<thead><tr><th scope="col">Type</th><th scope="col">Værdi</th></tr></thead><tbody>'
				+ '<tr><td>brandname</td><td>' + window.vidiConfig.brandName +   '</td></tr>'
				+ '<tr><td>app version</td><td>' +  window.vidiConfig.appVersion +   '</td></tr>'
				+ '<tr><td>host</td><td>' + window.location.host +   '</td></tr>'
				+ '<tr><td>pathname</td><td>' + window.location.pathname +   '</td></tr>'
				+ '<tr><td>token</td><td>' + urlVars.token +   '</td></tr>'
				+ '<tr><td>client</td><td>' + urlVars.client +   '</td></tr>'
				+ '<tr><td>config</td><td>' + urlVars.config +   '</td></tr>'
				+ '<tr><td>last hash</td><td>' + window.location.hash +   '</td></tr>'
				+ '<tr><td>seqno</td><td>' + urlVars.seqno +   '</td></tr>'
				+ '<tr><td>gelayers</td><td>' + urlVars.gelayers +   '</td></tr>'
				+ '<tr><td>Id</td><td>' + urlVars.Id +   '</td></tr>'
				+ '<tr><td>type</td><td>' + urlVars.type +   '</td></tr>'
				+ '<tr><td>Type</td><td>' + urlVars.Type +   '</td></tr>'
				+ '</tbody></table>'
				+ '<button type="button" class="btn btn-default" id="btn-geexport"  onclick="$(\'#getable\').tableExport({formats: [\'csv\'] ,fileName:\'GeoEnviron_Variabler\'});">Export</button></div>');
			
						       	  
        });
							  
        // Set i18n object
        dict = {
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

        // Create tab for extension
        utils.createMainTab(exId, utils.__("GeoEnviron", dict), utils.__("Info", dict), require('./../../../browser/modules/height')().max);

        // Get GE types from URL param
        getypes = urlVars.getypes ? urlVars.getypes.split(",") : [];

        if (getypes.length > 0) {
            getypes = getypes.map(function (e) {
                return e.split("#")[0];
            });
        }

        // Get GE layers from URL param
        visibleGeLayers = urlVars.gelayers ? urlVars.gelayers.split(",") : [];

        if (visibleGeLayers.length > 0) {
            visibleGeLayers = visibleGeLayers.map(function (e) {
                return e.split("#")[0];
            });
        }

        // Setup main edit toolbar
        var ourCustomControl = L.Control.extend({
            options: {
                position: 'topright'
            },
            onAdd: function (map) {
                var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
                container.style.backgroundColor = 'white';
                container.style.width = '30px';
                container.style.height = '30px';
                container.style.lineHeight = '30px';
                container.style.textAlign = 'center';
                container.style.borderRadius = '2px';
                container.title = 'Start/stop editering';
                container.innerHTML = "<i class=\"fa fa-pencil-alt\" aria-hidden=\"true\"></i>";
                container.onclick = function () {
                    if (!editMode) {
                        editMode = true;
                        container.style.backgroundColor = 'Grey';
                        container.style.color = 'white';

                    } else {
                        editMode = false;
                        container.style.backgroundColor = 'white';
                        container.style.color = 'black';
                    }

                };

                return container;
            }
        });
        mapObj.addControl(new ourCustomControl());

        this.switchLayer = function (layer, visible) {

            let el = $('*[data-key="' + layer + '"]'), str, uriObj;

            if (visible) {
                if (visibleGeLayers.indexOf(layer) === -1) {
                    visibleGeLayers.push(layer);
                    parentThis.request(layer);
                    el.prop('checked', true);
                }
            } else {
                let index = visibleGeLayers.indexOf(layer);
                if (index > -1) {
                    visibleGeLayers.splice(index, 1);
                }
                parentThis.clear(layer);
                el.prop('checked', false);

                delete store[layer];
                delete table[layer];
            }

            str = visibleGeLayers.join(",");

            if (str.substring(0, 1) === ',') {
                str = str.substring(1);
            }

            uriObj = new uriJs(window.location.href);
            uriObj.setSearch("gelayers", str);
            window.history.pushState('', '', uriObj.toString());
            console.log("GEMessage:gelayers:" + str);

        };

        conflictSearch.setPreProcessor(
            function (e) {

                let id = "_" + 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                    let r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                    return v.toString(16);
                });

                conflictSearch.setSearchStr("tag:" + id);

                return new Promise(function (resolve, reject) {

                    let token = urlVars.token;
                    let client = urlVars.client;

                    jquery.snackbar({
                        id: "snackbar-ge-conflict",
                        content: "<span id='conflict-ge-progress'>" + __("Transfer data from GE....") + "</span>",
                        htmlAllowed: true,
                        timeout: 1000000
                    });

                    $.ajax({
                        dataType: 'json',
                        url: '/api/extension/conflict/' + token + '/' + client + '/' + id,
                        type: "POST",
                        data: "wkt=" + e.projWktWithBuffer + "&socketId=" + socketId.get(),
                        success: function (response) {
                            resolve();
                            //console.log("GEMessage:conflictId:" + e.file)
                        },
                        error: function (error) {
                            //console.error(error.responseJSON.message);
                            reject(error);
                        },
                        complete: function () {
                            jquery("#snackbar-ge-conflict").snackbar("hide");
                        }
                    });
                });
            }
        );

        $.ajax({
            dataType: 'json',
            url: '/api/extension/geoenviron/model/' + urlVars.token + "/" + urlVars.client,
            type: "GET",
            success: function (response) {
                models = response.json;
                $.each(models, function (i, v) {
                    entities.push({
                        "type": i,
                        "title": v.alias,
                        "color": v.color,
                        "outlineColor": v.outlineColor,
                        "maxCount": v.maxCount,
                        "seqNoType": v.seqNoType,
                        "subLayers": v.subLayers ? v.subLayers.map(function (y) {
                            return {
                                "type": i + "_" + window.btoa(y.filter),
                                "title": y.alias,
                                "color": y.color,
                                "outlineColor": y.outlineColor,
                                "seqNoType": v.seqNoType,
                                "show": false
                            }
                        }) : [],
                        "show": (getypes.indexOf(v.seqNoType) !== -1)
                    })
                });

                backboneEvents.get().on("end:conflictSearch", function (e) {
                    console.log("GEMessage:conflictId:" + e.file)

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

                class ExpandButton extends React.Component {
                    constructor(props) {
                        super(props);
                        this.state = {
                            icon: "<i class='fa fa-plus'></i>"
                        };
                        this.type = props.type;
                        this.show = props.show;
                        this.isExpanded = false;

                        this.onExpand = this.onExpand.bind(this);


                    }

                    onExpand() {
                        if (this.isExpanded) {
                            this.setState({
                                icon: "<i class='fa fa-plus'></i>"
                            });
                            this.isExpanded = false;
                        } else {
                            this.setState({
                                icon: "<i class='fa fa-minus'></i>"
                            });
                            this.isExpanded = true;
                        }

                    }


                    render() {
                        let button;

                        if (this.show) {
                            button = "visible"
                        } else {
                            button = "hidden";
                        }
                        return (
                            <a style={{"visibility": button}} data-toggle="collapse"
                               href={"#subs_" + this.type}
                               onClick={this.onExpand}
                               dangerouslySetInnerHTML={{__html: this.state.icon}}
                            >
                            </a>
                        );
                    }
                }

                class SubLayers extends React.Component {
                    constructor(props) {
                        super(props);

                        this.state = {};

                        this.entities = props.entities;

                        this.name = props.name;

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
                                </div>
                            </li>
                        )

                    }

                    render() {
                        return (
                            <div>
                                <div className="collapse" id={"subs_" + this.name}>
                                    <ul className="list-group" style={{"paddingLeft": "35px"}}>
                                        {this.listEntities}
                                    </ul>
                                </div>
                            </div>
                        );
                    }
                }

                class GeoEnviron extends React.Component {
                    constructor(props) {

                        super(props);

                        this.state = {};

                        this.width = {
                            width: "calc(100% - 70px)"
                        };

                        this.vWidth = {
                            width: "calc(100% - 50px)"
                        };

                        this.hand = {
                            cursor: "pointer"
                        };


                        this.licenses = props.licenses.value;
                        this.functions = props.functions;
                        this.entities = props.entities;
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

                    render() {
                        var me = this;
                        return (
                            <div role='tabpanel'>
                                <div className='panel panel-default'>
                                    <div className='panel-body'>
                                        <ul className="list-group">
                                            {
                                                this.entities.map(function (entity) {


                                                    return (
                                                        <li key={entity.type} className="layer-item list-group-item">
                                                            <div className="checkbox">

                                                                <ExpandButton type={entity.type}
                                                                              show={entity.subLayers.length}/>

                                                                <label className="overlay-label" style={me.width}>
                                                                    <input
                                                                        type="checkbox" data-key={entity.type}
                                                                        data-seqnotype={entity.seqNoType}
                                                                        data-title={entity.title}
                                                                        onChange={me.switch}
                                                                        defaultChecked={entity.show}/>
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
                                                                <span
                                                                    className="geoenviron-table-label label label-primary"
                                                                >Table</span>
                                                            </div>
                                                            <SubLayers entities={entity.subLayers} name={entity.type}/>
                                                        </li>)
                                                })
                                            }
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
                        //licens = "gispro";

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

                        if (licens === "gispremium") {
                            $('a[href="#draw-content"]').show();

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
							$("div").remove("#gedinfo");   
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

    /**
     * Cancel all ongoing edits
     */
    cancelAll: function () {
        try {
            cloud.get().map.editTools.stopDrawing();
            editor.disableEdit();
            cloud.get().map.removeLayer(editor);

        } catch (e) {
            console.error(e.message)
        }

        try {
            cancelFn()
        } catch (e) {
            console.error(e.message)
        }

        try {
            cloud.get().map.removeLayer(toolBar);
        } catch (e) {
            console.error(e.message)
        }

        $(".leaflet-control-custom").css("background-color", "white");
        $(".leaflet-control-custom").css("color", "black");

        editMode = false;
    },

    request: function (type, seqNoType, seqNo) {

        var parts = type.split("_"), filter, filterBase64, mainType, color, outlineColor, isSubLayer = false,
            firstJumpFromGe = true;

        this.cancelAll();

        // Check if sub layer
        if (parts.length > 1) {
            filter = window.atob(parts[1]);
            filterBase64 = parts[1];
            mainType = parts[0];
            isSubLayer = true;
            models[mainType].subLayers.map(function (i) {
                if (i.filter === filter) {
                    color = i.color;
                    outlineColor = i.outlineColor;
                }
            });
        } else {
            mainType = type;
            color = models[mainType].color;
            outlineColor = models[mainType].outlineColor
        }

        let me = this;
        let seq = seqNo !== undefined ? seqNo : -999;
        let id = seqNo !== undefined ? "s_" + type : type;
        let cm = [];
        let marker;

        if (seqNo !== undefined) {
            this.clearAllSelectLayers();
            this.switchLayer(type, true);
        }

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

        $.each(models[mainType].fields, function (i, v) {
            cm.push({
                header: v.alias,
                dataIndex: v.key,
                sortable: true,
                link: v.link
            });
        });

        if (!isSubLayer) {
            $("div").remove("#" + type);
			$("div").remove("#gedinfo");
            $("#info-modal-body-wrapper .modal-body").append('<div class="geoenviron-attr-table" id="' + type + '"><table id="geoenviron-table_' + type + '" data-detail-view="true" data-detail-formatter="detailFormatter" data-show-toggle="true" data-show-export="true" data-show-columns="true"></table></div>');
        }


        var flag = false;
        store[id] = new geocloud.sqlStore({
            jsonp: false,
            method: "POST",
            host: "",
            base64: false,
            db: "",
            uri: "/api/extension/geoenviron/" + mainType + "/" + token + "/" + client + "/" + (filterBase64 || "none"),
            clickable: !seqNo,
            id: id,
            name: id,
            styleMap: {
                weight: 3,
                fillColor: seq === -999 ? color : '#ff00ff',
                color: seq === -999 ? outlineColor : '#ff00ff',
                dashArray: '',
                fillOpacity: 0.4,
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

                var zoom = cloud.get().map.getZoom(), zoonBreak = 16, count = 0;

                if (zoom < zoonBreak && seq === -999) {
                    cloud.get().map.removeLayer(store[id].layer);
                } else {
                    cloud.get().map.addLayer(store[id].layer);
                }

                layers.decrementCountLoading(id);

                $.each(store[id].layer._layers, function (x, layer) {
                    count++;
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

                if (store[id].geoJSON.maxCount > parseInt(models[mainType].maxCount)) {
                    jquery.snackbar({
                        id: "snackbar-conflict",
                        content: "Viser " + models[mainType].maxCount + " ud af " + store[id].geoJSON.maxCount + " " + models[mainType].alias + " ",
                        htmlAllowed: true,
                        timeout: 5000
                    });
                }

                backboneEvents.get().trigger("doneLoading:layers");

                if (seq !== -999 && store[id].geoJSON.features[0].geometry !== null) {
                    if (firstJumpFromGe) {
                        cloud.get().zoomToExtentOfgeoJsonStore(store[id], 18);
                        firstJumpFromGe = false;
                    }
                }

                // Coming from GE and entity doesn't have any geometry
                if (seq !== -999 && store[id].geoJSON.features[0].geometry === null) {

                    if (!firstJumpFromGe) {
                        return;
                    }

                    firstJumpFromGe = false;


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
                                className: 'fa fa-plus'

                            },
                            subToolbar: new LeafletToolbar({
                                actions: [
                                    cancel
                                ]
                            })
                        },

                        addHooks: function () {
                            if (models[type].geometryType === "point") {
                                editor = cloud.get().map.editTools.startMarker();
                            } else {
                                editor = cloud.get().map.editTools.startPolygon();
                            }
                            console.log(editor)
                        }
                    });

                    var save = action.extend({

                        options: {
                            toolbarIcon: {
                                className: 'fa fa-floppy-o',
                                tooltip: 'Gem ændringer'
                            }
                        },

                        addHooks: function () {

                            // Save feature
                            var json = editor.toGeoJSON();

                            console.log(json);
                            json.properties = store[id].geoJSON.features[0].properties;

                            Object.keys(table).map(function (k) {
                                if (k.substring(0, 2) === "s_") {
                                    table[k].moveEndOff();
                                }
                            });

                            me.commitDrawing(store[id], json, type, token, client).then(
                                function (e) {
                                    cloud.get().map.removeLayer(editor);
                                    cloud.get().map.removeLayer(toolBar);

                                    // Reset select layer
                                    store[id].reset();

                                    // Reset and reload the real layer
                                    store[id.split("_")[1]].reset();
                                    store[id.split("_")[1]].load();

                                    jquery.snackbar({
                                        id: "snackbar-conflict",
                                        content: models[type].alias + " (" + json.properties.SeqNo + ") stedfæstet",
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

                    // Stop
                    var stop = action.extend({
                            options: {
                                toolbarIcon: {
                                    className: 'fa fa-ban',
                                    tooltip: 'Afbryd'
                                }
                            },

                            addHooks: function () {

                                if (window.confirm("Er du sikker? Dine ændringer vil ikke blive gemt!")) {
                                    me.cancelAll();
                                    cloud.get().map.removeLayer(toolBar);
                                }

                            }
                        }),

                        toolBar = new LeafletToolbar.Control({
                            position: 'topright',
                            actions: [start, save, stop]
                        });

                    toolBar.addTo(cloud.get().map);

                }

                if (zoom < zoonBreak && seq === -999) {
                    cl[id] = new QCluster.PointClusterer(store[id].layer.toGeoJSON(), 'nigeria', cloud.get().map, 'nigeria-layer',
                        {
                            backgroundColor: color,
                            dataFormat: 'GeoJSON'
                        });
                }

            },

            onEachFeature: function (feature, layer) {

                var saveFn, showToolbar = false;

                if (licens === "gispro" || licens === "gispremium") {

                    layer.on("click", function (e) {

                        // When selecting a feature, clear selects
                        me.clearAllSelectLayers();

                        //Disable reset selected style on other layers
                        Object.keys(store).map(function (k) {
                            $.each(store[k].layer._layers, function (i, v) {
                                store[k].layer.resetStyle(v);

                            });
                        });

                        var clickBounds = L.latLngBounds(e.latlng, e.latlng), intersectingFeatures = [],
                            res = [156543.033928, 78271.516964, 39135.758482, 19567.879241, 9783.9396205,
                                4891.96981025, 2445.98490513, 1222.99245256, 611.496226281, 305.748113141, 152.87405657,
                                76.4370282852, 38.2185141426, 19.1092570713, 9.55462853565, 4.77731426782, 2.38865713391,
                                1.19432856696, 0.597164283478, 0.298582141739, 0.149291, 0.074645535],
                            distance = 3 * res[cloud.get().getZoom()];

                        for (var l in mapObj._layers) {
                            var overlay = mapObj._layers[l];
                            if (overlay._layers) {
                                for (var f in overlay._layers) {
                                    var feature = overlay._layers[f];
                                    var bounds;
                                    if (feature.getBounds) {
                                        bounds = feature.getBounds();
                                    }
                                    else if (feature._latlng) {
                                        let circle = new L.circle(feature._latlng, {radius: distance});
                                        // DIRTY HACK
                                        circle.addTo(mapObj);
                                        bounds = circle.getBounds();
                                        circle.removeFrom(mapObj);
                                    }
                                    if (bounds && clickBounds.intersects(bounds) && overlay.id) {
                                        intersectingFeatures.push([feature, overlay.id]);
                                    }
                                }
                            }
                        }

                        // if at least one feature found, show it
                        if (intersectingFeatures.length) {
                            if (intersectingFeatures.length === 1 && editMode === false) {
                                table[id].object.trigger("selected" + "_" + table[id].uid, e.target._leaflet_id);
                                history.pushState(null, null, anchor.init() + "¤" + e.target.feature.properties.GELink.split("?")[1]);
                                console.log("GEMessage:select:" + e.target.feature.properties.GELink.split("?")[1]);
                            } else {
                                var html = "Fundne entiteter: " + intersectingFeatures.length + "<br/>" + intersectingFeatures.map(function (o) {
                                    var obj = o[0].feature.properties;
                                    if (editMode) {
                                        return '<div style="white-space: nowrap;"><span>' + obj[Object.keys(obj)[0]] + ', ' + obj[Object.keys(obj)[1]] + '</span><button data-toggle="tooltip" data-placement="right" title="Ændre entity" class="btn btn-primary btn-xs ge-start-edit-' + o[0].feature.properties.SeqNo + '"><i class="fa fa-pencil-alt" aria-hidden="true"></i></button><button data-toggle="tooltip" data-placement="right" title="Slet entity" class="btn btn-primary btn-xs ge-delete-' + o[0].feature.properties.SeqNo + '"><i class="fa fa-trash" aria-hidden="true"></i></button><button data-toggle="tooltip" data-placement="right" title="Vis entity i GE" class="btn btn-primary btn-xs ge-select-' + o[0].feature.properties.SeqNo + '"><i class="fa fa-arrow-right" aria-hidden="true"></i></button></div>'
                                    } else {
                                        return '<div style="white-space: nowrap;"><span>' + obj[Object.keys(obj)[0]] + ', ' + obj[Object.keys(obj)[1]] + '</span><button data-toggle="tooltip" data-placement="right" title="Vis entity i GE" class="btn btn-primary btn-xs ge-select-' + o[0].feature.properties.SeqNo + '"><i class="fa fa-arrow-right" aria-hidden="true"></i></button></div>'
                                    }
                                }).join('');

                                mapObj.openPopup(html, e.latlng, {
                                    offset: L.point(0, 0),
                                    maxWidth: 400
                                });
                                intersectingFeatures.map(function (o) {

                                    let id = o[1];
                                    let type = o[1];

                                    $(".ge-select-" + o[0].feature.properties.SeqNo).unbind("click.ge-delete-" + o[0].feature.properties.SeqNo).bind("click.ge-delete-" + o[0].feature.properties.SeqNo, function () {

                                        //Disable reset selected style on other layers
                                        Object.keys(store).map(function (k) {
                                            $.each(store[k].layer._layers, function (i, v) {
                                                store[k].layer.resetStyle(v);

                                            });
                                        });
                                        // Set selected style
                                        table[id].object.trigger("selected" + "_" + table[id].uid, o[0]._leaflet_id);

                                        history.pushState(null, null, anchor.init() + "¤" + o[0].feature.properties.GELink.split("?")[1]);
                                        console.log("GEMessage:select:" + o[0].feature.properties.GELink.split("?")[1]);
                                    });
                                    $(".ge-delete-" + o[0].feature.properties.SeqNo).unbind("click.ge-delete-" + o[0].feature.properties.SeqNo).bind("click.ge-delete-" + o[0].feature.properties.SeqNo, function () {

                                        me.cancelAll();

                                        if (window.confirm("Er du sikker? Dine ændringer vil ikke blive gemt!")) {
                                            // Disable editing on all layers

                                            me.commitDelete(store[id], o[0].toGeoJSON(), type, token, client).then(
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
                                    $(".ge-start-edit-" + o[0].feature.properties.SeqNo).unbind("click.ge-start-edit-" + o[0].feature.properties.SeqNo).bind("click.ge-start-edit-" + o[0].feature.properties.SeqNo, function () {
                                        try {
                                            store["s_" + id].reset();
                                        } catch (e) {
                                        }

                                        me.cancelAll();

                                        //Disable reset selected style on other layers
                                        Object.keys(store).map(function (k) {
                                            $.each(store[k].layer._layers, function (i, v) {
                                                store[k].layer.resetStyle(v);

                                            });
                                        });
                                        // Set selected style
                                        table[id].object.trigger("selected" + "_" + table[id].uid, o[0]._leaflet_id);

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

                                        if (models[mainType].geometryType !== "point" && o[0].feature.geometry.type === "Point") {
                                            alert("Zoom tættere på for at editere");
                                        }

                                        if (o[0].feature.geometry.type !== "Point") {
                                            o[0].enableEdit();
                                            cloud.get().map.closePopup();
                                            if (typeof table[type] !== "undefined") {
                                                table[type].moveEndOff();
                                            }

                                            cancelFn = function () {
                                                o[0].disableEdit();
                                                if (typeof table[type] !== "undefined") {
                                                    table[type].moveEndOn();
                                                }
                                            };

                                            saveFn = function () {
                                                o[0].disableEdit();
                                                if (typeof table[type] !== "undefined") {
                                                    table[type].moveEndOn();
                                                }
                                                return o[0].toGeoJSON();
                                            };

                                            showToolbar = true;

                                        }

                                        if (models[mainType].geometryType === "point") {

                                            try {
                                                cloud.get().map.removeLayer(marker);
                                            } catch (e) {
                                            }

                                            marker = L.marker(
                                                o[0].getLatLng(),
                                                {
                                                    icon: L.AwesomeMarkers.icon({
                                                            icon: 'arrows-alt',
                                                            markerColor: 'blue',
                                                            prefix: 'fa'
                                                        }
                                                    )
                                                }
                                            ).addTo(cloud.get().map);

                                            marker.enableEdit();

                                            cloud.get().map.closePopup();

                                            console.log("TEST: " + mainType);
                                            if (typeof table[type] !== "undefined") {
                                                table[type].moveEndOff();
                                            }

                                            cancelFn = function () {
                                                marker.disableEdit();
                                                if (typeof table[mainType] !== "undefined") {
                                                    table[type].moveEndOn();
                                                }
                                                cloud.get().map.removeLayer(marker);
                                            };

                                            saveFn = function () {
                                                marker.disableEdit();
                                                if (typeof table[mainType] !== "undefined") {
                                                    table[type].moveEndOn();
                                                }
                                                cloud.get().map.removeLayer(marker);
                                                let f = marker.toGeoJSON();
                                                f.properties = o[0].feature.properties;
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
                                                            className: 'fa fa-ban',
                                                            tooltip: 'Afbryd'
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
                                                            className: 'fa fa-floppy-o',
                                                            tooltip: 'Gem ændringer'
                                                        }
                                                    },

                                                    addHooks: function () {

                                                        var json = saveFn();
                                                        me.commitDrawing(store[id], json, type, token, client).then(
                                                            function (e) {
                                                                e.reset();
                                                                e.load();
                                                                cloud.get().map.removeLayer(toolBar);
                                                                jquery.snackbar({
                                                                    id: "snackbar-conflict",
                                                                    content: models[type].alias + " (" + json.properties.SeqNo + ") ændret",
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

                                //Disable reset selected style if multiple feature are selected
                                if (intersectingFeatures.length > 1) {
                                    setTimeout(function () {
                                        Object.keys(store).map(function (k) {
                                            $.each(store[k].layer._layers, function (i, v) {
                                                store[k].layer.resetStyle(v);

                                            });
                                        });
                                    }, 30);
                                }

                            }
                        }

                    });
                }

                layer.on({

                    mouseover: function () {

                        var fi = [];

                        $.each(feature.properties, function (name, property) {
                            if (name !== "GELink" && name !== "_id" && name !== "SeqNo" && name !== "SeqNoType") {

                                $.each(models[mainType].fields, function (i, v) {
                                    var str;
                                    if (name === "EstablishDate" ||
                                        name === "EnvApprovalDate" ||
                                        name === "LastInspectionDate" ||
                                        name === "LastInjunctionDate" ||
                                        name === "CatchPermissionPermDate" ||
                                        name === "CatchPermissionExpireDate" ||
                                        name === "LastSampleDate" ||
                                        name === "DismantleDate"
                                    ) {
                                        str = moment(feature.properties[name]).format('LL');
                                        str = str !== "Invalid date" ? str : "-";
                                    } else {
                                        str = feature.properties[name];

                                    }

                                    if (v.key === name) {
                                        fi.push({
                                            title: v.alias,
                                            value: str || "-"
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
            el: "#geoenviron-table_" + mainType,
            geocloud2: cloud.get(),
            store: store[id],
            cm: cm,
            autoUpdate: true,
            autoPan: false,
            openPopUp: false,
            setViewOnSelect: false,
            responsive: false,
            callCustomOnload: true,
            height: 400,
            locale: window._vidiLocale.replace("_", "-"),
            ns: "#" + mainType
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
                    resolve(store);
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
        if (typeof table[type] !== "undefined") {
            table[type].moveEndOff();
        }
        $("#geoenviron-table").empty();

    },


    clearAllSelectLayers: function () {
        var me = this;
        Object.keys(store).map(function (k) {
            if (k.substring(0, 2) === "s_") {
                me.clear(k);
            }
        });
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
    },
	
	createNavbut: function () {
		$('<li><a href="#" id="btn-geinfo">?</a></li>').appendTo('#main-navbar');
		}
};



